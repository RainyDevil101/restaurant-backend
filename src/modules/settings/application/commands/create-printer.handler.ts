import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { Printer } from '../../domain/entities/printer.entity'
import {
  PRINTER_REPOSITORY,
  type IPrinterRepository,
} from '../../domain/ports/printer.repository.port'
import { CreatePrinterCommand } from './create-printer.command'

@CommandHandler(CreatePrinterCommand)
@Injectable()
export class CreatePrinterHandler implements ICommandHandler<CreatePrinterCommand> {
  constructor(@Inject(PRINTER_REPOSITORY) private readonly repo: IPrinterRepository) {}

  async execute({ dto }: CreatePrinterCommand): Promise<Printer> {
    const makeDefault = dto.isDefault === true || (await this.repo.findAll()).length === 0
    if (makeDefault) await this.repo.clearDefaults()
    return this.repo.save(
      Printer.create(
        {
          name: dto.name,
          connection: dto.connection,
          paperWidth: dto.paperWidth,
          isDefault: makeDefault,
        },
        randomUUID(),
      ),
    )
  }
}
