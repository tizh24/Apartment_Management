import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateSaleProfileDto {
  @ApiPropertyOptional({ description: "SALE user id to link with this profile" })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: "Sale User" })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @MinLength(6)
  phoneNumber!: string;

  @ApiProperty({ example: "123456789" })
  @IsString()
  @MinLength(4)
  bankAccountNumber!: string;

  @ApiProperty({ example: "Vietcombank" })
  @IsString()
  @MinLength(2)
  bankName!: string;

  @ApiPropertyOptional({ example: "VCB", description: "Bank code for QR URL" })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ example: "Main referral partner." })
  @IsOptional()
  @IsString()
  note?: string;
}
