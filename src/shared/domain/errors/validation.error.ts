import { DomainError } from './domain.error'

export class ValidationError extends DomainError {
  override readonly httpStatus = 422
  readonly field: string

  constructor(field: string, reason: string) {
    super(reason)
    this.field = field
  }
}
