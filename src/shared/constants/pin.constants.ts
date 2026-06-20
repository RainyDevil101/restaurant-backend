export const PIN_LENGTH = 6

/** Credentials are numeric PINs of exactly PIN_LENGTH digits for every role. */
export const PIN_REGEX = /^\d{6}$/

export const PIN_INVALID_MESSAGE = 'El PIN debe ser de 6 dígitos numéricos.'
