import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Printer,
  type PaperWidth,
  type PrinterConnection,
} from '../../domain/entities/printer.entity'
import type { IPrinterRepository } from '../../domain/ports/printer.repository.port'
import { PrinterOrmEntity } from '../persistence/printer.orm-entity'

@Injectable()
export class TypeormPrinterRepository implements IPrinterRepository {
  constructor(
    @InjectRepository(PrinterOrmEntity)
    private readonly repo: Repository<PrinterOrmEntity>,
  ) {}

  private toDomain(row: PrinterOrmEntity): Printer {
    return Printer.create(
      {
        name: row.name,
        connection: row.connection as PrinterConnection,
        paperWidth: row.paperWidth as PaperWidth,
        isDefault: row.isDefault,
      },
      row.id,
    )
  }

  private toOrm(printer: Printer): PrinterOrmEntity {
    const row = new PrinterOrmEntity()
    row.id = printer.id
    row.name = printer.name
    row.connection = printer.connection
    row.paperWidth = printer.paperWidth
    row.isDefault = printer.isDefault
    return row
  }

  async findAll(): Promise<Printer[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Printer | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(printer: Printer): Promise<Printer> {
    await this.repo.save(this.toOrm(printer))
    return printer
  }

  async update(printer: Printer): Promise<Printer> {
    await this.repo.save(this.toOrm(printer))
    return printer
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id })
  }

  async clearDefaults(): Promise<void> {
    await this.repo.update({ isDefault: true }, { isDefault: false })
  }
}
