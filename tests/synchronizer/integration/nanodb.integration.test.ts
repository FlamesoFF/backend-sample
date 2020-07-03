import { CONFIG } from '../../../src/shared/config';
import Axios from 'axios';
import { NanoDB } from '../../../src/synchronizer/scripts/utils/helper';
import { expect } from 'chai';


describe('NanoDB', () => {

    it('getPreviousRevision', async () => {
        const dbName = CONFIG.servers.couchdb.databases.main.name;
        const docId = 'abc-ltd';

        const { data: doc } = await Axios.get(`http://localhost:5985/${dbName}/${docId}`);
        const previousRevisionDoc = await NanoDB.getPreviousRevision(dbName, docId);

        console.log(doc);
        console.log(previousRevisionDoc);

        expect(doc).not.to.be.deep.equal(previousRevisionDoc);
    });

});