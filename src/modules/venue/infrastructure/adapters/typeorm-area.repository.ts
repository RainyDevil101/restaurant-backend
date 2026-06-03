import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Area } from '../../domain/entities/area.entity'
import type { IAreaRepository } from '../../domain/ports/area.repository.port'
import { AreaOrmEntity } from '../persistence/area.orm-entity'

@Injectable()
export class TypeormAreaRepository implements IAreaRepository {
  constructor(
    @InjectRepository(AreaOrmEntity)
    private readonly repo: Repository<AreaOrmEntity>,
  ) {}

  private toDomain(row: AreaOrmEntity): Area {
    return Area.create({ name: row.name }, row.id)
  }

  private toOrm(area: Area): AreaOrmEntity {
    const row = new AreaOrmEntity()
    row.id = area.id
    row.name = area.name
    return row
  }

  async findAll(): Promise<Area[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Area | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(area: Area): Promise<Area> {
    await this.repo.save(this.toOrm(area))
    return area
  }

  async update(area: Area): Promise<Area> {
    await this.repo.save(this.toOrm(area))
    return area
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id })
  }
}
