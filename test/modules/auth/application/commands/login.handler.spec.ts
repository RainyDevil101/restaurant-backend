import { LoginHandler } from '@src/modules/auth/application/commands/login.handler'
import { LoginCommand } from '@src/modules/auth/application/commands/login.command'
import type { LoginDto } from '@src/modules/auth/application/dtos/login.dto'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import type { IPasswordService } from '@src/modules/auth/domain/ports/password.service.port'
import type { ITokenService } from '@src/modules/auth/domain/ports/token.service.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { InvalidCredentialsError } from '@src/modules/auth/domain/errors/invalid-credentials.error'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('LoginHandler', () => {
  let userRepo: jest.Mocked<IUserRepository>
  let passwordService: jest.Mocked<IPasswordService>
  let tokenService: jest.Mocked<ITokenService>
  let handler: LoginHandler

  const activeUser = (overrides: Partial<{ active: boolean }> = {}) =>
    User.create(
      {
        name: 'Ana',
        email: 'ana@subito.mx',
        hashedCredential: 'stored-hash',
        role: ROLE.MESERO,
        active: overrides.active ?? true,
      },
      'user-1',
    )

  const dto = (overrides: Partial<LoginDto> = {}): LoginDto => ({
    email: 'Ana@Subito.MX',
    credential: '1234',
    ...overrides,
  })

  beforeEach(() => {
    userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    }
    tokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    }
    handler = new LoginHandler(userRepo, passwordService, tokenService)
  })

  it('returns a token and the public user on valid credentials', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser())
    passwordService.compare.mockResolvedValue(true)
    tokenService.sign.mockReturnValue('signed-token')

    const result = await handler.execute(new LoginCommand(dto()))

    expect(result.accessToken).toBe('signed-token')
    expect(result.tokenType).toBe('Bearer')
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@subito.mx',
      role: ROLE.MESERO,
      active: true,
    })
  })

  it('looks the user up by the lower-cased email', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser())
    passwordService.compare.mockResolvedValue(true)
    tokenService.sign.mockReturnValue('signed-token')

    await handler.execute(new LoginCommand(dto({ email: 'Ana@Subito.MX' })))

    expect(userRepo.findByEmail).toHaveBeenCalledWith('ana@subito.mx')
  })

  it('signs a token carrying the user id, email and role', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser())
    passwordService.compare.mockResolvedValue(true)
    tokenService.sign.mockReturnValue('signed-token')

    await handler.execute(new LoginCommand(dto()))

    expect(tokenService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'ana@subito.mx',
      role: ROLE.MESERO,
    })
  })

  it('compares the supplied credential against the stored hash', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser())
    passwordService.compare.mockResolvedValue(true)
    tokenService.sign.mockReturnValue('signed-token')

    await handler.execute(new LoginCommand(dto({ credential: '1234' })))

    expect(passwordService.compare).toHaveBeenCalledWith('1234', 'stored-hash')
  })

  it('throws InvalidCredentialsError when the email is unknown', async () => {
    userRepo.findByEmail.mockResolvedValue(null)

    await expect(handler.execute(new LoginCommand(dto()))).rejects.toThrow(InvalidCredentialsError)
    expect(passwordService.compare).not.toHaveBeenCalled()
    expect(tokenService.sign).not.toHaveBeenCalled()
  })

  it('throws InvalidCredentialsError for an inactive user without comparing the credential', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser({ active: false }))

    await expect(handler.execute(new LoginCommand(dto()))).rejects.toThrow(InvalidCredentialsError)
    expect(passwordService.compare).not.toHaveBeenCalled()
  })

  it('throws InvalidCredentialsError when the credential does not match', async () => {
    userRepo.findByEmail.mockResolvedValue(activeUser())
    passwordService.compare.mockResolvedValue(false)

    await expect(handler.execute(new LoginCommand(dto()))).rejects.toThrow(InvalidCredentialsError)
    expect(tokenService.sign).not.toHaveBeenCalled()
  })
})
