# ⚡️ esinx/webstack

> The (very opinionated) DX-first webstack monorepo template for the modern web, designed by esinx.

- 🔌 Fullstack TypeScript
  - Backend runs on **NodeJS** with **SWC** for compilation
  - Frontend runs on _(any framework that supports TypeScript)_
- 🎛️ Fully Type-Safe APIs using [tRPC](https://trpc.io)
- 📊 Fully Type-Safe ORM using [drizzle](https://orm.drizzle.team/)
- 🖥️ BYOF - Bring Your Own Frontend, powered by [Vite](https://vitejs.dev)
  - This template uses React by default, but you can easily swap it out for [any other frameworks](https://vitejs.dev/guide/#trying-vite-online) supported by Vite
  - tRPC also supports various frontends frameworks, so you don't have to worry about cross-framework compatibility on your backend
- 🌩️ Fully AWS Native & Serverless-First Design
  - tRPC backend runs on **AWS Lambda**
    - If you are running locally, you have the choice of running it on **AWS SAM** or a local **fastify** server
    - This is to unclutter your local machine from having to run a bunch of services (heck, it's probably running a docker container for your database already)
  - Frontend hosted on **AWS S3** and served via **AWS CloudFront**
    - If you want to use SSR, look into [vite-plugin-ssr](https://vite-plugin-ssr.com/) and its [AWS Lambda integration](https://vite-plugin-ssr.com/aws-lambda.html)
  - User authentication powered by **AWS Cognito**
  - (Optional) Domain management with **AWS Route53**
  - Easily deploy using **AWS CDK**
- 📦 Monorepo & yarn workspaces
- 🛠️ CI/CD Ready
  - AWS CDK included
  - GitHub Actions included

## 🎛️ Environment Setup

### 🌩️ CDK

First, configure the environment by completing the `.env` file under `cdk`:
```
PROJECT_IDENTIFIER=### (e.g. net.esinx.webstack, will later be used as base identifier for all resources)
SES_EMAIL=### (e.g. noreply@...)
HOSTED_ZONE_ID=### (optional, but helpful for setting up domains on Route53)
```

Serverless function deployments require their own environment variables. You can copy the `.env.example` file and rename it to `.(service).env` to get started.

For instance, the backend service can be initialized with the following commands:
```shell
$ cd cdk
$ cp ../services/backend/.env.example ./.backend.env
```

You may also want to configure the `cdk/bin/deploy.ts` file manually to setup domain names, etc.
**TODO**: An automated process of this is planned for the future. (WIP)

### ⚙️ Environment Variables

Each workspace has its own `.env` file. You can copy the `.env.example` file and rename it to `.env` to get started.

### 🪄 [frp](https://github.com/fatedier/frp) Tunnel (optional)

This project has frp tunneling support built-in. This is useful for testing webhooks locally, or for accessing your local serverless functions from the internet.

If you have your own [frp](https://github.com/fatedier/frp) server, you can configure the tunnel by placing a `frpc.ini` file under the root directory of this project.

Run `yarn tunnel` to start the tunnel.

## 🚚 Deployment

Before deploying, make sure you have the AWS CLI installed and configured.
All projects must be built before deployment. For backend services (which are serverless functions by default) this is done by running `build:lambda` in the corresponding service directory. For frontend services, this is done by running `build` under the `web` directory.

```shell
$ cdk deploy
```
