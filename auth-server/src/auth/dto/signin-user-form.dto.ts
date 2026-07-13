import { IsAscii, IsEmail } from 'class-validator';

export class SignInUserFormDto {

    @IsEmail()
    email!: string;

    @IsAscii()
    password!: string;

}