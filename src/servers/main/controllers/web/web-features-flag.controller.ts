
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiUseTags } from "../../../../shared/external/nestjs-swagger";
import { Transactional } from "../../../../shared/external/typeorm-transactional-cls-hooked/Transactional";
import { FeaturesFlagResponse } from "../../models/features-flag.vm";
import { FeaturesFlagService } from "../../services/web/features-flag.service";

@ApiUseTags('Features Flag')
@Controller('features')
export class FeaturesFlagController {
  constructor(private readonly featuresFlagService: FeaturesFlagService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FeaturesFlagResponse })
  @Transactional()
  public async featuresList() {
    return await this.featuresFlagService.featuresList();
  }
}