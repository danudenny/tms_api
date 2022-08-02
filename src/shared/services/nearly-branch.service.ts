import {BadRequestException, Injectable} from '@nestjs/common';
import {RawQueryService} from './raw-query.service';
import {ConfigService} from './config.service';

@Injectable()
export class NearlyBranchService {
    constructor() {
    }

    static E_RADIUS = 6372.8;

    public static async validateNearlyBranch(lat, long, branchId, radius): Promise<any> {
        const nearbyLotLang = await this.getRangeCoordinate(parseFloat(lat), parseFloat(long), radius);
        const res = await RawQueryService.query(`
          SELECT branch_id FROM branch
          WHERE branch_id = ${branchId}
          AND longitude IS NOT NULL AND latitude IS NOT NULL
          AND latitude::float >= ${nearbyLotLang[0]} AND latitude::float <= ${nearbyLotLang[2]}
          AND longitude::float >= ${nearbyLotLang[1]} AND longitude::float <= ${nearbyLotLang[3]}
          AND is_deleted = false`);
        if (res.length > 0) {
            return res.length;
        } else {
            throw new BadRequestException(`Jarak Anda saat ini dengan tujuan lebih dari ${radius} km`);
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
