import IUserRecord from '@interface/user-record.interface';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '@providers/database/database.service';
import { hashPassword, verifyHash } from '@utils/auth.utils';
import { CreateUserFormDto } from 'src/auth/dto/create-user-form.dto';
import { SignInUserFormDto } from 'src/auth/dto/signin-user-form.dto';

@Injectable()
export class UserRecordService {
    constructor(private db: DatabaseService) {}

    async createUser(formData: CreateUserFormDto): Promise<IUserRecord> {
        const hash = await hashPassword(formData.password);

        const query = `
            INSERT INTO auth.users(username, email, password) 
            VALUES($1, $2, $3) 
            RETURNING user_id, username, email, email_verified_at, metadata, created_at
        `;

        let user: IUserRecord;
        try {
            const result = await this.db.query(query, [
                formData.username,
                formData.email,
                hash,
            ]);
            user = result.rows[0] as IUserRecord;
        } catch (e) {
            console.log(
                `Error [Database Exception]: ${e instanceof Error ? e.message : e}`,
            );
            throw new InternalServerErrorException();
        }

        return user;
    }

    async fetchUserWithSignInData(
        formData: SignInUserFormDto,
    ): Promise<IUserRecord> {
        if (!formData.email || !formData.password) {
            console.log(
                'Error [Bad Request]: Email or password missing from user input at login',
            );
            throw new BadRequestException('Missing username or password');
        }

        const query = `
            SELECT user_id, username, password, email, email_verified_at, metadata, created_at 
            FROM auth.users 
            WHERE email = $1
        `;
        let result;
        let user: IUserRecord & { password: string };
        try {
            result = await this.db.query(query, [formData.email]);
            user = result.rows[0];
        } catch (e) {
            console.log(
                `Error [Database Exception]: ${e instanceof Error ? e.message : e}`,
            );
            throw new InternalServerErrorException();
        }

        if (!user) {
            console.log(
                `Error [Not Found]: User with email ${formData.email} does not exist`,
            );
            throw new NotFoundException('User does not exist');
        }

        if (!(await verifyHash(formData.password, user.password))) {
            console.log('Invalid credentials');
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as IUserRecord;
    }

    async fetchUserWithId(userId: string) {}
}
