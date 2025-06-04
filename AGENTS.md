At the end of your task, create a file `.agents/task_url.txt` with the URL of
the task in the Codex web interface.

## Example Benchmark Data

Synthetic benchmark results are stored under `test/example-data` using the
following directory structure:

```
test/example-data/${system_name}/${benchmark_name}/results.json
```

Each `results.json` file contains two top-level keys:

- `benchmarking` – an array with one entry holding `compile`, `prove`, and
  `verify` metrics.
- `hardware` – description of the machine that produced the results.

## Development Commands

The project uses a `Justfile` to simplify common tasks:

- `just build` – generate the static site in the `build` directory.
- `just serve` – start a simple dynamic server at `localhost:3000`.
- `just test` – run the basic test suite.
- `just lint` – execute ESLint on the `src` directory.
