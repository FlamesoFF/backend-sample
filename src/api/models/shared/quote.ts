import { IQuote, IQuoteHeaders, IQuoteItem } from '../../../@types/data/definitions';

export class QuoteModel implements IQuote {
    headers: IQuoteHeaders;
    items: IQuoteItem[];

    private constructor(params: IQuote) {
        const {
            headers,
            items
        } = params;

        this.headers = headers;
        this.items = items;
    }

    static create(params: IQuote) {
        return new QuoteModel(params);
    }
}