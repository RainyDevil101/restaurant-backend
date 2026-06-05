import { DeactivateUserHandler } from '@src/modules/users/application/commands/deactivate-user.handler'
import { DeactivateUserCommand } from '@src/modules/users/application/commands/deactivate-user.command'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('DeactivateUserHandler', () => {
  let repo: jest.Mocked<IUserRepository>
  let handler: DeactivateUserHandler

  const activeUser = () =>
    User.create(
      { name: 'Ana', email: 'ana@subito.mx', hashedCredential: 'hash', role: ROLE.MESERO, active: true, isOwner: false },
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
    handler = new DeactivateUserHandler(repo)
  })

  it('throws NotFoundError when the user does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeactivateUserCommand('missing', 'admin-1'))).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('soft-deactivates by persisting the user with active false', async () => {
    repo.findById.mockResolvedValue(activeUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await handler.execute(new DeactivateUserCommand('user-1', 'admin-1'))

    const persisted = repo.update.mock.calls[0]![0] as User
    expect(persisted.id).toBe('user-1')
    expect(persisted.active).toBe(false)
  })

  it('updates the existing record rather than performing a hard delete', async () => {
    repo.findById.mockResolvedValue(activeUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    await handler.execute(new DeactivateUserCommand('user-1', 'admin-1'))

    expect(repo.update).toHaveBeenCalledTimes(1)
    const persisted = repo.update.mock.calls[0]![0] as User
    expect(persisted.name).toBe('Ana')
    expect(persisted.email).toBe('ana@subito.mx')
    expect(persisted.hashedCredential).toBe('hash')
  })
})
