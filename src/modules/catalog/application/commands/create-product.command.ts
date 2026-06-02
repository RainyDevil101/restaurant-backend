import type { CreateProductDto } from '../dtos/product.dto'

export class CreateProductCommand {
  constructor(readonly dto: CreateProductDto) {}
}
