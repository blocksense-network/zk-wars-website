## Development Commands

The project uses a `Justfile` to simplify common tasks:

- `just build` – generate the static site in the `build` directory.
- `just serve` – start a simple dynamic server at `localhost:3000`.
- `just test` – run the basic test suite.
- `just lint` – execute ESLint on the `src` directory.

## Example Benchmark Data

See `docs/ARCHITECTURE.md` for the specification of the benchmark data used
by this codebase. There is an example benchmark data directory located in
`test/example-data`.
