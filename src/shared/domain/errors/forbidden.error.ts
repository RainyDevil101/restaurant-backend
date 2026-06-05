import { DomainError } from './domain.error'

export class ForbiddenError extends DomainError {
  readonly httpStatus = 403
}
