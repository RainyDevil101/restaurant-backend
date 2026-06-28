import type { RenderedTicket } from '../../../../shared/domain/rendered-ticket'

export const RECEIPT_RENDERER = Symbol('RECEIPT_RENDERER')

export interface ReceiptLine {
  quantity: number
  name: string
  subtotal: number
  isCombo: boolean
}

export interface ReceiptPaymentInfo {
  methodLabel: string
  amountPaid: number
  change?: number
}

export interface ReceiptTicket {
  businessName: string
  address: string
  footer: string
  title?: string
  tableName: string
  dateTime: Date
  lines: ReceiptLine[]
  total: number
  payment?: ReceiptPaymentInfo
  columns: number
}

export interface IReceiptRenderer {
  render(ticket: ReceiptTicket): RenderedTicket
}
