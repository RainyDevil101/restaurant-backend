import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ReceiptSettings,
  RECEIPT_SETTINGS_ID,
} from '../../domain/entities/receipt-settings.entity'
import type { IReceiptSettingsRepository } from '../../domain/ports/receipt-settings.repository.port'
import { ReceiptSettingsOrmEntity } from '../persistence/receipt-settings.orm-entity'

@Injectable()
export class TypeormReceiptSettingsRepository implements IReceiptSettingsRepository {
  constructor(
    @InjectRepository(ReceiptSettingsOrmEntity)
    private readonly repo: Repository<ReceiptSettingsOrmEntity>,
  ) {}

  private toDomain(row: ReceiptSettingsOrmEntity): ReceiptSettings {
    return ReceiptSettings.create(
      {
        businessName: row.businessName,
        address: row.address,
        footer: row.footer,
      },
      row.id,
    )
  }

  private toOrm(settings: ReceiptSettings): ReceiptSettingsOrmEntity {
    const row = new ReceiptSettingsOrmEntity()
    row.id = RECEIPT_SETTINGS_ID
    row.businessName = settings.businessName
    row.address = settings.address
    row.footer = settings.footer
    return row
  }

  async get(): Promise<ReceiptSettings | null> {
    const row = await this.repo.findOneBy({ id: RECEIPT_SETTINGS_ID })
    return row ? this.toDomain(row) : null
  }

  async save(settings: ReceiptSettings): Promise<ReceiptSettings> {
    await this.repo.save(this.toOrm(settings))
    return settings
  }
}
