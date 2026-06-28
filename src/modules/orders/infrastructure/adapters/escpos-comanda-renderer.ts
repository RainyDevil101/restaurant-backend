import { Injectable } from '@nestjs/common'
import type {
  ComandaTicket,
  IComandaRenderer,
} from '../../domain/ports/comanda-renderer.port'
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

const COMANDA_TITLE = 'COMANDA'

@Injectable()
export class EscPosComandaRenderer implements IComandaRenderer {
  render(ticket: ComandaTicket): RenderedTicket {
    return {
      preview: this.layout(ticket).join('\n'),
      escposBase64: this.toEscPos(ticket).toString('base64'),
    }
  }

  private layout(ticket: ComandaTicket): string[] {
    const w = ticket.columns
    const out: string[] = []
    out.push(...center(COMANDA_TITLE, w))
    out.push(...center(ticket.areaName, w))
    out.push('-'.repeat(w))
    out.push(pad(`Mesa: ${ticket.tableName}`, dateLabel(ticket.dateTime), w))
    out.push('-'.repeat(w))
    for (const line of ticket.lines) {
      out.push(`${line.quantity} x ${line.name}`)
      if (line.notes && line.notes.trim()) out.push(`   * ${line.notes.trim()}`)
    }
    out.push('-'.repeat(w))
    return out
  }

  private toEscPos(ticket: ComandaTicket): Buffer {
    const bytes: number[] = []
    const write = (s: string) => encode(s).forEach((b) => bytes.push(b))
    const feed = () => bytes.push(LF)
    const w = ticket.columns

    bytes.push(ESC, 0x40)
    bytes.push(ESC, 0x61, 0x01)
    bytes.push(GS, 0x21, 0x11)
    write(COMANDA_TITLE)
    feed()
    bytes.push(GS, 0x21, 0x00)
    bytes.push(ESC, 0x45, 0x01)
    write(ticket.areaName)
    feed()
    bytes.push(ESC, 0x45, 0x00)

    bytes.push(ESC, 0x61, 0x00)
    write('-'.repeat(w))
    feed()
    write(pad(`Mesa: ${ticket.tableName}`, dateLabel(ticket.dateTime), w))
    feed()
    write('-'.repeat(w))
    feed()
    for (const line of ticket.lines) {
      bytes.push(ESC, 0x45, 0x01)
      write(`${line.quantity} x ${line.name}`)
      feed()
      bytes.push(ESC, 0x45, 0x00)
      if (line.notes && line.notes.trim()) {
        write(`   * ${line.notes.trim()}`)
        feed()
      }
    }
    write('-'.repeat(w))

    bytes.push(LF, LF, LF, LF)
    bytes.push(GS, 0x56, 0x00)
    return Buffer.from(bytes)
  }
}
