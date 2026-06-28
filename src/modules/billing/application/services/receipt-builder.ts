import type { ReceiptLine } from '../../domain/ports/receipt-renderer.port'
import type { RenderedTicket } from '../../../../shared/domain/rendered-ticket'
import { RECEIPT_DEFAULTS } from '../../../settings/application/constants/settings-messages.constants'
import { ITEM_KIND, type ItemKind } from '../../../../shared/constants/item-kind.constants'

export interface ReceiptDto extends RenderedTicket {
  paperWidth: number
}

export interface ReceiptHeader {
  businessName: string
  address: string
  footer: string
}

export function receiptHeader(
  settings: { businessName?: string; address?: string; footer?: string } | null,
): ReceiptHeader {
  return {
    businessName: settings?.businessName ?? RECEIPT_DEFAULTS.BUSINESS_NAME,
    address: settings?.address ?? RECEIPT_DEFAULTS.ADDRESS,
    footer: settings?.footer ?? RECEIPT_DEFAULTS.FOOTER,
  }
}

export function toReceiptLine(item: {
  quantity: number
  productName: string
  subtotal: number
  kind?: ItemKind
}): ReceiptLine {
  return {
    quantity: item.quantity,
    name: item.productName,
    subtotal: item.subtotal,
    isCombo: item.kind === ITEM_KIND.COMBO,
  }
}
