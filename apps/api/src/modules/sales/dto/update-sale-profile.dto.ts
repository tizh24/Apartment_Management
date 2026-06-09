import { PartialType } from "@nestjs/swagger";

import { CreateSaleProfileDto } from "./create-sale-profile.dto";

export class UpdateSaleProfileDto extends PartialType(CreateSaleProfileDto) {}
