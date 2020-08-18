import { ICountry, IUser } from "./definitions.d";
import { MaybeDocument } from "nano";


export interface Receiver extends MaybeDocument {
    name: string;
    address: string
    contact: IUser
    class: string
    company?: string
    country?: ICountry
}
