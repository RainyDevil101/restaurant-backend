import type { RenderedTicket } from '../../../../shared/domain/rendered-ticket'

export const COMANDA_RENDERER = Symbol('COMANDA_RENDERER')

export interface ComandaLine {
  quantity: number
  name: string
  notes?: string
}

export interface ComandaTicket {
  areaName: string
  tableName: string
  dateTime: Date
  lines: ComandaLine[]
  columns: number
}

export interface IComandaRenderer {
  render(ticket: ComandaTicket): RenderedTicket
}
