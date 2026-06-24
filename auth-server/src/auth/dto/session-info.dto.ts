import { IsNumber, IsString } from "class-validator";
import SessionUserInfo from "src/common/interface/session-user-info.interface";

export class SessionInfoDto {
    
    @IsString()
    accessToken!: string;

    @IsString()
    refreshToken!: string;

    @IsNumber()
    exp!: number;

    @IsNumber()
    iat!: number;

    user!: SessionUserInfo;

}