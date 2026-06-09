import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SaleContractStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";

export class CreateSaleContractDto {
  @ApiProperty({ example: "CON-2026-0001" })
  @IsString()
  @MinLength(3)
  contractCode!: string;

  @ApiProperty({ example: "sale-profile-uuid" })
  @IsUUID()
  saleId!: string;

  @ApiPropertyOptional({ example: "apartment-uuid" })
  @IsOptional()
  @IsUUID()
  apartmentId?: string;

  @ApiPropertyOptional({ example: "room-uuid" })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  @MinLength(2)
  customerName!: string;

  @ApiPropertyOptional({ example: "0909999999" })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: "2026-06-01" })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: "2027-06-01" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 12000000 })
  @IsNumber()
  @Min(0)
  contractValue!: number;

  @ApiProperty({ example: 1200000 })
  @IsNumber()
  @Min(0)
  commissionAmount!: number;

  @ApiPropertyOptional({ enum: SaleContractStatus, default: SaleContractStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SaleContractStatus)
  contractStatus?: SaleContractStatus;

  @ApiPropertyOptional({ example: "Commission for first month rent." })
  @IsOptional()
  @IsString()
  note?: string;
}
