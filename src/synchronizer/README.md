# DB Synchronizer

## Description

This is a backend service application used for synchronizing data between **CouchDB**, **Neo4j** and **PostgreSQL**.

## Requirements
### Databases
1. `apollo`
2. `tasks`

### Design docs

1. **apollo**: `_design/common/all`
2. **tasks**: `_design/common/all`

## Setup

Run `yarn install`. It willl install all needed dependencies.

## Launch

To launch the app run following commands:

1. `yarn build`
2. `yarn start-prod`

It will launch new process with pm2 Node process manager.

## Docker

### Configuration
Edit file `src/config.docker.json` to suit your needs.

### Run
#### Linux
Execute shell script `docker.sh`

#### Windows
Execute PowerShell script `docker.ps1`

