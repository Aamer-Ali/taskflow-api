import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsNumber()
  ownerId: number;
}
