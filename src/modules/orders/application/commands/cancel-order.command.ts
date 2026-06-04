export class CancelOrderCommand {
  constructor(
    readonly orderId: string,
    readonly reason: string,
    readonly adminEmail: string,
    readonly adminCredential: string,
  ) {}
}
