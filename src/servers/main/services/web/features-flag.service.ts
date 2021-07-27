import { Injectable } from "@nestjs/common";
import { RedisService } from "../../../../shared/services/redis.service";
import { FeaturesFlagResponse } from "../../models/features-flag.vm";


@Injectable()
export class FeaturesFlagService {

  async featuresList(): Promise<FeaturesFlagResponse> {
    const result = new FeaturesFlagResponse();
    const newLoginVersion = JSON.parse(await RedisService.get(`pod:login:version`));
    console.log(newLoginVersion);
    if (!newLoginVersion) {
      result.mobileLoginNewVersion = false;
      result.webLoginNewVersion = false;
      return result;
    }

    result.webLoginNewVersion = newLoginVersion.web;
    result.mobileLoginNewVersion = newLoginVersion.mobile;

    console.log(result)
    return result;
  }
}