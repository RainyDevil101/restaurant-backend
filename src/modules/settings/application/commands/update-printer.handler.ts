import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { Printer } from '../../domain/entities/printer.entity'
import {
  PRINTER_REPOSITORY,
  type IPrinterRepository,
} from '../../domain/ports/printer.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdatePrinterCommand } from './update-printer.command'

@CommandHandler(UpdatePrinterCommand)
@Injectable()
export class UpdatePrinterHandler implements ICommandHandler<UpdatePrinterCommand> {
  constructor(@Inject(PRINTER_REPOSITORY) private readonly repo: IPrinterRepository) {}

  async execute({ id, dto }: UpdatePrinterCommand): Promise<Printer> {
    const current = findOrThrow(await this.repo.findById(id), ENTITY_NAME.PRINTER, id)

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
