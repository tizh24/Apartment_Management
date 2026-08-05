import { ApiPropertyOptional } from "@nestjs/swagger";
import { RevenueReceivableStatus, RevenueReceivableType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryReceivablesDto {
  @ApiPropertyOptional({ description: "Search by code, description, customer, phone, room, or contract code." })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apartmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaseContractId?: string;

  @ApiPropertyOptional({ enum: RevenueReceivableType })
  @IsOptional()
  @IsEnum(RevenueReceivableType)
  type?: RevenueReceivableType;

  @ApiPropertyOptional({ enum: RevenueReceivableStatus })
  @IsOptional()
  @IsEnum(RevenueReceivableStatus)
  status?: RevenueReceivableStatus;

  @ApiPropertyOptional({ example: "2026-06-01" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: "2026-06-30" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}