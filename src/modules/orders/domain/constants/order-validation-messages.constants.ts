export const ORDER_VALIDATION = {
  ITEMS_EMPTY: 'El pedido debe tener al menos un artículo',
  CANCEL_REASON_EMPTY: 'El motivo de cancelación es obligatorio',
  CANCEL_ALREADY_PAID: 'No se puede cancelar un pedido que ya fue pagado',
  CANCEL_ALREADY_CANCELLED: 'El pedido ya se encuentra cancelado',
} as const
