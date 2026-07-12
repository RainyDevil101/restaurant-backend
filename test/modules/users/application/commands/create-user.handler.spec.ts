import { CreateUserHandler } from '@src/modules/users/application/commands/create-user.handler'
import { CreateUserCommand } from '@src/modules/users/application/commands/create-user.command'
import type { CreateUserDto } from '@src/modules/users/application/dtos/create-user.dto'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import type { IPasswordService } from '@src/modules/auth/domain/ports/password.service.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('CreateUserHandler', () => {
  let repo: jest.Mocked<IUserRepository>
  let passwordService: jest.Mocked<IPasswordService>
  let handler: CreateUserHandler

  const dto = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
    name: 'Ana',
    email: 'Ana@Subito.CL',
    role: ROLE.MESERO,
    credential: '1234',
    ...overrides,
  })

  beforeEach(() => {
    repo = {
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
    handler = new CreateUserHandler(repo, passwordService)
  })

  it('hashes the credential before saving and returns the created user dto', async () => {
    repo.findByEmail.mockResolvedValue(null)
    passwordService.hash.mockResolvedValue('hashed-1234')
    repo.save.mockImplementation((user) => Promise.resolve(user))

    const result = await handler.execute(new CreateUserCommand(dto()))

    expect(passwordService.hash).toHaveBeenCalledWith('1234')
    const saved = repo.save.mock.calls[0]![0] as User
    expect(saved.hashedCredential).toBe('hashed-1234')
    expect(result).toEqual({
      id: saved.id,
      name: 'Ana',
      email: 'ana@subito.cl',
      role: ROLE.MESERO,
      active: true,
      isOwner: false,
      lockedUntil: null,
    })
  })

  it('lower-cases the email before lookup and persistence', async () => {
    repo.findByEmail.mockResolvedValue(null)
    passwordService.hash.mockResolvedValue('hashed')
    repo.save.mockImplementation((user) => Promise.resolve(user))

    await handler.execute(new CreateUserCommand(dto({ email: 'MixedCase@Subito.CL' })))

    expect(repo.findByEmail).toHaveBeenCalledWith('mixedcase@subito.cl')
    const saved = repo.save.mock.calls[0]![0] as User
    expect(saved.email).toBe('mixedcase@subito.cl')
  })

  it('creates the user as active', async () => {
    repo.findByEmail.mockResolvedValue(null)
    passwordService.hash.mockResolvedValue('hashed')
    repo.save.mockImplementation((user) => Promise.resolve(user))

    const result = await handler.execute(new CreateUserCommand(dto()))

    expect(result.active).toBe(true)
  })

  it('throws ValidationError when the email already exists', async () => {
    repo.findByEmail.mockResolvedValue(
      User.create(
        { name: 'Existing', email: 'ana@subito.cl', hashedCredential: 'x', role: ROLE.MESERO, active: true, isOwner: false },
        'user-1',
      ),
    )

    await expect(handler.execute(new CreateUserCommand(dto()))).rejects.toThrow(ValidationError)
    expect(passwordService.hash).not.toHaveBeenCalled()
    expect(repo.save).not.toHaveBeenCalled()
  })
})
