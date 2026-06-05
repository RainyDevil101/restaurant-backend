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

export interface RenderedComanda {
  preview: string
  escposBase64: string
}

export interface IComandaRenderer {
  render(ticket: ComandaTicket): RenderedComanda
}
