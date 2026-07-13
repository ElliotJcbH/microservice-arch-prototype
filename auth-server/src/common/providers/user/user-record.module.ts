import { Module, Global } from "@nestjs/common";
import { UserRecordService } from "./user-record.service";

@Global()
@Module({
    providers: [UserRecordService],
    exports: [UserRecordService],
})
export class UserRecordModule{}