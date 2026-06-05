import type { UpdatePrinterDto } from '../dtos/printer.dto'

export class UpdatePrinterCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdatePrinterDto,
  ) {}
}
