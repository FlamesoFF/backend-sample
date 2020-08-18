export interface Configuration {
    servers: {
        pgsql: Server
        couchdb: Server
        neo4j: Server
    }

    auth: Auth
    API: API
    environment?: string
}

interface Server {
    protocol: string
    host: string
    port: number
    username: string
    password: string
    databases: {
        main: DB
        [key: string]: DB
    }
}

interface DB {
    name: string
    similarity?: number
    [key: string]: string | number
}

interface API {
    lists: Lists
    ports: {
        private: number
        public: number
    }
}

interface Lists {
    limit: number;
}

interface Auth {
    secret: string
}