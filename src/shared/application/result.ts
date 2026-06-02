type OkResult<T> = { readonly ok: true; readonly value: T }
type ErrResult<E> = { readonly ok: false; readonly error: E }

export type Result<T, E extends Error = Error> = OkResult<T> | ErrResult<E>

export function ok<T>(value: T): OkResult<T> {
  return { ok: true, value }
}

export function err<E extends Error>(error: E): ErrResult<E> {
  return { ok: false, error }
}
