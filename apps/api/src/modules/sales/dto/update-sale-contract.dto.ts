import { PartialType } from "@nestjs/swagger";
import { CommissionStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

import { CreateSaleContractDto } from "./create-sale-contract.dto";

export class UpdateSaleContractDto extends PartialType(CreateSaleContractDto) {
  @IsOptional()
  @IsEnum(CommissionStatus)
  commissionStatus?: CommissionStatus;
}
