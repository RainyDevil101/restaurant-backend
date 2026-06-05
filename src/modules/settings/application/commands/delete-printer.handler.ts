import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import {
  PRINTER_REPOSITORY,
  type IPrinterRepository,
} from '../../domain/ports/printer.repository.port'
import { DeletePrinterCommand } from './delete-printer.command'

@CommandHandler(DeletePrinterCommand)
@Injectable()
export class DeletePrinterHandler implements ICommandHandler<DeletePrinterCommand> {
  constructor(@Inject(PRINTER_REPOSITORY) private readonly repo: IPrinterRepository) {}

  async execute({ id }: DeletePrinterCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
