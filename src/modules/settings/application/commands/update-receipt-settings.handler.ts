import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import {
  ReceiptSettings,
  RECEIPT_SETTINGS_ID,
} from '../../domain/entities/receipt-settings.entity'
import {
  RECEIPT_SETTINGS_REPOSITORY,
  type IReceiptSettingsRepository,
} from '../../domain/ports/receipt-settings.repository.port'
import { RECEIPT_DEFAULTS } from '../constants/settings-messages.constants'
import { UpdateReceiptSettingsCommand } from './update-receipt-settings.command'

@CommandHandler(UpdateReceiptSettingsCommand)
@Injectable()
export class UpdateReceiptSettingsHandler
  implements ICommandHandler<UpdateReceiptSettingsCommand>
{
  constructor(
    @Inject(RECEIPT_SETTINGS_REPOSITORY) private readonly repo: IReceiptSettingsRepository,
  ) {}

  async execute({ dto }: UpdateReceiptSettingsCommand): Promise<ReceiptSettings> {
    const current =
      (await this.repo.get()) ??
      ReceiptSettings.create(
        {
          businessName: RECEIPT_DEFAULTS.BUSINESS_NAME,
          address: RECEIPT_DEFAULTS.ADDRESS,
          footer: RECEIPT_DEFAULTS.FOOTER,
        },
        RECEIPT_SETTINGS_ID,
      )

    return this.repo.save(
      ReceiptSettings.create(
        {
          businessName: dto.businessName ?? current.businessName,
          address: dto.address ?? current.address,
          footer: dto.footer ?? current.footer,
        },
        RECEIPT_SETTINGS_ID,
      ),
    )
  }
}
