import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import {
  ReceiptSettings,
  RECEIPT_SETTINGS_ID,
} from '../../domain/entities/receipt-settings.entity'
import {
  RECEIPT_SETTINGS_REPOSITORY,
  type IReceiptSettingsRepository,
} from '../../domain/ports/receipt-settings.repository.port'
import { GetReceiptSettingsQuery } from './get-receipt-settings.query'

@QueryHandler(GetReceiptSettingsQuery)
@Injectable()
export class GetReceiptSettingsHandler implements IQueryHandler<GetReceiptSettingsQuery> {
  constructor(
    @Inject(RECEIPT_SETTINGS_REPOSITORY) private readonly repo: IReceiptSettingsRepository,
  ) {}

  async execute(): Promise<ReceiptSettings> {
    const settings = await this.repo.get()
    return (
      settings ??
      ReceiptSettings.create(
        {
          businessName: 'La Fragua del Diablo',
          address: '',
          footer: 'PRECUENTA · No válido como boleta',
        },
        RECEIPT_SETTINGS_ID,
      )
    )
  }
}
