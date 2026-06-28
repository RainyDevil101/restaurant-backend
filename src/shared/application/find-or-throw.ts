import { NotFoundError } from '../domain/errors/not-found.error'

export function findOrThrow<T>(value: T | null | undefined, entity: string, id: string): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(entity, id)
  }
  return value
}
