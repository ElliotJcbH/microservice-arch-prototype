import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';
import { TokenService } from 'src/common/providers/token/token.service';
import { DatabaseService } from 'src/common/providers/database/database.service';
import { SessionInfoDto } from './dto/session-info.dto';

type User = {
  user_id: string,
  username: string,
  email: string,
  email_verified_at: Date,
  metadata: Record<string, any>,
  created_at: Date,
}

@Injectable()
export class AuthService {

  constructor(
    private readonly db: DatabaseService,
    private readonly tokenService: TokenService,
  ) {}
  
  async register(formData: CreateUserForm): Promise<SessionInfoDto> {

    const hash = hashPassword(formData.password);

    const query = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING user_id, username, email, email_verified_at, metadata, created_at';
    const result = await this.db.query(query, [formData.username, formData.email, hash]);
    
    const user: User = result.rows[0] as User;
    if(!user) {
      throw new InternalServerErrorException('Failed to create new user');
    }

    const sessionInfo: SessionInfoDto = await this.tokenService.createTokens(user);

    return(sessionInfo);

  }

  async login(formData: SignInUserForm): Promise<SessionInfoDto> {

    if(!formData.email || !formData.password) {
      throw new BadRequestException('Invalid username or password.');
    }

    const query = 'SELECT user_id, username, password, email, email_verified_at, metadata, created_at FROM users WHERE email = $1';
    const result = await this.db.query(query, [formData.email]);

    const user = result.rows[0] as User & { password: string };
    if(!user.username) {
      throw new NotFoundException('User does not exist');
    }

    if(!await verifyPassword(formData.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.tokenService.createTokens(user);

  }

  async logout(authorization: string, rawRefreshToken: string): Promise<boolean> {
    const accessToken = authorization.split(' ')[1];       
    const isRefreshTokenDeleted = await this.tokenService.deleteRefreshToken(accessToken, rawRefreshToken);

    return isRefreshTokenDeleted;

  }

  // async verifyTokens(authHeader: string): Promise<string> {
  //   const accessToken = authHeader.split(' ')[1];    
  //   const newAccessToken = await this.tokenService.verifyToken(accessToken) || '';

  //   return newAccessToken;
  // }

  async renewToken(authorization: string, refreshToken: string): Promise<string> {
    const accessToken = authorization.split(' ')[1];       
    const newAccessToken = await this.tokenService.renewAccessToken(accessToken, refreshToken);

    return newAccessToken;
  }
  
}