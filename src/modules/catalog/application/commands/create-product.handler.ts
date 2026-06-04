import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { Product } from '../../domain/entities/product.entity'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { CreateProductCommand } from './create-product.command'

@CommandHandler(CreateProductCommand)
@Injectable()
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)  private readonly productRepo: IProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
  ) {}

  async execute({ dto }: CreateProductCommand): Promise<Product> {
    const category = await this.categoryRepo.findById(dto.categoryId)
    if (!category) throw new NotFoundError(ENTITY_NAME.CATEGORY, dto.categoryId)
    return this.productRepo.save(Product.create({ ...dto, available: true }, randomUUID()))
  }
}
