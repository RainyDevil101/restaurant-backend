import { DomainError } from '../../../../shared/domain/errors/domain.error'

export class InvalidCredentialsError extends DomainError {
  override readonly httpStatus = 401

  constructor() {
    super('Invalid email or credential')
  }
}
