import type { ProcessPaymentDto } from '../dtos/payment.dto'

export class ProcessPaymentCommand {
  constructor(
    readonly tableId: string,
    readonly dto: ProcessPaymentDto,
  ) {}
}
