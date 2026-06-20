import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../domain/entities/category.entity'
import type { ICategoryRepository } from '../../domain/ports/category.repository.port'
import { CategoryOrmEntity } from '../persistence/category.orm-entity'

@Injectable()
export class TypeormCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  private toDomain(row: CategoryOrmEntity): Category {
    return Category.create({ name: row.name, areaId: row.areaId }, row.id)
  }

  private toOrm(category: Category): CategoryOrmEntity {
    const row = new CategoryOrmEntity()
    row.id = category.id
    row.name = category.name
    row.areaId = category.areaId
    return row
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(category: Category): Promise<Category> {
    await this.repo.save(this.toOrm(category))
    return category
  }

  async update(category: Category): Promise<Category> {
    await this.repo.save(this.toOrm(category))
    return category
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
