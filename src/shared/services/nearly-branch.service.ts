import {BadRequestException, Injectable} from '@nestjs/common';
import {RawQueryService} from './raw-query.service';
import {ConfigService} from './config.service';

@Injectable()
export class NearlyBranchService {
    constructor() {
    }

    static E_RADIUS = 6372.8;

    public static async validateNearlyBranch(lat, long, branchId): Promise<any> {
        const radius: number = ConfigService.get('nearlyBranch.radius'); // in kilometer
        const nearbyLotLang = await this.getRangeCoordinate(parseFloat(lat), parseFloat(long), radius);

        const res = await RawQueryService.query(`SELECT branch_id, latitude, longitude FROM branch
          WHERE branch_id = ${branchId} AND longitude IS NOT NULL AND latitude IS NOT NULL AND is_deleted = false`);
        if (
            (res.length > 0) &&
            (parseFloat(res[0].latitude) >= nearbyLotLang[0]) &&
            (parseFloat(res[0].latitude) <= nearbyLotLang[2]) &&
            (parseFloat(res[0].longitude) >= nearbyLotLang[1]) &&
            (parseFloat(res[0].longitude) >= nearbyLotLang[3])
        ) {
            return res.length;
        } else {
            throw new BadRequestException('Your location does not match the branch location');
        }
    }

    private static async getRangeCoordinate(lat, long, radius) {
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
