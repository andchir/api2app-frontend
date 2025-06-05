export interface User {
    username: string;
    email: string;
    groups?: string[];
    first_name?: string;
    last_name?: string;
    userprofile?: {
        avatar?: string;
        ykShopId?: string;
        ykSecretKey?: string;
        paymentStatus?: string;
    }
}
