import { DomainError } from '../../../../shared/domain/errors/domain.error'
import { AUTH_ERROR } from '../constants/auth-error-messages.constants'

export class InvalidCredentialsError extends DomainError {
  override readonly httpStatus = 401

  constructor() {
    super(AUTH_ERROR.INVALID_CREDENTIALS)
  }
}
