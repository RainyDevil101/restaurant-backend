import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Product } from '../../domain/entities/product.entity'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdateProductCommand } from './update-product.command'

@CommandHandler(UpdateProductCommand)
@Injectable()
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  async execute({ id, dto }: UpdateProductCommand): Promise<Product> {
    const product = await this.repo.findById(id)
    if (!product) throw new NotFoundError(ENTITY_NAME.PRODUCT, id)
    return this.repo.update(product.update(dto))
  }
}
