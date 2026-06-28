import { Injectable } from '@nestjs/common'
import type {
  IReceiptRenderer,
  ReceiptTicket,
} from '../../domain/ports/receipt-renderer.port'
import type { RenderedTicket } from '../../../../shared/domain/rendered-ticket'
import {
  ESC,
  GS,
  LF,
  center,
  dateLabel,
  encode,
  pad,
} from '../../../../shared/infrastructure/printing/escpos'
import { RECEIPT_LABELS } from '../../application/constants/billing-labels.constants'

@Injectable()
export class EscPosReceiptRenderer implements IReceiptRenderer {
  render(ticket: ReceiptTicket): RenderedTicket {
    return {
      preview: this.layout(ticket).join('\n'),
      escposBase64: this.toEscPos(ticket).toString('base64'),
    }
  }

  private layout(ticket: ReceiptTicket): string[] {
    const w = ticket.columns
    const out: string[] = []
    out.push(...center(ticket.businessName, w))
    if (ticket.address.trim()) out.push(...center(ticket.address, w))
    if (ticket.title) out.push(...center(ticket.title, w))
    out.push('-'.repeat(w))
    out.push(pad(`${RECEIPT_LABELS.TABLE_PREFIX} ${ticket.tableName}`, dateLabel(ticket.dateTime), w))
    out.push('-'.repeat(w))
    for (const line of ticket.lines) {
      out.push(pad(this.itemLeft(line), this.money(line.subtotal), w))
    }
    out.push('-'.repeat(w))
    out.push(pad(RECEIPT_LABELS.TOTAL, this.money(ticket.total), w))
    if (ticket.payment) {
      out.push(pad(RECEIPT_LABELS.METHOD, ticket.payment.methodLabel, w))
      out.push(pad(RECEIPT_LABELS.PAYMENT, this.money(ticket.payment.amountPaid), w))
      if (ticket.payment.change !== undefined) {
        out.push(pad(RECEIPT_LABELS.CHANGE, this.money(ticket.payment.change), w))
      }
    }
    out.push('')
    if (ticket.footer.trim()) out.push(...center(ticket.footer, w))
    return out
  }

  private itemLeft(line: { quantity: number; name: string; isCombo: boolean }): string {
    return `${line.quantity} x ${line.name}${line.isCombo ? RECEIPT_LABELS.COMBO_SUFFIX : ''}`
  }

  private money(n: number): string {
    return `$${Math.round(n).toLocaleString('es-CL')}`
  }

  private toEscPos(ticket: ReceiptTicket): Buffer {
    const bytes: number[] = []
    const write = (s: string) => encode(s).forEach((b) => bytes.push(b))
    const feed = () => bytes.push(LF)
    const w = ticket.columns

    bytes.push(ESC, 0x40)
    bytes.push(ESC, 0x61, 0x01)
    bytes.push(ESC, 0x45, 0x01)
    write(ticket.businessName)
    feed()
    bytes.push(ESC, 0x45, 0x00)
    if (ticket.address.trim()) {
      write(ticket.address)
      feed()
    }
    if (ticket.title) {
      bytes.push(ESC, 0x45, 0x01)
      write(ticket.title)
      feed()
      bytes.push(ESC, 0x45, 0x00)
    }

    bytes.push(ESC, 0x61, 0x00)
    write('-'.repeat(w))
    feed()
    write(pad(`${RECEIPT_LABELS.TABLE_PREFIX} ${ticket.tableName}`, dateLabel(ticket.dateTime), w))
    feed()
    write('-'.repeat(w))
    feed()
    for (const line of ticket.lines) {
      write(pad(this.itemLeft(line), this.money(line.subtotal), w))
      feed()
    }
    write('-'.repeat(w))
    feed()
    bytes.push(ESC, 0x45, 0x01)
    write(pad(RECEIPT_LABELS.TOTAL, this.money(ticket.total), w))
    feed()
    bytes.push(ESC, 0x45, 0x00)
    if (ticket.payment) {
      write(pad(RECEIPT_LABELS.METHOD, ticket.payment.methodLabel, w))
      feed()
      write(pad(RECEIPT_LABELS.PAYMENT, this.money(ticket.payment.amountPaid), w))
      feed()
      if (ticket.payment.change !== undefined) {
        write(pad(RECEIPT_LABELS.CHANGE, this.money(ticket.payment.change), w))
        feed()
      }
    }

    feed()
    if (ticket.footer.trim()) {
      bytes.push(ESC, 0x61, 0x01)
      write(ticket.footer)
      feed()
    }
    bytes.push(LF, LF, LF, LF)
    bytes.push(GS, 0x56, 0x00)
    return Buffer.from(bytes)
  }
}
