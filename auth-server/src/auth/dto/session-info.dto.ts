import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import ISessionUser from "src/common/interface/session-user.interface";

export class SessionInfoDto {
    
    @IsString()
    accessToken!: string;

    @IsString()
    refreshToken!: string;

    @Type(() => Number)
    @IsNumber()
    exp!: number;
    
    @Type(() => Number)
    @IsNumber()
    iat!: number;

    user!: ISessionUser;

}