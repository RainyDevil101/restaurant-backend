import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as bcrypt from 'bcryptjs'
import { AppModule } from '../app.module'

/** Lower rounds than production (BcryptPasswordAdapter uses 12) — intentional for seed speed */
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
  { id: 'area-1', name: 'Terraza' },
  { id: 'area-2', name: 'Interior' },
]

const TABLES = [
  { id: 'table-1', name: 'Mesa 1', capacity: 2, status: TABLE_STATUS.FREE, areaId: 'area-1' },
  { id: 'table-2', name: 'Mesa 2', capacity: 4, status: TABLE_STATUS.OCCUPIED, areaId: 'area-1' },
  { id: 'table-3', name: 'Mesa 3', capacity: 8, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-1' },
  { id: 'table-4', name: 'Mesa 4', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-1' },
  { id: 'table-5', name: 'Mesa 5', capacity: 2, status: TABLE_STATUS.OCCUPIED, areaId: 'area-2' },
  { id: 'table-6', name: 'Mesa 6', capacity: 4, status: TABLE_STATUS.OCCUPIED, areaId: 'area-2' },
  { id: 'table-7', name: 'Mesa 7', capacity: 2, status: TABLE_STATUS.FREE, areaId: 'area-2' },
  { id: 'table-8', name: 'Mesa 8', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-2' },
]

const CATEGORIES = [
  { id: 'cat-1', name: 'Entradas' },
  { id: 'cat-2', name: 'Platos fuertes' },
  { id: 'cat-3', name: 'Bebidas' },
  { id: 'cat-4', name: 'Postres' },
]

const PRODUCTS = [
  { id: 'prod-1', name: 'Guacamole', description: 'Con totopos', price: 85, categoryId: 'cat-1', available: true },
  { id: 'prod-2', name: 'Sopa de tortilla', description: 'Con crema y queso', price: 75, categoryId: 'cat-1', available: true },
  { id: 'prod-3', name: 'Flautas', description: 'Pollo o papa, 3 pzas', price: 90, categoryId: 'cat-1', available: true },
  { id: 'prod-4', name: 'Carne asada', description: '300g con guarnición', price: 220, categoryId: 'cat-2', available: true },
  { id: 'prod-5', name: 'Pollo a la plancha', description: 'Con arroz y ensalada', price: 175, categoryId: 'cat-2', available: true },
  { id: 'prod-6', name: 'Enchiladas verdes', description: 'Pollo, crema y queso', price: 140, categoryId: 'cat-2', available: true },
  { id: 'prod-7', name: 'Quesadillas', description: 'Con queso Oaxaca', price: 120, categoryId: 'cat-2', available: false },
  { id: 'prod-8', name: 'Agua fresca', description: 'Jamaica, horchata o tamarindo', price: 35, categoryId: 'cat-3', available: true },
  { id: 'prod-9', name: 'Refresco', description: 'Lata 355ml', price: 30, categoryId: 'cat-3', available: true },
  { id: 'prod-10', name: 'Cerveza', description: 'Botella 355ml', price: 55, categoryId: 'cat-3', available: true },
  { id: 'prod-11', name: 'Agua mineral', description: 'Botella 500ml', price: 25, categoryId: 'cat-3', available: true },
  { id: 'prod-12', name: 'Flan napolitano', description: 'Con cajeta', price: 65, categoryId: 'cat-4', available: true },
  { id: 'prod-13', name: 'Pastel de chocolate', description: 'Rebanada', price: 70, categoryId: 'cat-4', available: true },
]

const MENUS = [
  {
    id: 'menu-1',
    name: 'Menú principal',
    active: true,
    price: 199,
    productIds: PRODUCTS.filter((p) => p.available).map((p) => p.id),
  },
  { id: 'menu-2', name: 'Menú de temporada', active: false, price: 149, productIds: ['prod-1', 'prod-4', 'prod-8', 'prod-10'] },
]

const USERS = [
  { id: 'user-1', name: 'Ana', email: 'ana@subito.mx', role: ROLE.MESERO, active: true, isOwner: false, credential: '1234' },
  { id: 'user-2', name: 'Carlos', email: 'carlos@subito.mx', role: ROLE.CAJERO, active: true, isOwner: false, credential: '1234' },
  { id: 'user-3', name: 'Roberto', email: 'admin@subito.mx', role: ROLE.ADMIN, active: true, isOwner: true, credential: 'admin' },
  { id: 'user-4', name: 'Pedro', email: 'pedro@subito.mx', role: ROLE.MESERO, active: false, isOwner: false, credential: '5678' },
]

const ORDERS = [
  {
    id: 'order-1', tableId: 'table-2', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:10:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-1', productId: 'prod-1', productName: 'Guacamole', quantity: 1, unitPrice: 85, subtotal: 85, notes: 'Sin chile' },
      { itemId: 'item-2', productId: 'prod-4', productName: 'Carne asada', quantity: 2, unitPrice: 220, subtotal: 440 },
      { itemId: 'item-3', productId: 'prod-10', productName: 'Cerveza', quantity: 2, unitPrice: 55, subtotal: 110 },
    ],
  },
  {
    id: 'order-2', tableId: 'table-3', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:30:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-4', productId: 'prod-2', productName: 'Sopa de tortilla', quantity: 3, unitPrice: 75, subtotal: 225 },
      { itemId: 'item-5', productId: 'prod-6', productName: 'Enchiladas verdes', quantity: 3, unitPrice: 140, subtotal: 420 },
      { itemId: 'item-6', productId: 'prod-8', productName: 'Agua fresca', quantity: 3, unitPrice: 35, subtotal: 105 },
    ],
  },
  {
    id: 'order-3', tableId: 'table-4', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T12:00:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-7', productId: 'prod-5', productName: 'Pollo a la plancha', quantity: 2, unitPrice: 175, subtotal: 350 },
      { itemId: 'item-8', productId: 'prod-9', productName: 'Refresco', quantity: 2, unitPrice: 30, subtotal: 60 },
      { itemId: 'item-9', productId: 'prod-12', productName: 'Flan napolitano', quantity: 2, unitPrice: 65, subtotal: 130 },
    ],
  },
  {
    id: 'order-4', tableId: 'table-5', status: ORDER_STATUS.PENDING,
    createdAt: new Date('2026-06-01T12:20:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-10', productId: 'prod-3', productName: 'Flautas', quantity: 1, unitPrice: 90, subtotal: 90 },
      { itemId: 'item-11', productId: 'prod-11', productName: 'Agua mineral', quantity: 2, unitPrice: 25, subtotal: 50 },
    ],
  },
  {
    id: 'order-5', tableId: 'table-6', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:15:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-12', productId: 'prod-4', productName: 'Carne asada', quantity: 1, unitPrice: 220, subtotal: 220 },
      { itemId: 'item-13', productId: 'prod-6', productName: 'Enchiladas verdes', quantity: 1, unitPrice: 140, subtotal: 140 },
      { itemId: 'item-14', productId: 'prod-10', productName: 'Cerveza', quantity: 2, unitPrice: 55, subtotal: 110 },
    ],
  },
  {
    id: 'order-6', tableId: 'table-8', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:45:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-15', productId: 'prod-5', productName: 'Pollo a la plancha', quantity: 4, unitPrice: 175, subtotal: 700 },
      { itemId: 'item-16', productId: 'prod-8', productName: 'Agua fresca', quantity: 4, unitPrice: 35, subtotal: 140 },
      { itemId: 'item-17', productId: 'prod-13', productName: 'Pastel de chocolate', quantity: 2, unitPrice: 70, subtotal: 140 },
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
      Table.create({ name: t.name, capacity: t.capacity, status: t.status, areaId: t.areaId }, t.id),
    )
  }
  for (const c of CATEGORIES) await categoryRepo.save(Category.create({ name: c.name }, c.id))
  for (const p of PRODUCTS) {
    await productRepo.save(
      Product.create(
        { name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, available: p.available },
        p.id,
      ),
    )
  }
  for (const m of MENUS) {
    await menuRepo.save(Menu.create({ name: m.name, productIds: m.productIds, active: m.active, price: m.price }, m.id))
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
