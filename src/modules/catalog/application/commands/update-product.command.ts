import type { UpdateProductDto } from '../dtos/product.dto'

export class UpdateProductCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateProductDto,
  ) {}
}
