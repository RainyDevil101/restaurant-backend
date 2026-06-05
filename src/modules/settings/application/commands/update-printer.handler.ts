import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { Printer } from '../../domain/entities/printer.entity'
import {
  PRINTER_REPOSITORY,
  type IPrinterRepository,
} from '../../domain/ports/printer.repository.port'
import { PRINTER_ENTITY_NAME } from '../constants/settings-messages.constants'
import { UpdatePrinterCommand } from './update-printer.command'

@CommandHandler(UpdatePrinterCommand)
@Injectable()
export class UpdatePrinterHandler implements ICommandHandler<UpdatePrinterCommand> {
  constructor(@Inject(PRINTER_REPOSITORY) private readonly repo: IPrinterRepository) {}

  async execute({ id, dto }: UpdatePrinterCommand): Promise<Printer> {
    const current = await this.repo.findById(id)
    if (!current) throw new NotFoundError(PRINTER_ENTITY_NAME, id)

    let isDefault = current.isDefault
    if (dto.isDefault === true) {
      await this.repo.clearDefaults()
      isDefault = true
    }

    return this.repo.update(
      Printer.create(
        {
          name: dto.name ?? current.name,
          connection: dto.connection ?? current.connection,
          paperWidth: dto.paperWidth ?? current.paperWidth,
          isDefault,
        },
        id,
      ),
    )
  }
}
