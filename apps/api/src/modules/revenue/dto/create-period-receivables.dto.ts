import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreatePeriodReceivablesDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  leaseContractId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  meterReadingId?: string;

  @ApiProperty({ example: "2026-06-01" })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: "2026-06-30" })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ example: "2026-07-05" })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeRent = true;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeUtilities = true;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceAmount?: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}