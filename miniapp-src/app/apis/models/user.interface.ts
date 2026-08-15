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
        rkLogin?: string;
        rkPassword1?: string;
        rkPassword2?: string;
        paymentStatus?: string;
        vatCode?: number;
    };
    url?: string;
}
