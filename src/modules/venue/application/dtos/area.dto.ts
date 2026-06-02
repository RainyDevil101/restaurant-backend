import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  name: string
}

export class UpdateAreaDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string
}
