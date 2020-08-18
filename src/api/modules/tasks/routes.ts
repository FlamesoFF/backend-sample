import { Router } from 'express';
import { tasksController } from './controller';
import { CouchDbService } from '../../../services/couchDb';
import { CONFIG } from '../../../shared/config';
import { graphqlHTTP } from 'express-graphql';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import path from "path";
import { addResolversToSchema } from "@graphql-tools/schema";


let gqlSchema = loadSchemaSync(path.join(__dirname, './schema.graphql'), {
    loaders: [
        new GraphQLFileLoader()
    ]
});

const router = Router({ mergeParams: true });


router.use(( request, response, next ) => {
    const { main: { name: mainDbName } } = CONFIG.servers.couchdb.databases;

    // switching to todos-v1 DB
    CouchDbService.switchDb(mainDbName);
    next();
});

router.use('/', graphqlHTTP({
    schema: gqlSchema,
    rootValue: {
        list: tasksController.list
    },
    graphiql: true
}));


export default router;