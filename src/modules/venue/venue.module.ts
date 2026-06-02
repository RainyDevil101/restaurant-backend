import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthModule } from '../auth/auth.module'
import { CreateAreaHandler } from './application/commands/create-area.handler'
import { DeleteAreaHandler } from './application/commands/delete-area.handler'
import { UpdateAreaHandler } from './application/commands/update-area.handler'
import { CreateTableHandler } from './application/commands/create-table.handler'
import { DeleteTableHandler } from './application/commands/delete-table.handler'
import { UpdateTableHandler } from './application/commands/update-table.handler'
import { UpdateTableStatusHandler } from './application/commands/update-table-status.handler'
import { ListAreasHandler } from './application/queries/list-areas.handler'
import { ListTablesHandler } from './application/queries/list-tables.handler'
import { AREA_REPOSITORY } from './domain/ports/area.repository.port'
import { TABLE_REPOSITORY } from './domain/ports/table.repository.port'
import { AreasController } from './http/areas.controller'
import { TablesController } from './http/tables.controller'
import { InMemoryAreaRepository } from './infrastructure/adapters/in-memory-area.repository'
import { InMemoryTableRepository } from './infrastructure/adapters/in-memory-table.repository'

const HANDLERS = [
  ListAreasHandler, CreateAreaHandler, UpdateAreaHandler, DeleteAreaHandler,
  ListTablesHandler, CreateTableHandler, UpdateTableHandler, UpdateTableStatusHandler, DeleteTableHandler,
]

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [AreasController, TablesController],
  providers: [
    ...HANDLERS,
    { provide: AREA_REPOSITORY, useClass: InMemoryAreaRepository },
    { provide: TABLE_REPOSITORY, useClass: InMemoryTableRepository },
  ],
  exports: [TABLE_REPOSITORY],
})
export class VenueModule {}
