export const WS_NAMESPACE = '/orders'

export const WS_ROOM = {
  CHECKOUT: 'checkout',
} as const

export const WS_EVENT = {
  JOIN_CHECKOUT: 'joinCheckout',
  JOINED_CHECKOUT: 'joinedCheckout',
  ORDER_CREATED: 'orderCreated',
  ORDER_STATUS_CHANGED: 'orderStatusChanged',
} as const
