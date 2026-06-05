import type { Printer } from '../entities/printer.entity'

export const PRINTER_REPOSITORY = Symbol('PRINTER_REPOSITORY')

export interface IPrinterRepository {
  findAll(): Promise<Printer[]>
  findById(id: string): Promise<Printer | null>
  save(printer: Printer): Promise<Printer>
  update(printer: Printer): Promise<Printer>
  delete(id: string): Promise<void>
  clearDefaults(): Promise<void>
}
