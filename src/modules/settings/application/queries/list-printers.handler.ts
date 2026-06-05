import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Printer } from '../../domain/entities/printer.entity'
import {
  PRINTER_REPOSITORY,
  type IPrinterRepository,
} from '../../domain/ports/printer.repository.port'
import { ListPrintersQuery } from './list-printers.query'

@QueryHandler(ListPrintersQuery)
@Injectable()
export class ListPrintersHandler implements IQueryHandler<ListPrintersQuery> {
  constructor(@Inject(PRINTER_REPOSITORY) private readonly repo: IPrinterRepository) {}

  execute(): Promise<Printer[]> {
    return this.repo.findAll()
  }
}
