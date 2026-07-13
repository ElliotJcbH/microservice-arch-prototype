import ISessionUser from "./session-user.interface";

export default interface ISessionInfo {

    accessToken: string;
    refreshToken: string
    exp: number;
    iat: number;
    user: ISessionUser;

}