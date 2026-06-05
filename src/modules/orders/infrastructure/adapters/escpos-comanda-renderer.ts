import { Injectable } from '@nestjs/common'
import type {
  ComandaTicket,
  IComandaRenderer,
  RenderedComanda,
} from '../../domain/ports/comanda-renderer.port'

const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a

@Injectable()
export class EscPosComandaRenderer implements IComandaRenderer {
  render(ticket: ComandaTicket): RenderedComanda {
    return {
      preview: this.layout(ticket).join('\n'),
      escposBase64: this.toEscPos(ticket).toString('base64'),
    }
  }

  private layout(ticket: ComandaTicket): string[] {
    const w = ticket.columns
    const out: string[] = []
    out.push(...this.center('COMANDA', w))
    out.push(...this.center(ticket.areaName, w))
    out.push('-'.repeat(w))
    out.push(this.pad(`Mesa: ${ticket.tableName}`, this.dateLabel(ticket.dateTime), w))
    out.push('-'.repeat(w))
    for (const line of ticket.lines) {
      out.push(`${line.quantity} x ${line.name}`)
      if (line.notes && line.notes.trim()) out.push(`   * ${line.notes.trim()}`)
    }
    out.push('-'.repeat(w))
    return out
  }

  private pad(left: string, right: string, w: number): string {
    const room = w - right.length - 1
    const trimmed = left.length > room ? left.slice(0, Math.max(0, room)) : left
    const gap = Math.max(1, w - trimmed.length - right.length)
    return trimmed + ' '.repeat(gap) + right
  }

  private center(text: string, w: number): string[] {
    return this.wrap(text, w).map((line) => {
      const left = Math.max(0, Math.floor((w - line.length) / 2))
      return ' '.repeat(left) + line
    })
  }

  private wrap(text: string, w: number): string[] {
    const lines: string[] = []
    let current = ''
    for (const word of text.split(/\s+/)) {
      if (current && current.length + word.length + 1 > w) {
        lines.push(current)
        current = word
      } else {
        current = current ? `${current} ${word}` : word
      }
    }
    if (current) lines.push(current)
    return lines.length > 0 ? lines : ['']
  }

  private dateLabel(d: Date): string {
    const p = (x: number) => String(x).padStart(2, '0')
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
  }

  private toEscPos(ticket: ComandaTicket): Buffer {
    const bytes: number[] = []
    const write = (s: string) => this.encode(s).forEach((b) => bytes.push(b))
    const feed = () => bytes.push(LF)
    const w = ticket.columns

    bytes.push(ESC, 0x40)
    bytes.push(ESC, 0x61, 0x01)
    bytes.push(GS, 0x21, 0x11)
    write('COMANDA')
    feed()
    bytes.push(GS, 0x21, 0x00)
    bytes.push(ESC, 0x45, 0x01)
    write(ticket.areaName)
    feed()
    bytes.push(ESC, 0x45, 0x00)

    bytes.push(ESC, 0x61, 0x00)
    write('-'.repeat(w))
    feed()
    write(this.pad(`Mesa: ${ticket.tableName}`, this.dateLabel(ticket.dateTime), w))
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

  private encode(text: string): number[] {
    const ascii = text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[·•]/g, '-')
    const out: number[] = []
    for (let i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i)
      out.push(code < 128 ? code : 0x3f)
    }
    return out
  }
}
