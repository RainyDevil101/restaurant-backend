import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as bcrypt from 'bcryptjs'
import { AppModule } from '../app.module'

const SEED_BCRYPT_ROUNDS = 10
import { ROLE } from '../shared/constants/roles.constants'
import { USER_REPOSITORY, type IUserRepository } from '../modules/users/domain/ports/user.repository.port'
import { User } from '../modules/users/domain/entities/user.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../modules/venue/domain/ports/area.repository.port'
import { Area } from '../modules/venue/domain/entities/area.entity'
import { TABLE_REPOSITORY, type ITableRepository } from '../modules/venue/domain/ports/table.repository.port'
import { Table } from '../modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '../modules/venue/domain/constants/table-status.constants'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../modules/catalog/domain/ports/category.repository.port'
import { Category } from '../modules/catalog/domain/entities/category.entity'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../modules/catalog/domain/ports/product.repository.port'
import { Product } from '../modules/catalog/domain/entities/product.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../modules/catalog/domain/ports/menu.repository.port'
import { Menu } from '../modules/catalog/domain/entities/menu.entity'
import { ORDER_REPOSITORY, type IOrderRepository } from '../modules/orders/domain/ports/order.repository.port'
import { Order } from '../modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '../modules/orders/domain/constants/order-status.constants'

const AREAS = [
  { id: 'area-1', name: 'Cocina' },
  { id: 'area-2', name: 'Barra' },
]

const TABLES = [
  { id: 'table-1', name: 'Mesa 1', capacity: 2, status: TABLE_STATUS.FREE },
  { id: 'table-2', name: 'Mesa 2', capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-3', name: 'Mesa 3', capacity: 8, status: TABLE_STATUS.PENDING_PAYMENT },
  { id: 'table-4', name: 'Mesa 4', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT },
  { id: 'table-5', name: 'Mesa 5', capacity: 2, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-6', name: 'Mesa 6', capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-7', name: 'Mesa 7', capacity: 2, status: TABLE_STATUS.FREE },
  { id: 'table-8', name: 'Mesa 8', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT },
]

const CATEGORIES = [
  { id: 'cat-1', name: 'Entradas', areaId: 'area-1' },
  { id: 'cat-2', name: 'Platos fuertes', areaId: 'area-1' },
  { id: 'cat-3', name: 'Bebidas', areaId: 'area-2' },
  { id: 'cat-4', name: 'Postres', areaId: 'area-1' },
]

const PRODUCTS = [
  { id: 'prod-1', name: 'Palta', description: 'Palta reina con pollo', price: 4500, categoryId: 'cat-1', available: true },
  { id: 'prod-2', name: 'Sopa de pollo', description: 'Casera con verduras', price: 4000, categoryId: 'cat-1', available: true },
  { id: 'prod-3', name: 'Arroz', description: 'Porción de arroz graneado', price: 2500, categoryId: 'cat-1', available: true },
  { id: 'prod-4', name: 'Carne asada', description: '300g con papas fritas', price: 9900, categoryId: 'cat-2', available: true },
  { id: 'prod-5', name: 'Pollo a la plancha', description: 'Con arroz y ensalada', price: 7900, categoryId: 'cat-2', available: true },
  { id: 'prod-6', name: 'Pizza con pepperoni', description: 'Masa artesanal con pepperoni', price: 8500, categoryId: 'cat-2', available: true },
  { id: 'prod-7', name: 'Pan', description: 'Pan amasado con queso', price: 2000, categoryId: 'cat-2', available: false },
  { id: 'prod-8', name: 'Agua mineral', description: 'Con gas o sin gas', price: 1500, categoryId: 'cat-3', available: true },
  { id: 'prod-9', name: 'Bebida', description: 'Lata 350ml', price: 1800, categoryId: 'cat-3', available: true },
  { id: 'prod-10', name: 'Cerveza', description: 'Botella 350ml', price: 3500, categoryId: 'cat-3', available: true },
  { id: 'prod-11', name: 'Agua mineral', description: 'Botella 500ml', price: 1500, categoryId: 'cat-3', available: true },
  { id: 'prod-12', name: 'Flan napolitano', description: 'Casero con caramelo', price: 3500, categoryId: 'cat-4', available: true },
  { id: 'prod-13', name: 'Pastel de chocolate', description: 'Porción', price: 3800, categoryId: 'cat-4', available: true },
]

const MENUS = [
  {
    id: 'menu-1',
    name: 'Menú principal',
    active: true,
    price: 12900,
    items: PRODUCTS.filter((p) => p.available).map((p) => ({ productId: p.id, quantity: 1 })),
  },
  {
    id: 'menu-2',
    name: 'Menú de temporada',
    active: false,
    price: 9900,
    items: [
      { productId: 'prod-1', quantity: 1 },
      { productId: 'prod-4', quantity: 2 },
      { productId: 'prod-8', quantity: 1 },
      { productId: 'prod-10', quantity: 1 },
    ],
  },
]

const USERS = [
  { id: 'user-1', name: 'Ana', email: 'ana@subito.cl', role: ROLE.MESERO, active: true, isOwner: false, credential: '123456' },
  { id: 'user-2', name: 'Carlos', email: 'carlos@subito.cl', role: ROLE.CAJERO, active: true, isOwner: false, credential: '234567' },
  { id: 'user-3', name: 'Roberto', email: 'admin@subito.cl', role: ROLE.ADMIN, active: true, isOwner: true, credential: '111111' },
  { id: 'user-4', name: 'Pedro', email: 'pedro@subito.cl', role: ROLE.MESERO, active: false, isOwner: false, credential: '567890' },
]

const ORDERS = [
  {
    id: 'order-1', tableId: 'table-2', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:10:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-1', productId: 'prod-1', productName: 'Palta', quantity: 1, unitPrice: 4500, subtotal: 4500, notes: 'Sin mayo' },
      { itemId: 'item-2', productId: 'prod-4', productName: 'Carne asada', quantity: 2, unitPrice: 9900, subtotal: 19800 },
      { itemId: 'item-3', productId: 'prod-10', productName: 'Cerveza', quantity: 2, unitPrice: 3500, subtotal: 7000 },
    ],
  },
  {
    id: 'order-2', tableId: 'table-3', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:30:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-4', productId: 'prod-2', productName: 'Sopa de pollo', quantity: 3, unitPrice: 4000, subtotal: 12000 },
      { itemId: 'item-5', productId: 'prod-6', productName: 'Pizza con pepperoni', quantity: 3, unitPrice: 8500, subtotal: 25500 },
      { itemId: 'item-6', productId: 'prod-8', productName: 'Agua mineral', quantity: 3, unitPrice: 1500, subtotal: 4500 },
    ],
  },
  {
    id: 'order-3', tableId: 'table-4', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T12:00:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-7', productId: 'prod-5', productName: 'Pollo a la plancha', quantity: 2, unitPrice: 7900, subtotal: 15800 },
      { itemId: 'item-8', productId: 'prod-9', productName: 'Bebida', quantity: 2, unitPrice: 1800, subtotal: 3600 },
      { itemId: 'item-9', productId: 'prod-12', productName: 'Flan napolitano', quantity: 2, unitPrice: 3500, subtotal: 7000 },
    ],
  },
  {
    id: 'order-4', tableId: 'table-5', status: ORDER_STATUS.PENDING,
    createdAt: new Date('2026-06-01T12:20:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-10', productId: 'prod-3', productName: 'Arroz', quantity: 1, unitPrice: 2500, subtotal: 2500 },
      { itemId: 'item-11', productId: 'prod-11', productName: 'Agua mineral', quantity: 2, unitPrice: 1500, subtotal: 3000 },
    ],
  },
  {
    id: 'order-5', tableId: 'table-6', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:15:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-12', productId: 'prod-4', productName: 'Carne asada', quantity: 1, unitPrice: 9900, subtotal: 9900 },
      { itemId: 'item-13', productId: 'prod-6', productName: 'Pizza con pepperoni', quantity: 1, unitPrice: 8500, subtotal: 8500 },
      { itemId: 'item-14', productId: 'prod-10', productName: 'Cerveza', quantity: 2, unitPrice: 3500, subtotal: 7000 },
    ],
  },
  {
    id: 'order-6', tableId: 'table-8', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:45:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-15', productId: 'prod-5', productName: 'Pollo a la plancha', quantity: 4, unitPrice: 7900, subtotal: 31600 },
      { itemId: 'item-16', productId: 'prod-8', productName: 'Agua mineral', quantity: 4, unitPrice: 1500, subtotal: 6000 },
      { itemId: 'item-17', productId: 'prod-13', productName: 'Pastel de chocolate', quantity: 2, unitPrice: 3800, subtotal: 7600 },
    ],
  },
]

