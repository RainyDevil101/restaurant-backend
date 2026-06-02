export class DomainError extends Error {
  /** HTTP status code this error maps to. Subclasses override as needed. */
  readonly httpStatus: number = 400

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
