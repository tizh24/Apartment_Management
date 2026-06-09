import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CustomerDocumentType } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";

export class CreateCustomerDocumentDto {
  @ApiProperty({ enum: CustomerDocumentType, example: CustomerDocumentType.PASSPORT })
  @IsEnum(CustomerDocumentType)
  type!: CustomerDocumentType;

  @ApiPropertyOptional({ example: "passport-nguyen-van-a.pdf" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiProperty({ example: "https://storage.example.com/customers/passport.pdf" })
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  fileUrl!: string;

  @ApiPropertyOptional({ example: "application/pdf" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional({ example: 245000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
