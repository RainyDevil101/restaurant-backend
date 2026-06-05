import type { ReceiptSettings } from '../entities/receipt-settings.entity'

export const RECEIPT_SETTINGS_REPOSITORY = Symbol('RECEIPT_SETTINGS_REPOSITORY')

export interface IReceiptSettingsRepository {
  get(): Promise<ReceiptSettings | null>
  save(settings: ReceiptSettings): Promise<ReceiptSettings>
}