async function seed() {
  const logger = new Logger('Seed')
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] })

  const userRepo = app.get<IUserRepository>(USER_REPOSITORY, { strict: false })
  const areaRepo = app.get<IAreaRepository>(AREA_REPOSITORY, { strict: false })
  const tableRepo = app.get<ITableRepository>(TABLE_REPOSITORY, { strict: false })
  const categoryRepo = app.get<ICategoryRepository>(CATEGORY_REPOSITORY, { strict: false })
  const productRepo = app.get<IProductRepository>(PRODUCT_REPOSITORY, { strict: false })
  const menuRepo = app.get<IMenuRepository>(MENU_REPOSITORY, { strict: false })
  const orderRepo = app.get<IOrderRepository>(ORDER_REPOSITORY, { strict: false })

  const existing = await userRepo.findAll()
  if (existing.length > 0) {
    logger.log('Database already has users — skipping seed')
    await app.close()
    return
  }

  for (const a of AREAS) await areaRepo.save(Area.create({ name: a.name }, a.id))
  for (const t of TABLES) {
    await tableRepo.save(
      Table.create({ name: t.name, capacity: t.capacity, status: t.status }, t.id),
    )
  }
  for (const c of CATEGORIES) await categoryRepo.save(Category.create({ name: c.name, areaId: c.areaId }, c.id))
  for (const p of PRODUCTS) {
    await productRepo.save(
      Product.create(
        { name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, available: p.available },
        p.id,
      ),
    )
  }
  for (const m of MENUS) {
    await menuRepo.save(Menu.create({ name: m.name, items: m.items, active: m.active, price: m.price }, m.id))
  }
  for (const u of USERS) {
    await userRepo.save(
      User.create(
        { name: u.name, email: u.email, hashedCredential: bcrypt.hashSync(u.credential, SEED_BCRYPT_ROUNDS), role: u.role, active: u.active, isOwner: u.isOwner },
        u.id,
      ),
    )
  }
  for (const o of ORDERS) {
    await orderRepo.save(
      Order.rehydrate(
        { tableId: o.tableId, createdBy: o.createdBy, createdAt: o.createdAt, status: o.status, paid: false, items: o.items },
        o.id,
      ),
    )
  }

  logger.log(
    `Seeded ${AREAS.length} areas, ${TABLES.length} tables, ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${MENUS.length} menus, ${USERS.length} users, ${ORDERS.length} orders`,
  )
  await app.close()
}

seed().catch((err) => {
  Logger.error(err, 'Seed')
  process.exit(1)
})
