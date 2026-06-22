import SessionUserInfo from "src/common/interface/session-user-info.interface";

export class SessionInfoDto {
    
    accessToken: string;
    refreshToken: string;
    exp: number;
    iat: number;
    user: SessionUserInfo;
}