// TESTING CONTROLLER

import { Controller, Get, Param, Redirect, Req, Res, Body, Post } from "@nestjs/common";
import type { Request, Response } from 'express';
import { ExampleObject } from "./example-object.dto";

@Controller('about')
export class AboutController {

    @Get()
    getAbout(@Req() req: Request, @Res() res: Response): any { // What does req contain?
        // return 'This is the about page';
        // return JSON.stringify(req);
        // return req.ip?.toString();
        res.json({user: 'rokketo'});
    }

    @Get('secrets')
    getAboutSecrets(): string {
        return 'You just found the about page secrets!';
    }

    @Get('redirect-me')
    @Redirect('https://nestjs.com', 301)
    someFunc() {
        // Change redirect link if a condition is met
        // if('something') { 
        //     return { url: 'some-url.com' }
        // }
    }

    @Get(':postId')
    openPost(@Param('postId') postId: string): string {
        return `Show post with id ${postId}`;
    }

    // @Get('*')
    // getAny(): string {
    //     return 'Matched any';
    // }

    @Post()
    async createPost(@Body() someObject: ExampleObject): Promise<string> {
        return 'Hello';
    }

}