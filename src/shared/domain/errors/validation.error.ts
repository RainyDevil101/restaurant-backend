import { DomainError } from './domain.error'

export class ValidationError extends DomainError {
  override readonly httpStatus = 422

  constructor(field: string, reason: string) {
    super(`Validation failed for "${field}": ${reason}`)
  }
}
