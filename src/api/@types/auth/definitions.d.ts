export interface ApolloJwtToken {
    _id: string;
    name: string;
    email: string;
    roles: string[];

    id?: string;
    login?: string;
    initials?: string;
    accepted?: boolean;
    organization?: string;
    occupation?: string;
    country?: string;
    nationality?: string;
    phone?: string;
    sms_notifications_enabled?: boolean;
    avatar?: null;
    time?: number;
    ip?: string;
    type?: string[];
    iat?: number;
    exp?: number;
}

export interface GoogleJwtToken {
    iss: string;
    sub: string;
    hd: string;
    email: string;
    email_verified: boolean;
    aud: string;
    at_hash: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    locale: string;
    iat: number;
    exp: number;
}
