import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Area } from '../../domain/entities/area.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { ListAreasQuery } from './list-areas.query'

@QueryHandler(ListAreasQuery)
@Injectable()
export class ListAreasHandler implements IQueryHandler<ListAreasQuery> {
  constructor(@Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository) {}

  execute(): Promise<Area[]> {
    return this.repo.findAll()
  }
}
