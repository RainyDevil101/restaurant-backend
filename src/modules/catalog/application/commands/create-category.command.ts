import type { CreateCategoryDto } from '../dtos/category.dto'

export class CreateCategoryCommand {
  constructor(readonly dto: CreateCategoryDto) {}
}
