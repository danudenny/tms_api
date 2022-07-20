import {BadRequestException, Injectable} from '@nestjs/common';
import {RawQueryService} from "./raw-query.service";

@Injectable()
export class NearlyBranchService {
    constructor() {
    }

    static E_RADIUS = 6372.8;

    public static async validateNearlyBranch(lat, long, branchId): Promise<any> {
        const radius: number = 0.5; // in kilometer
        const nearbyLotLang = await this.getNearbyLatLong(parseFloat(lat), parseFloat(long), radius);

        const res = await RawQueryService.query(`SELECT branch_id FROM branch WHERE is_deleted = false
          AND longitude IS NOT NULL AND latitude IS NOT NULL
          AND latitude::float >= ${nearbyLotLang[0]}
          AND latitude::float <= ${nearbyLotLang[2]}
          AND longitude::float >= ${nearbyLotLang[1]}
          AND longitude::float <= ${nearbyLotLang[3]}
          AND branch_id = ${branchId}`);
        if (res.length == 0) {
            throw new BadRequestException('Your location does not match the branch location');
        }
        return res.length;
    }

    private static async getNearbyLatLong(lat, long, radius) {
        // offsets in kilometers
        const dn = radius;
        const de = radius;

        // coordinate offsets in radians
        const dLat = dn / this.E_RADIUS;
        const dLon = de / (this.E_RADIUS * Math.cos((Math.PI * lat) / 180));

        // offset position, decimal degrees
        const min_lat = lat - (dLat * 180) / Math.PI;
        const min_lon = long - (dLon * 180) / Math.PI;

        // offset position, decimal degrees
        const max_lat = lat + (dLat * 180) / Math.PI;
        const max_lon = long + (dLon * 180) / Math.PI;

        return [min_lat, min_lon, max_lat, max_lon];
    }
}