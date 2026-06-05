import type { UpdateReceiptSettingsDto } from '../dtos/receipt-settings.dto'

export class UpdateReceiptSettingsCommand {
  constructor(readonly dto: UpdateReceiptSettingsDto) {}
}
