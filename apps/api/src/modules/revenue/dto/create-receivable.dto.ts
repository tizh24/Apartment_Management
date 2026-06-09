import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RevenueReceivableType } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateReceivableDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  apartmentId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  roomId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  customerId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  leaseContractId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  meterReadingId?: string;

  @ApiProperty({ enum: RevenueReceivableType })
  @IsEnum(RevenueReceivableType)
  type!: RevenueReceivableType;

  @ApiProperty({ example: "Room rent June 2026" })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: "2026-06-01" })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: "2026-06-30" })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ example: "2026-06-05" })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ example: 12000000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
