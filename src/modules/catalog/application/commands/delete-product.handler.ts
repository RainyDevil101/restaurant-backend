import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { DeleteProductCommand } from './delete-product.command'

@CommandHandler(DeleteProductCommand)
@Injectable()
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  async execute({ id }: DeleteProductCommand): Promise<void> {
    const product = await this.repo.findById(id)
    if (!product) throw new NotFoundError('Product', id)
    await this.repo.delete(id)
  }
}
