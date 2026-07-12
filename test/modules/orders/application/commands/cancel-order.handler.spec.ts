import { CancelOrderHandler } from '@src/modules/orders/application/commands/cancel-order.handler'
import { CancelOrderCommand } from '@src/modules/orders/application/commands/cancel-order.command'
import { Order } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import type { IOrderRepository } from '@src/modules/orders/domain/ports/order.repository.port'
import type { IOrderNotifier } from '@src/modules/orders/domain/ports/order-notifier.port'
import type { IUserRepository } from '@src/modules/users/domain/ports/user.repository.port'
import type { IPasswordService } from '@src/modules/auth/domain/ports/password.service.port'
import type { ITableRepository } from '@src/modules/venue/domain/ports/table.repository.port'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { User } from '@src/modules/users/domain/entities/user.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import { InvalidCredentialsError } from '@src/modules/auth/domain/errors/invalid-credentials.error'
import { ROLE } from '@src/shared/constants/roles.constants'

const itemInput = { productId: 'prod-1', productName: 'Tacos', quantity: 1, unitPrice: 50 }

const buildOrder = (status = ORDER_STATUS.PENDING, paid = false) => {
  const order = Order.create(
    { tableId: 'table-1', createdBy: 'user-1', status, items: [itemInput] },
    'order-1',
  )
  return paid ? order.markPaid() : order
}

const occupiedTable = () =>
  Table.create({ name: 'Mesa 1', capacity: 4, status: TABLE_STATUS.OCCUPIED }, 'table-1')

const adminUser = (overrides: Partial<{ active: boolean; role: (typeof ROLE)[keyof typeof ROLE] }> = {}) =>
  User.create(
    {
      name: 'Admin',
      email: 'admin@subito.cl',
      hashedCredential: 'stored-hash',
      role: overrides.role ?? ROLE.ADMIN,
      active: overrides.active ?? true,
      isOwner: false,
    },
    'admin-1',
  )

describe('CancelOrderHandler', () => {
  let orderRepo: jest.Mocked<IOrderRepository>
  let notifier: jest.Mocked<IOrderNotifier>
  let userRepo: jest.Mocked<IUserRepository>
  let passwordService: jest.Mocked<IPasswordService>
  let tableRepo: jest.Mocked<ITableRepository>
  let handler: CancelOrderHandler

  const command = (overrides: Partial<{ reason: string }> = {}) =>
    new CancelOrderCommand('order-1', overrides.reason ?? 'Cliente se retiró', 'Admin@Subito.CL', 'admin')

  beforeEach(() => {
    orderRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(buildOrder()),
      save: jest.fn(),
      update: jest.fn((order: Order) => Promise.resolve(order)),
    }
    notifier = { notifyNewOrder: jest.fn(), notifyStatusChanged: jest.fn() }
    userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(adminUser()),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    passwordService = { hash: jest.fn(), compare: jest.fn().mockResolvedValue(true) }
    tableRepo = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(occupiedTable()),
      save: jest.fn(),
      update: jest.fn((table: Table) => Promise.resolve(table)),
      delete: jest.fn(),
    }
    handler = new CancelOrderHandler(orderRepo, notifier, userRepo, passwordService, tableRepo)
  })

  it('cancels a pending order with valid admin credentials', async () => {
    const result = await handler.execute(command())

    expect(userRepo.findByEmail).toHaveBeenCalledWith('admin@subito.cl')
    expect(passwordService.compare).toHaveBeenCalledWith('admin', 'stored-hash')
    expect(result.status.value).toBe(ORDER_STATUS.CANCELLED)
    expect(result.cancelledBy).toBe('admin-1')
    expect(result.cancellationReason).toBe('Cliente se retiró')
    expect(result.cancelledAt).toBeInstanceOf(Date)
    expect(orderRepo.update).toHaveBeenCalledTimes(1)
    expect(notifier.notifyStatusChanged).toHaveBeenCalledWith(result)
  })

  it('cancels a delivered order', async () => {
    orderRepo.findById.mockResolvedValue(buildOrder(ORDER_STATUS.DELIVERED))

    const result = await handler.execute(command())

    expect(result.status.value).toBe(ORDER_STATUS.CANCELLED)
    expect(notifier.notifyStatusChanged).toHaveBeenCalledWith(result)
  })

  it('trims the cancellation reason', async () => {
    const result = await handler.execute(command({ reason: '   Motivo   ' }))

    expect(result.cancellationReason).toBe('Motivo')
  })

  it('throws InvalidCredentialsError when the password does not match', async () => {
    passwordService.compare.mockResolvedValue(false)

    await expect(handler.execute(command())).rejects.toThrow(InvalidCredentialsError)
    expect(orderRepo.update).not.toHaveBeenCalled()
    expect(notifier.notifyStatusChanged).not.toHaveBeenCalled()
  })

  it('throws InvalidCredentialsError when the user is not an admin', async () => {
    userRepo.findByEmail.mockResolvedValue(adminUser({ role: ROLE.CAJERO }))

    await expect(handler.execute(command())).rejects.toThrow(InvalidCredentialsError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('throws InvalidCredentialsError for an inactive admin without comparing the credential', async () => {
    userRepo.findByEmail.mockResolvedValue(adminUser({ active: false }))

    await expect(handler.execute(command())).rejects.toThrow(InvalidCredentialsError)
    expect(passwordService.compare).not.toHaveBeenCalled()
  })

  it('throws InvalidCredentialsError when the admin email is unknown', async () => {
    userRepo.findByEmail.mockResolvedValue(null)

    await expect(handler.execute(command())).rejects.toThrow(InvalidCredentialsError)
    expect(passwordService.compare).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when the order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null)

    await expect(handler.execute(command())).rejects.toThrow(NotFoundError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError when the order is already paid', async () => {
    orderRepo.findById.mockResolvedValue(buildOrder(ORDER_STATUS.DELIVERED, true))

    await expect(handler.execute(command())).rejects.toThrow(ValidationError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError when the order is already cancelled', async () => {
    orderRepo.findById.mockResolvedValue(buildOrder(ORDER_STATUS.CANCELLED))

    await expect(handler.execute(command())).rejects.toThrow(ValidationError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError when the reason is blank', async () => {
    await expect(handler.execute(command({ reason: '   ' }))).rejects.toThrow(ValidationError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('frees the table when cancelling its last active order', async () => {
    orderRepo.findAll.mockResolvedValue([buildOrder(ORDER_STATUS.CANCELLED)])

    await handler.execute(command())

    expect(orderRepo.findAll).toHaveBeenCalledWith({ tableId: 'table-1' })
    expect(tableRepo.update).toHaveBeenCalledTimes(1)
    expect(tableRepo.update.mock.calls[0][0].status.value).toBe(TABLE_STATUS.FREE)
  })

  it('keeps the table occupied when another active order remains', async () => {
    orderRepo.findAll.mockResolvedValue([
      buildOrder(ORDER_STATUS.CANCELLED),
      buildOrder(ORDER_STATUS.DELIVERED),
    ])

    await handler.execute(command())

    expect(tableRepo.update).not.toHaveBeenCalled()
  })
})
