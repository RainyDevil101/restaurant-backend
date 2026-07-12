import { UnlockUserHandler } from '@src/modules/users/application/commands/unlock-user.handler'
import { UnlockUserCommand } from '@src/modules/users/application/commands/unlock-user.command'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('UnlockUserHandler', () => {
  let repo: jest.Mocked<IUserRepository>
  let handler: UnlockUserHandler

  const lockedUser = () =>
    User.create(
      {
        name: 'Ana',
        email: 'ana@subito.cl',
        hashedCredential: 'hash',
        role: ROLE.MESERO,
        active: true,
        isOwner: false,
        failedAttempts: 6,
        lockedUntil: new Date('2026-01-01T00:10:00Z'),
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
    handler = new UnlockUserHandler(repo)
  })

  it('throws NotFoundError when the user does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new UnlockUserCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('clears the counter and the lock and returns the public user', async () => {
    repo.findById.mockResolvedValue(lockedUser())
    repo.update.mockImplementation((user) => Promise.resolve(user))

    const result = await handler.execute(new UnlockUserCommand('user-1'))

    const persisted = repo.update.mock.calls[0]![0] as User
    expect(persisted.failedAttempts).toBe(0)
    expect(persisted.lockedUntil).toBeNull()
    expect(result.lockedUntil).toBeNull()
    expect(result).not.toHaveProperty('hashedCredential')
  })

  it('unlocks an owner as well, so a locked owner is always recoverable', async () => {
    repo.findById.mockResolvedValue(
      User.create(
        {
          name: 'Dueño',
          email: 'admin@subito.cl',
          hashedCredential: 'hash',
          role: ROLE.ADMIN,
          active: true,
          isOwner: true,
          failedAttempts: 6,
          lockedUntil: new Date('2026-01-01T00:10:00Z'),
        },
        'user-owner',
      ),
    )
    repo.update.mockImplementation((user) => Promise.resolve(user))

    const result = await handler.execute(new UnlockUserCommand('user-owner'))

    expect(result.lockedUntil).toBeNull()
  })
})
