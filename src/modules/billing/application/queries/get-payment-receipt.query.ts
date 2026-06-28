export class GetPaymentReceiptQuery {
  constructor(
    readonly paymentId: string,
    readonly paperWidth: number,
  ) {}
}
