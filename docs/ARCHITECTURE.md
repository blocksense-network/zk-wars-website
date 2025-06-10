# zk-wars.blocksense.network Implementation Approach

The web-site will be implemented as a hybrid architecture combining elements
of static web-sites and single page applications.

Technically, the codebase is implemented in TypeScript and it consists of React
server-side components, implemented through the Next.js framework for a typical
SSR deployment.

Nevetheless, we prerender all the URLs in the web-site as static pages, so they
can be hosted on HTML-only hosts such as Cloudflare Pages. This ensures that
the site works well for search engines and clients with JavaScript disabled.

Each static page includes the Next.js run-time which allows all the other pages
to be rendered client-side (for maximumum responsiveness) like a traditional
single-page app. Navigating between the web site pages uses `pushState` and
`replaceState` (when interacting with on-screen controls such as filters) to
ensure that the currently visible on-screen content is always sharable with a
deep link.

This architecture ensures we get maximum SEO friendliness, fast initial
rendering times and very fast app-like responsiveness when navigating the
site in JavaScript-enabled clients.

## Benchmark Data Management

The key to implementing this architecture is the management of benchmark
data. The benchmark data consists of a directory of json files with the
following schema:

```json
{
  "toolchain": <toolchain-name>,
  "benchmarks": [{
    "name": "<benchmark-program-name>",
    "compile": {
      "timeStarted": "<ISO-timestamp>",
      "runs": <number-of-runs>,
      "totalDuration": <total-duration-seconds>,
      "mean": <mean-duration-seconds>,
      "deviation": <standard-deviation-seconds>,
      "min": <min-duration-seconds>,
      "max": <max-duration-seconds>,
      "memory": <memory-usage-bytes>,
      "size": <proof-or-circuit-size-in-bytes>
    },
    "prove": { <same-as-compile> },
    "verify": { <same-as-compile> }
  }],
  "hardware": {
    "cpu": [{"model": "<cpu-model>", "cores": <cores-count>, "speed": <speed-GHz>}],
    "memory": {"model": "<memory-model>", "size": <size-bytes>, "speed": <speed-MHz>},
    "hardwareAcceleration": [{"model": "<gpu-model>", "cores": <cores-count>, "speed": <speed-MHz>}],
    "accelerated": false
  }
}
```

`toolchain_name` is always one of the following:

`jolt`, `nexus`, `risc0`, `sp1`, `zkm`, `zkwasm`

Each json file contains two three-level keys:

- `toolchain`: the name of the toolchain
- `benchmarks` – an array with one entry holding `compile`, `prove`, and
  `verify` metrics.
- `hardware` – description of the machine that produced the results.

The benchmark data is organized in a directory with the following structure:

```sh
${benchmark_data_root}/${system_name}/${benchmark_name}/${toolchain_name}.json
```

The React components obtain their data through an async API that resembles an
interaction with a server-side REST API.

During the static build, we provide an implementation of this API that just
fetches the data from the file system (i.e. the benchmark data directory).

We also generate a client-side cache that includes a subset of the data.
The same React components then pretend to obtain the data dynamically from
the same API, which now serves the data from the pre-populated cache.

If the data is not in the client cache, we request it from a server-side API
based on Cloudflare workers that fetches it from an in-memory cache on the
server. The cache is populated at start-up from the file system.

## Blocksense Component Library

The React code makes heavy use of the Blocksense component library, managed
as a git submodule. The library is located at vendor/blocksense/libs/ts/ui

## Design Rationale

One of our key goals of this implementatiaon approach is to preserve our
option to migrate to a mostly server-side rendering architecture when the
data becomes too big and our current approach starts to cause slow initial
page loading times.
