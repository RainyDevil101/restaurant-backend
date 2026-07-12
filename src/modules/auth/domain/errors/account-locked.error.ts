import { DomainError } from '../../../../shared/domain/errors/domain.error'
import { AUTH_ERROR } from '../constants/auth-error-messages.constants'

export class AccountLockedError extends DomainError {
  override readonly httpStatus = 429

  constructor(retryAfterSeconds: number) {
    super(AUTH_ERROR.ACCOUNT_LOCKED(retryAfterSeconds))
  }
}
