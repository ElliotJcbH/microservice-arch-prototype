import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';
import { TokenService } from 'src/common/providers/token/token.service';
import { DatabaseService } from 'src/common/providers/database/database.service';

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
  
  async register(formData: CreateUserForm): Promise<User> {

    const hash = hashPassword(formData.password);

    const query = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING user_id, username, email, email_verified_at, metadata, created_at';
    const result = await this.db.query(query, [formData.username, formData.email, hash]);
    
    const user = result.rows[0] as User;
    if(!user) {
      throw new InternalServerErrorException('Failed to create new user');
    }

    return(user);
    // return this.tokenService.createTokens(user);

  }

  async login(formData: SignInUserForm): Promise<User> {

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

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
      // return this.tokenService.createTokens(result);

  }
  
}