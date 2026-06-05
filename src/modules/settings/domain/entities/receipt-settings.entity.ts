import { Entity } from '../../../../shared/domain/entity.base'

export const RECEIPT_SETTINGS_ID = 'receipt'

export interface ReceiptSettingsProps {
  businessName: string
  address: string
  footer: string
}

export class ReceiptSettings extends Entity {
  readonly businessName: string
  readonly address: string
  readonly footer: string

  private constructor(props: ReceiptSettingsProps, id: string) {
    super(id)
    this.businessName = props.businessName
    this.address = props.address
    this.footer = props.footer
  }

  static create(props: ReceiptSettingsProps, id: string): ReceiptSettings {
    return new ReceiptSettings(props, id)
  }
}
