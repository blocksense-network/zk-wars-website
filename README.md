# zk-wars-website
The zk-wars.blocksense.network web-site

## Development Environment

This project uses **Nix flakes** and **direnv** to provide a reproducible development shell. After installing [direnv](https://direnv.net/) and enabling the hook in your shell, simply allow the `.envrc` file:

```bash
cd zk-wars-website
direnv allow
```

This will automatically enter a Nix shell containing Node.js and the Playwright browsers needed for the testing workflow described in `docs/TESTING.md`.
