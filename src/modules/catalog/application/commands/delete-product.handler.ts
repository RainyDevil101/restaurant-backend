import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { DeleteProductCommand } from './delete-product.command'

@CommandHandler(DeleteProductCommand)
@Injectable()
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(MENU_REPOSITORY) private readonly menus: IMenuRepository,
  ) {}

  async execute({ id }: DeleteProductCommand): Promise<void> {
    const product = await this.products.findById(id)
    if (!product) throw new NotFoundError('Product', id)

    const menus = await this.menus.findAll()
    const referenced = menus.some((menu) => menu.productIds.includes(id))
    if (referenced) {
      throw new ValidationError('product', 'está incluido en uno o más menús y no puede eliminarse')
    }

    await this.products.delete(id)
  }
}
