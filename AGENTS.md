## Development Commands

The project uses a `Justfile` to simplify common tasks:

- `just build` – generate the static site in the `build` directory.
- `just serve` – start a simple dynamic server at `localhost:3000`.
- `just test` – run the basic test suite.
- `just lint` – execute ESLint on the `src` directory.

## Example Benchmark Data

Synthetic benchmark results are stored under `test/example-data` using the
following directory structure:

```
test/example-data/${system_name}/${benchmark_name}/${toolchain_name}.json
```

`toolchain_name` is always one of the following:

`jolt`, `nexus`, `risc0`, `sp1`, `zkm`, `zkwasm`

Each json file contains two three-level keys:

- `toolchain`: the name of the toolchain
- `benchmarks` – an array with one entry holding `compile`, `prove`, and
  `verify` metrics.
- `hardware` – description of the machine that produced the results.
