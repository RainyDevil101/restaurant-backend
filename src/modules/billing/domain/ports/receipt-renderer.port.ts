export const RECEIPT_RENDERER = Symbol('RECEIPT_RENDERER')

export interface ReceiptLine {
  quantity: number
  name: string
  subtotal: number
  isCombo: boolean
}

export interface ReceiptTicket {
  businessName: string
  address: string
  footer: string
  tableName: string
  dateTime: Date
  lines: ReceiptLine[]
  total: number
  columns: number
}

export interface RenderedReceipt {
  preview: string
  escposBase64: string
}

export interface IReceiptRenderer {
  render(ticket: ReceiptTicket): RenderedReceipt
}
