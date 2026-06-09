import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class CreateContractFileDto {
  @ApiPropertyOptional({ example: "lease-contract-2026-001.pdf" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiProperty({ example: "https://storage.example.com/contracts/lease-contract-2026-001.pdf" })
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  fileUrl!: string;

  @ApiPropertyOptional({ example: "application/pdf" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional({ example: 256000 })
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
