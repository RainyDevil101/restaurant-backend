export class GetPrecheckQuery {
  constructor(
    readonly tableId: string,
    readonly paperWidth: number,
  ) {}
}
