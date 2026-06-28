export const BILL_ERROR = {
  NO_DELIVERED_ORDERS: 'No hay pedidos entregados para esta mesa',
  ALREADY_PAID: 'Esta cuenta ya fue pagada',
  NO_ACTIVE_ORDERS: 'No hay pedidos activos en la mesa para la precuenta',
  AMOUNT_TOO_LOW: (amount: number, total: number) =>
    `El monto (${amount}) es menor que el total (${total})`,
} as const
