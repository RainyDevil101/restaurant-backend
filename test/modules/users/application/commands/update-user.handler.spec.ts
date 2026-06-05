import { UpdateUserHandler } from '@src/modules/users/application/commands/update-user.handler'
import { UpdateUserCommand } from '@src/modules/users/application/commands/update-user.command'
import type { UpdateUserDto } from '@src/modules/users/application/dtos/update-user.dto'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import type { IPasswordService } from '@src/modules/auth/domain/ports/password.service.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('UpdateUserHandler', () => {
  let repo: jest.Mocked<IUserRepository>
  let passwordService: jest.Mocked<IPasswordService>
  let handler: UpdateUserHandler

  const existingUser = () =>
    User.create(
      {
        name: 'Ana',
        email: 'ana@subito.mx',
        hashedCredential: 'old-hash',
        role: ROLE.MESERO,
        active: true,
        isOwner: false,
      },
      'user-1',
    )

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
    handler = new UpdateUserHandler(repo, passwordService)
  })

  const dispatch = (dto: UpdateUserDto, id = 'user-1', actorId = 'admin-1') =>
    handler.execute(new UpdateUserCommand(id, dto, actorId))

  it('throws NotFoundError when the user does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(dispatch({ name: 'New' })).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('updates only the provided fields and preserves the rest', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await dispatch({ name: 'Ana Maria' })

    const updated = repo.update.mock.calls[0]![0] as User
    expect(updated.name).toBe('Ana Maria')
    expect(updated.email).toBe('ana@subito.mx')
    expect(updated.role).toBe(ROLE.MESERO)
    expect(updated.active).toBe(true)
    expect(updated.hashedCredential).toBe('old-hash')
  })

  it('does not re-hash the credential when none is provided', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await dispatch({ name: 'Ana Maria' })

    expect(passwordService.hash).not.toHaveBeenCalled()
  })

  it('re-hashes and replaces the credential when one is provided', async () => {
    repo.findById.mockResolvedValue(existingUser())
    passwordService.hash.mockResolvedValue('new-hash')
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await dispatch({ credential: '9999' })

    expect(passwordService.hash).toHaveBeenCalledWith('9999')
    const updated = repo.update.mock.calls[0]![0] as User
    expect(updated.hashedCredential).toBe('new-hash')
  })

  it('does not re-hash when the credential is an empty string', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await dispatch({ credential: '' })

    expect(passwordService.hash).not.toHaveBeenCalled()
    const updated = repo.update.mock.calls[0]![0] as User
    expect(updated.hashedCredential).toBe('old-hash')
  })

  it('lower-cases a provided email and persists it', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.findByEmail.mockResolvedValue(null)
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await dispatch({ email: 'NewMail@Subito.MX' })

    expect(repo.findByEmail).toHaveBeenCalledWith('newmail@subito.mx')
    const updated = repo.update.mock.calls[0]![0] as User
    expect(updated.email).toBe('newmail@subito.mx')
  })

  it('allows keeping the same email when the owner is the same user', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.findByEmail.mockResolvedValue(existingUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await expect(dispatch({ email: 'ana@subito.mx' })).resolves.toMatchObject({ id: 'user-1' })
  })

  it('throws ValidationError when the email belongs to another user', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.findByEmail.mockResolvedValue(
      User.create(
        { name: 'Other', email: 'taken@subito.mx', hashedCredential: 'x', role: ROLE.CAJERO, active: true, isOwner: false },
        'user-2',
      ),
    )

    await expect(dispatch({ email: 'taken@subito.mx' })).rejects.toThrow(ValidationError)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('returns the updated user dto without the hashed credential', async () => {
    repo.findById.mockResolvedValue(existingUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    const result = await dispatch({ active: false, role: ROLE.ADMIN })

    expect(result).toEqual({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@subito.mx',
      role: ROLE.ADMIN,
      active: false,
      isOwner: false,
    })
  })
})
