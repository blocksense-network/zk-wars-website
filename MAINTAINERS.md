# Maintainers Guide

This project deploys the static site to **Cloudflare Pages**.

## Cloudflare Setup

1. Sign in to Cloudflare and create a new Pages project (e.g. `zk-wars`).
2. Generate an API token with **Pages:Edit** permission and note your **Account ID**.
3. Save the following environment variables in a `.env` file at the repository root:

```
CF_PAGES_PROJECT=<project-name>
CF_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_API_TOKEN=<api-token>
CF_PAGES_BRANCH=main
```

`direnv` automatically loads variables from `.env` when you enter the shell.

## Publishing

Run `just publish` to build the site and deploy it to Cloudflare Pages.
