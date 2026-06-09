import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RevenuePaymentMethod } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class RecordPaymentDto {
  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ enum: RevenuePaymentMethod, default: RevenuePaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(RevenuePaymentMethod)
  method?: RevenuePaymentMethod;

  @ApiPropertyOptional({ example: "2026-06-05T09:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ example: "FT2606050001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionCode?: string;

  @ApiPropertyOptional({ example: "https://storage.example.com/payments/receipt.jpg" })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  evidenceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  evidenceNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
