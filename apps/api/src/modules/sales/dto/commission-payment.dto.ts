import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID } from "class-validator";

export class CommissionPaymentDto {
  @ApiProperty({ example: "sale-profile-uuid" })
  @IsUUID()
  saleId!: string;

  @ApiProperty({ example: ["sale-contract-uuid"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  contractIds!: string[];
}

export class CreateCommissionPaymentDto extends CommissionPaymentDto {
  @ApiPropertyOptional({ example: "2026-05-22T09:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ example: "Paid by bank transfer." })
  @IsOptional()
  @IsString()
  note?: string;
}
