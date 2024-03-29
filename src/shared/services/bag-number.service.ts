import {sampleSize} from 'lodash';
import {BagService} from '../../servers/main/services/v1/bag.service';
import {BadRequestException, InternalServerErrorException} from '@nestjs/common';
import {RedisService} from './redis.service';

export class BagNumberService {

    public static async createBagNumber(prefix) {
        let retries = 5;
        while (retries--) {
            const bagNumber = await this.generateBagNumber(prefix);
            const bag = await BagService.validBagNumber(bagNumber);
            const redlock = await RedisService.redlock(`redlock:bag:${bagNumber}`, 300);
            if (!redlock) {
                throw new BadRequestException('Data Bag Sedang di proses, Silahkan Coba Beberapa Saat');
            }
            if (!bag) {
                return bagNumber;
            }
        }
        throw new InternalServerErrorException('BagNumber gagal di buat, silahkan ulangi beberapa saat lagi!');
    }

    public static async generateBagNumber(prefix) {
        const length = 8;
        let randomBagNumber = sampleSize('012345678900123456789001234567890ABCDEFGHIJKLMNOPQRSTUVWXYZZYWVUTSRQPONMLKJIHGFEDCBA', length).join('');
        const arrayLastTreeChar = randomBagNumber.substr(length - 3).split('');
        const randomIndex = Math.floor(Math.random() * arrayLastTreeChar.length);
        if (/^\d+$/.test(arrayLastTreeChar[randomIndex])) {
            arrayLastTreeChar[randomIndex] = sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1).join('');
        }
        const lastThreeChar = arrayLastTreeChar.toString().replace(/,/g, '');
        randomBagNumber = prefix + randomBagNumber.slice(0, -3) + lastThreeChar;
        return randomBagNumber;
    }
}
