export class DeactivateUserCommand {
  constructor(
    readonly id: string,
    readonly actorId: string,
  ) {}
}
