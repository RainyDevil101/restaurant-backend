import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository, type FindOptionsWhere } from 'typeorm'
import { Product } from '../../domain/entities/product.entity'
import type { IProductRepository, ProductFilters } from '../../domain/ports/product.repository.port'
import { ProductOrmEntity } from '../persistence/product.orm-entity'

@Injectable()
export class TypeormProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  private toDomain(row: ProductOrmEntity): Product {
    return Product.create(
      {
        name: row.name,
        description: row.description ?? undefined,
        price: row.price,
        categoryId: row.categoryId,
        available: row.available,
      },
      row.id,
    )
  }

  private toOrm(product: Product): ProductOrmEntity {
    const row = new ProductOrmEntity()
    row.id = product.id
    row.name = product.name
    row.description = product.description ?? null
    row.price = product.price
    row.categoryId = product.categoryId
    row.available = product.available
    return row
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where: FindOptionsWhere<ProductOrmEntity> = {}
    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.available !== undefined) where.available = filters.available
    const rows = await this.repo.find({ where })
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return []
    const rows = await this.repo.find({ where: { id: In(ids) } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(product: Product): Promise<Product> {
    await this.repo.save(this.toOrm(product))
    return product
  }

  async update(product: Product): Promise<Product> {
    await this.repo.save(this.toOrm(product))
    return product
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
