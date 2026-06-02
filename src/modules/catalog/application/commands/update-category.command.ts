import type { UpdateCategoryDto } from '../dtos/category.dto'

export class UpdateCategoryCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateCategoryDto,
  ) {}
}
