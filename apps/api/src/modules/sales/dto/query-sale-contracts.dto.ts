import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommissionStatus, SaleContractStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class QuerySaleContractsDto {
  @ApiPropertyOptional({ example: "sale-profile-uuid" })
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @ApiPropertyOptional({ example: "CON-2026" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SaleContractStatus })
  @IsOptional()
  @IsEnum(SaleContractStatus)
  contractStatus?: SaleContractStatus;

  @ApiPropertyOptional({ enum: CommissionStatus })
  @IsOptional()
  @IsEnum(CommissionStatus)
  commissionStatus?: CommissionStatus;

  @ApiPropertyOptional({ example: "2026-01-01" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
