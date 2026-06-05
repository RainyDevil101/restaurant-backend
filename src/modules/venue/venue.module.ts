import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
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
import { TypeormAreaRepository } from './infrastructure/adapters/typeorm-area.repository'
import { TypeormTableRepository } from './infrastructure/adapters/typeorm-table.repository'
import { AreaOrmEntity } from './infrastructure/persistence/area.orm-entity'
import { TableOrmEntity } from './infrastructure/persistence/table.orm-entity'

const HANDLERS = [
  ListAreasHandler, CreateAreaHandler, UpdateAreaHandler, DeleteAreaHandler,
  ListTablesHandler, CreateTableHandler, UpdateTableHandler, UpdateTableStatusHandler, DeleteTableHandler,
]

@Module({
  imports: [CqrsModule, AuthModule, TypeOrmModule.forFeature([AreaOrmEntity, TableOrmEntity])],
  controllers: [AreasController, TablesController],
  providers: [
    ...HANDLERS,
    { provide: AREA_REPOSITORY, useClass: TypeormAreaRepository },
    { provide: TABLE_REPOSITORY, useClass: TypeormTableRepository },
  ],
  exports: [TABLE_REPOSITORY, AREA_REPOSITORY],
})
export class VenueModule {}
