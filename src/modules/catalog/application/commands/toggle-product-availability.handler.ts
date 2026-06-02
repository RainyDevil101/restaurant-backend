import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Product } from '../../domain/entities/product.entity'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { ToggleProductAvailabilityCommand } from './toggle-product-availability.command'

@CommandHandler(ToggleProductAvailabilityCommand)
@Injectable()
export class ToggleProductAvailabilityHandler implements ICommandHandler<ToggleProductAvailabilityCommand> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  async execute({ id }: ToggleProductAvailabilityCommand): Promise<Product> {
    const product = await this.repo.findById(id)
    if (!product) throw new NotFoundError('Product', id)
    return this.repo.update(product.toggleAvailability())
  }
}
