import type { CreatePrinterDto } from '../dtos/printer.dto'

export class CreatePrinterCommand {
  constructor(readonly dto: CreatePrinterDto) {}
}
