import { User, type UserProps } from '@src/modules/users/domain/entities/user.entity'
import { ROLE } from '@src/shared/constants/roles.constants'

describe('User', () => {
  const baseProps = (overrides: Partial<UserProps> = {}): UserProps => ({
    name: 'Ana',
    email: 'ana@subito.mx',
    hashedCredential: 'hashed-credential',
    role: ROLE.MESERO,
    active: true,
    isOwner: false,
    ...overrides,
  })

  describe('create', () => {
    it('builds a user exposing all props through getters', () => {
      const user = User.create(baseProps(), 'user-1')

      expect(user.id).toBe('user-1')
      expect(user.name).toBe('Ana')
      expect(user.email).toBe('ana@subito.mx')
      expect(user.hashedCredential).toBe('hashed-credential')
      expect(user.role).toBe(ROLE.MESERO)
      expect(user.active).toBe(true)
    })
  })

  describe('isPin', () => {
    it('is true for a mesero', () => {
      expect(User.create(baseProps({ role: ROLE.MESERO }), 'user-1').isPin).toBe(true)
    })

    it('is false for a cajero', () => {
      expect(User.create(baseProps({ role: ROLE.CAJERO }), 'user-1').isPin).toBe(false)
    })

    it('is false for an admin', () => {
      expect(User.create(baseProps({ role: ROLE.ADMIN }), 'user-1').isPin).toBe(false)
    })
  })

  describe('deactivate', () => {
    it('returns a new user with active set to false', () => {
      const user = User.create(baseProps({ active: true }), 'user-1')
      const deactivated = user.deactivate()

      expect(deactivated.active).toBe(false)
    })

    it('preserves identity and every other prop', () => {
      const user = User.create(baseProps({ active: true }), 'user-1')
      const deactivated = user.deactivate()

      expect(deactivated.id).toBe('user-1')
      expect(deactivated.name).toBe(user.name)
      expect(deactivated.email).toBe(user.email)
      expect(deactivated.hashedCredential).toBe(user.hashedCredential)
      expect(deactivated.role).toBe(user.role)
    })

    it('does not mutate the original user', () => {
      const user = User.create(baseProps({ active: true }), 'user-1')
      user.deactivate()

      expect(user.active).toBe(true)
    })
  })

  describe('withHashedCredential', () => {
    it('returns a new user with the replaced credential', () => {
      const user = User.create(baseProps(), 'user-1')
      const rotated = user.withHashedCredential('new-hash')

      expect(rotated.hashedCredential).toBe('new-hash')
    })

    it('preserves identity and every other prop', () => {
      const user = User.create(baseProps(), 'user-1')
      const rotated = user.withHashedCredential('new-hash')

      expect(rotated.id).toBe('user-1')
      expect(rotated.name).toBe(user.name)
      expect(rotated.email).toBe(user.email)
      expect(rotated.role).toBe(user.role)
      expect(rotated.active).toBe(user.active)
    })

    it('does not mutate the original credential', () => {
      const user = User.create(baseProps(), 'user-1')
      user.withHashedCredential('new-hash')

      expect(user.hashedCredential).toBe('hashed-credential')
    })
  })

  describe('equals', () => {
    it('is true for users sharing an id', () => {
      const a = User.create(baseProps(), 'user-1')
      const b = User.create(baseProps({ name: 'Other' }), 'user-1')

      expect(a.equals(b)).toBe(true)
    })

    it('is false for users with different ids', () => {
      const a = User.create(baseProps(), 'user-1')
      const b = User.create(baseProps(), 'user-2')

      expect(a.equals(b)).toBe(false)
    })

    it('is false when compared against undefined', () => {
      expect(User.create(baseProps(), 'user-1').equals(undefined)).toBe(false)
    })
  })
})
