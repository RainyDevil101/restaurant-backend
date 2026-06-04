import { DomainError } from './domain.error'

export class NotFoundError extends DomainError {
  override readonly httpStatus = 404

  constructor(entity: string, identifier: string) {
    super(`No se encontró ${entity} con identificador "${identifier}"`)
  }
}
