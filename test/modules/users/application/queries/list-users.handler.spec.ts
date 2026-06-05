import { ListUsersHandler } from '@src/modules/users/application/queries/list-users.handler'
import { ListUsersQuery } from '@src/modules/users/application/queries/list-users.query'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('ListUsersHandler', () => {
  let repo: jest.Mocked<IUserRepository>
  let handler: ListUsersHandler

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    handler = new ListUsersHandler(repo)
  })

  it('returns an empty array when there are no users', async () => {
    repo.findAll.mockResolvedValue([])

    expect(await handler.execute(new ListUsersQuery())).toEqual([])
  })

  it('maps each user to a dto without the hashed credential', async () => {
    repo.findAll.mockResolvedValue([
      User.create(
        { name: 'Ana', email: 'ana@subito.mx', hashedCredential: 'secret', role: ROLE.MESERO, active: true, isOwner: false },
        'user-1',
      ),
      User.create(
        { name: 'Carlos', email: 'carlos@subito.mx', hashedCredential: 'secret2', role: ROLE.CAJERO, active: false, isOwner: false },
        'user-2',
      ),
    ])

    const result = await handler.execute(new ListUsersQuery())

    expect(result).toEqual([
      { id: 'user-1', name: 'Ana', email: 'ana@subito.mx', role: ROLE.MESERO, active: true, isOwner: false },
      { id: 'user-2', name: 'Carlos', email: 'carlos@subito.mx', role: ROLE.CAJERO, active: false, isOwner: false },
    ])
    expect(result[0]).not.toHaveProperty('hashedCredential')
  })
})
