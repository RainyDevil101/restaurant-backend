import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import type { PaymentMethodValue } from '../../domain/entities/payment.entity'

export const RECEIPT_LABELS = {
  RECEIPT_TITLE: 'RECIBO DE PAGO',
  TABLE_PREFIX: 'Mesa:',
  TOTAL: 'TOTAL',
  METHOD: 'Metodo',
  PAYMENT: 'Pago',
  CHANGE: 'Cambio',
  COMBO_SUFFIX: ' (combo)',
} as const

const METHOD_LABELS: Record<PaymentMethodValue, string> = {
  [PAYMENT_METHOD.CASH]: 'Efectivo',
  [PAYMENT_METHOD.CARD]: 'Tarjeta',
}

export function paymentMethodLabel(method: PaymentMethodValue): string {
  return METHOD_LABELS[method]
}
