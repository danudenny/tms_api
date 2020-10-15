# SiCepat TMS Api

## Tech Stack

- [Node.js](https://nodejs.org/download/release/v10/) Node.js version `10`
- [Yarn](https://yarnpkg.com) for Package Manager Development mode.
- [Nest.js](https://github.com/nestjs/nest) as the framework.
- [Redis](https://redis.io/) for Backing Bull and Key-Value storage use version `5`.

## How We Write Codes

### Typescript

1. <https://www.geeksforgeeks.org/difference-between-typescript-and-javascript/>
2. <https://www.cheatography.com/gregfinzer/cheat-sheets/typescript/>

### NestJS

1. <https://docs.nestjs.com>

### JWT

1. <https://github.com/dwyl/learn-json-web-tokens>

### Bull Queue

1. <https://optimalbits.github.io/bull/>
2. <https://github.com/OptimalBits/bull>

## We Are One

The `tslint.json` are helping our development code style to be the same

## Visual Studio Code Required Plugins

1. <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode/items?itemName=ms-vscode.vscode-typescript-tslint-plugin>
2. <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
3. <https://marketplace.visualstudio.com/items?itemName=rbbit.typescript-hero>
4. <https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons>
5. <https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer>
6. <https://marketplace.visualstudio.com/items?itemName=stringham.move-ts>
7. <https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight>
8. <https://marketplace.visualstudio.com/items?itemName=develiteio.api-blueprint-viewer>

## How To Start Develop

### Run Project

Start an Android emulator or connect your phone by turning on Android Debugging feature, and then start the project

```bash
npm run start
```

### Run API Blueprint Mock Server

We are using API Blueprint format for contracts, and serving them with Drakov server. You can run Drakov server directly by typing:

```bash
npm run drakov:start
```

### Test Project

First, you have to setup database needed for test by creating an empty database on your local PostgreSQL database called `sicepat-tms-api-test`, and then you are ready for running the test files by typing the following command:

```bash
npm run test
```

Note: It is not recommended to set the database test to other than you local db server, test setup will drop database first and then seeding the emptied database

### Build Project

#### Staging/Development

Verify your config files, make sure the configurations match the exact requirements for staging mode (e.g: endpoint url, etc), and then start build the APK:

```bash
npm run build
```

The build files will be ready inside `dist`

#### Production

Verify your config files, make sure the configurations match the exact requirements for production mode (e.g: endpoint url, etc), and then start build the APK:

```bash
npm run build
```

The build files will be ready inside `dist`
