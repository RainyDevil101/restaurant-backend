import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Menu, type MenuItem } from '../../domain/entities/menu.entity'
import type { IMenuRepository } from '../../domain/ports/menu.repository.port'
import { MenuOrmEntity } from '../persistence/menu.orm-entity'

@Injectable()
export class TypeormMenuRepository implements IMenuRepository {
  constructor(
    @InjectRepository(MenuOrmEntity)
    private readonly repo: Repository<MenuOrmEntity>,
  ) {}

  private toDomain(row: MenuOrmEntity): Menu {
    return Menu.create(
      { name: row.name, items: this.normalizeItems(row.items), active: row.active, price: row.price },
      row.id,
    )
  }

  private normalizeItems(raw: MenuOrmEntity['items']): MenuItem[] {
    if (!raw) return []
    return raw.map((item) =>
      typeof item === 'string'
        ? { productId: item, quantity: 1 }
        : { productId: item.productId, quantity: item.quantity },
    )
  }

  private toOrm(menu: Menu): MenuOrmEntity {
    const row = new MenuOrmEntity()
    row.id = menu.id
    row.name = menu.name
    row.items = menu.items.map((i) => ({ ...i }))
    row.active = menu.active
    row.price = menu.price
    return row
  }

  async findAll(): Promise<Menu[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Menu | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(menu: Menu): Promise<Menu> {
    await this.repo.save(this.toOrm(menu))
    return menu
  }

  async update(menu: Menu): Promise<Menu> {
    await this.repo.save(this.toOrm(menu))
    return menu
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id })
  }

  async stamp(): Promise<{ count: number; lastModified: string | null }> {
    const row = await this.repo
      .createQueryBuilder('e')
      .select('COUNT(*)', 'count')
      .addSelect('MAX(e.updated_at)', 'lastModified')
      .getRawOne<{ count: string; lastModified: Date | null }>()
    return {
      count: Number(row?.count ?? 0),
      lastModified: row?.lastModified ? row.lastModified.toISOString() : null,
    }
  }
}
