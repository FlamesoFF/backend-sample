import { IUser } from "./definitions.d";
import { MaybeDocument } from "nano";


export interface Sender extends MaybeDocument {
    name: string;
    code: string
    address: string
    contact: IUser
    class: string
}
