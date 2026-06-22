import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserForm {

    @IsEmail()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsStrongPassword()
    password: string;

}