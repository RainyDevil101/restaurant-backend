export const USER_ENTITY_NAME = 'Usuario'

export const USER_ERROR = {
  EMAIL_EXISTS: 'Ya existe un usuario con este correo',
  CANNOT_DEACTIVATE_SELF: 'No puedes desactivar tu propia cuenta',
  CANNOT_MODIFY_OWNER: 'La cuenta del dueño no puede ser modificada por otro usuario',
} as const
