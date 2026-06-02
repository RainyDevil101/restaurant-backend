import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Category } from '../../domain/entities/category.entity'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { ListCategoriesQuery } from './list-categories.query'

@QueryHandler(ListCategoriesQuery)
@Injectable()
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly repo: ICategoryRepository) {}

  execute(): Promise<Category[]> {
    return this.repo.findAll()
  }
}
