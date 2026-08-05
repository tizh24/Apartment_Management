import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RevenuePaymentMethod } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateReceivablePaymentDto {
  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: RevenuePaymentMethod, default: RevenuePaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(RevenuePaymentMethod)
  method?: RevenuePaymentMethod;

  @ApiPropertyOptional({ example: "2026-06-12T09:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ example: "FT25200123456789" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  transactionCode?: string;

  @ApiPropertyOptional({ example: "https://example.com/payment-proof.jpg" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
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