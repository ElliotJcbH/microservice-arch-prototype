export default interface IUserRecord {
    user_id: string;
    username: string;
    email: string;
    email_verified_at: Date;
    metadata: Record<string, any>;
    created_at: Date;
}
