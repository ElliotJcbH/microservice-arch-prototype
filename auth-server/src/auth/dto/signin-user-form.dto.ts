import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignInUserForm {

    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

}