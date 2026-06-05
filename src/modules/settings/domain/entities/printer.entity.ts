import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRINTER_VALIDATION } from '../constants/settings-validation-messages.constants'

export type PrinterConnection = 'usb' | 'bluetooth'
export type PaperWidth = 58 | 80

export interface PrinterProps {
  name: string
  connection: PrinterConnection
  paperWidth: PaperWidth
  isDefault: boolean
}

export class Printer extends Entity {
  readonly name: string
  readonly connection: PrinterConnection
  readonly paperWidth: PaperWidth
  readonly isDefault: boolean

  private constructor(props: PrinterProps, id: string) {
    super(id)
    this.name = props.name
    this.connection = props.connection
    this.paperWidth = props.paperWidth
    this.isDefault = props.isDefault
  }

  static create(props: PrinterProps, id: string): Printer {
    if (!props.name.trim()) throw new ValidationError('name', PRINTER_VALIDATION.NAME_EMPTY)
    return new Printer(
      {
        name: props.name.trim(),
        connection: props.connection,
        paperWidth: props.paperWidth,
        isDefault: props.isDefault,
      },
      id,
    )
  }

  withDefault(isDefault: boolean): Printer {
    return Printer.create(
      {
        name: this.name,
        connection: this.connection,
        paperWidth: this.paperWidth,
        isDefault,
      },
      this.id,
    )
  }
}
