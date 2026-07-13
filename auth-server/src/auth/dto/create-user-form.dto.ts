import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserFormDto {

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    username!: string;

    @IsStrongPassword()
    password!: string;

}