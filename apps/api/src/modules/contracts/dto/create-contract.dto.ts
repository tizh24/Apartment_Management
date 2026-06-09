import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { LeaseContractStatus } from "@prisma/client";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateContractCustomerDto {
  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiPropertyOptional({ example: "1995-06-15" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @MaxLength(50)
  phoneNumber!: string;

  @ApiPropertyOptional({ example: "customer@example.com" })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: "Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: "079095000001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  identityNumber?: string;

  @ApiPropertyOptional({ example: "B1234567" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  passportNumber?: string;

  @ApiPropertyOptional({ example: "VN-2026-001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visaNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class CreateContractDto {
  @ApiPropertyOptional({ example: "LEASE-2026-001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractCode?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  apartmentId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  roomId!: string;

  @ApiPropertyOptional({
    description: "Existing customer id. Required when newCustomer is not provided.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerId?: string;

  @ApiPropertyOptional({
    type: CreateContractCustomerDto,
    description: "New customer data. Used when customerId is not provided.",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContractCustomerDto)
  newCustomer?: CreateContractCustomerDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  saleProfileId?: string;

  @ApiProperty({ example: "2026-06-01" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2027-06-01" })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rentDurationMonths?: number;

  @ApiProperty({ example: 12000000 })
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiPropertyOptional({ example: 12000000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  terms?: string;

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number;

  @ApiPropertyOptional({ enum: LeaseContractStatus })
  @IsOptional()
  @IsEnum(LeaseContractStatus)
  status?: LeaseContractStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
