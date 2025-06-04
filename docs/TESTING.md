# Comprehensive Testing Strategy for the zk-wars website

This strategy outlines a **multi-faceted testing approach** to ensure the zk-wars website is reliable, accurate, and high-quality. It covers everything from local developer testing to continuous integration (CI) pipelines, end-to-end user journey tests, component-level checks, data integrity, static site generation verification, code quality enforcement, accessibility compliance, and performance audits. The goal is to catch issues early and maintain confidence in each code change.

## 1. Local and CI Testing Environment

**Reproducible Dev Environments with Nix:** All tests should run in a Nix-provided environment to guarantee consistency between local development and CI. A Nix flake can define a `devShell` that includes all necessary dependencies (Node, browsers, etc.). Developers enter this shell (e.g. via `nix develop` or `direnv`) and run tests, and the CI uses the same shell for its jobs. This ensures the exact same versions of tools and libraries are used everywhere . In practice, GitHub Actions can load the Nix environment (using a Nix action or `nix flake check`) and then invoke the test scripts in that environment.

**Unified Test Commands:** Provide a single unified command (or a small set of commands) to run all tests locally. For example, a top-level script (in package.json or a Makefile) could run linting, unit tests, integration tests, and E2E tests in one go. This helps developers easily run the full test suite before pushing changes. The same commands should be executed on CI for every pull request (PR), to avoid “works on my machine” issues. In CI, enable **fail-fast** behavior: if the environment setup or any test stage fails, the pipeline should stop and report the failure.

**Folder Structure:** Organize test files by type for clarity. For instance:

* `src/` – application code (components, pages, etc.).
* `tests/unit/` – unit and integration tests (e.g. with Vitest or Jest).
* `tests/e2e/` – end-to-end tests (Playwright specs).
* `.storybook/` and `stories/` – Storybook configuration and component stories for UI testing.
* `benchmarks/` – benchmarking scripts, data files, and JSON schema definitions for benchmark results.

This separation makes it easy to run specific categories of tests and find relevant files. The Playwright config’s `testDir` can point to the `tests/e2e` folder , and the unit test runner can target `tests/unit`.

**Consistent Tooling in CI:** The CI pipeline (GitHub Actions) should use the same Nix devShell to run tests as developers do locally, guaranteeing a consistent environment . Any required services (like a database or specific OS dependencies) can be provided via Nix or container images in CI. Standardizing the environment in this way minimizes discrepancies that cause flaky tests . For example, if specific fonts or browser versions are needed for visual tests, ensure the Nix shell or CI has those so that screenshots render identically on all systems.

**GitHub Actions Workflow:** Set up separate steps (or jobs) in the CI workflow for different test stages:

1. **Dependency Setup:** Install Nix and enter the devShell environment (caching Nix builds for speed where possible).
2. **Lint & Type Check:** Run ESLint and TypeScript (`tsc --noEmit`) to catch syntax/style issues and type errors.
3. **Unit/Integration Tests:** Run the Vitest or Jest suite on isolated functions and components.
4. **Build & Static Generation:** Build the Next.js project (and run static export if applicable) to ensure no build errors.
5. **E2E Tests:** Start the application (or static server) and run Playwright tests.
6. **Storybook Tests:** (If applicable, see below) Possibly build Storybook or run visual tests on Storybook.
7. **Lighthouse Audits:** Run performance/accessibility audits (Lighthouse CI) after the app is running.
8. **Summary & Artifacts:** Collect test reports, coverage, and any artifacts (like screenshots or logs) for reporting.

All these should run on each PR. Developers should be able to run each step locally as well via Nix (e.g., `nix develop -c npm run test:e2e`).

## 2. End-to-End (E2E) Testing with Playwright

**Playwright for Browser Automation:** Use **Playwright** for end-to-end tests, covering critical user paths on the site. Playwright allows testing with real Chromium, Firefox, and WebKit browsers. Create test specs that navigate the site as a user would (e.g., loading the homepage, interacting with filters or navigation, viewing benchmark results). These tests verify that pages render correctly and interactive features work. Since this is a Next.js project, leverage Playwright’s ability to launch a dev server in the background via its config (`webServer` setting) so that running `npx playwright test` automatically starts the app on a port .

**Visual Regression Testing:** Integrate visual snapshot tests into the E2E suite. Playwright Test includes built-in support for screenshot comparisons. For key pages or UI states, use `expect(page).toHaveScreenshot()` to capture a screenshot and compare it against a stored baseline . On first run, it will save **golden** images; subsequent runs automatically diff the new screenshots with the baseline and flag any pixel-level changes. This ensures that UI changes are intentional. All reference images (baselines) should be committed to the repository, organized in a snapshots folder for traceability. To avoid platform rendering differences, always run these tests in a consistent environment (e.g., use the same browser version and OS via Nix/CI) .

**Per-PR Diff Reports:** When a visual regression is detected, the CI should provide a clear diff report. Set Playwright to output **comparison images** (diff images highlighting changes) as artifacts. For example, if using GitHub Actions, configure the job to upload the Playwright **test-results** folder (which contains screenshots and diff images) as an artifact. Additionally, consider using a GitHub Action or bot to post a comment on the PR with a link or embedded images of the diffs. This way, maintainers can quickly see what visual changes occurred. The goal is that every PR’s test report includes not only pass/fail status but also visuals for any differences. Modern approaches even integrate these diffs into PR checks UI for quick review.

**Playwright MCP Server Support:** To allow AI-powered agents to assist with testing, support the **Playwright Model Context Protocol (MCP) server**. The MCP server enables an LLM-based tool (like GitHub Copilot’s test generator or other agents) to interact with the running site via Playwright . In practice, this means including the `@playwright/mcp` package in dev dependencies and providing documentation or an npm script to launch it (e.g., `npm run mcp`). When running, the MCP server exposes the browser’s accessibility tree to the agent, letting it navigate and generate tests. This can be used by contributors or automated bots *before* opening a PR, to generate or verify tests for new features. Integrating MCP might involve:

* Ensuring the devShell has the MCP server available (via NPM or a Nix derivation).
* Possibly writing a guide for developers on using VS Code or Cursor with the MCP server to have an AI agent write tests.
* Securing the MCP usage (it should run locally or on a secure CI context, not open to external abuse).

While MCP tests are not a replacement for manually written tests, they can speed up writing new tests. The strategy should treat MCP as a supplementary tool: developers can use it to draft tests which they then refine and commit. In CI, you might not run MCP (since it’s more an interactive tool), but having support for it ensures the project is “AI-agent friendly” for testing.

**Stability in E2E Tests:** To minimize flaky end-to-end tests, follow best practices:

* Use Playwright’s robust auto-waiting for elements (avoid arbitrary sleeps). Ensure each test waits for network responses or UI updates before assertions.
* If the site has any asynchronous data loading, use `page.waitForLoadState()` or await specific locator states.
* Isolate tests: reset state between tests (e.g., if any data is stored in localStorage or cookies, clear them between tests, or use Playwright fixtures to launch a fresh context for each test).
* Keep tests independent – one test failing should not cascade to others. This is achieved by not sharing state and by using fresh browser contexts as needed.
* Use proper selectors (roles, text, etc.) for resilience against UI changes.

By covering key workflows (e.g., viewing benchmarks, switching filters, etc.) and incorporating visual checks, the E2E tests will catch both functional regressions and unintended UI changes.

## 3. Component-Level Testing with Storybook

**Storybook for UI Components:** Utilize **Storybook** for building and testing UI components in isolation. Every significant component should have a Storybook story showcasing its variants (states, props, edge cases). This not only serves as living documentation but also as a testing ground. Developers can visually verify components while developing. The testing strategy includes running Storybook during development and even as part of PR review.

**PR Storybook Deployments:** Configure the CI to deploy a **preview Storybook** for each PR. For example, on each pull request, the pipeline can build the Storybook static site (using `build-storybook`) and publish it. This could be done by uploading it to a static hosting (GitHub Pages for that PR, a unique Netlify preview, or using Chromatic’s hosted service). If using Chromatic, it provides an out-of-the-box way to publish Storybook for PRs and even leaves a PR comment with a link. If self-hosting, an alternative is to attach the static Storybook as an artifact or use a third-party service to host it temporarily. The goal is that reviewers can interact with the new/changed components in isolation without checking out the branch.

**Visual Regression on Components:** Incorporate **visual regression testing at the component level**. This can be done in a couple of ways:

* **Chromatic**: A popular option which integrates with Storybook to take snapshots of stories and compare them to baseline on each PR. Chromatic will **highlight pixel diffs** and can fail the check if differences exceed a threshold. It’s a hosted solution, but free for open source projects.
* **Storycap + Playwright**: A self-hosted approach using Storybook’s test runner and Playwright. Tools like [Storycap](https://github.com/reg-viz/storycap) or Storybook’s own test-runner can systematically render every story, capture a screenshot, and then use pixel comparison (e.g., with Pixelmatch) to a baseline. This can be integrated into CI similar to Playwright’s own visual tests. James Ives notes that using Playwright (or Puppeteer) with Storybook is often sufficient for a full visual test suite, without always needing external services .

Regardless of approach, treat the **Storybook stories as the source of truth** for component appearance. Each PR that changes a component’s look will either update the baseline images (if the change is intended) or trigger a test failure highlighting unexpected changes. Visual tests should cover all core components and any complex UI pieces (charts, tables, etc.) by using stories as scenarios.

**Accessibility Testing in Storybook:** Integrate accessibility checks into Storybook. Leverage the **Storybook A11y addon** (which uses Axe under the hood) to automatically scan each story for WCAG issues. This addon can show a panel with any violations for developers in real-time. For automated checks, use Storybook’s test-runner or a separate script to run **axe-core** on every story. For example, the `@axe-core/playwright` library can be used in a custom Playwright loop through all stories (or you can use Storybook’s built-in test framework). The aim is to ensure each component is free of obvious accessibility violations (missing alt text, low contrast, improper ARIA, etc.) in isolation. These checks can be part of the CI: if any story has an accessibility issue, fail the build and report it.

Additionally, encourage developers to run the Storybook accessibility plugin during development. Automating it in CI via axe ensures no one forgets. (Note: Some teams run axe on the live application pages via Playwright too, which we cover below, but doing it on components catches issues early at the source.)

**Storybook-Driven Development Workflow:** Developers should be in the habit of adding/updating Storybook stories whenever they add or modify a component. The testing strategy should enforce that any significant UI change comes with a corresponding story (this can even be checked in code review or via a Danger.js rule). With that in place, visual and accessibility tests in Storybook will naturally cover the new changes.

## 4. Benchmarking Data Integrity Tests

The zk-wars website likely relies on structured data (e.g. JSON files of benchmark results, perhaps generated by running various zkVMs and capturing performance metrics). Ensuring the integrity and correctness of this data is critical:

**JSON Schema Validation:** Define a **JSON schema** (or TypeScript interface) for the benchmark data format. This schema should specify the expected structure (fields, types, allowed ranges). Incorporate tests that validate all benchmark JSON files against the schema. This can be done with a library like **Ajv** for JSON Schema or even a simple custom validator if using TS types. The tests should run on CI so that if someone modifies the benchmark data or the format, any deviation from the schema causes a failure. By integrating schema tests into the CI pipeline, data validation becomes a regular part of development . This catches broken or malformatted benchmark entries before they deploy.

**Data Consistency and Accuracy Checks:** Beyond schema structure, include tests that perform sanity checks on benchmark data. For example:

* Ensure required fields are non-empty and within expected ranges (e.g., no negative values for timings unless intended).
* If there are multiple data files, check cross-file consistency (e.g., each benchmark has a unique ID, or timestamps are in chronological order).
* Verify that any computed fields (like averages or throughput calculations) are correct by re-computing them in tests.

Such tests can be simple scripts that read the JSON and assert conditions. They provide an extra layer of confidence that the benchmarks shown are accurate and consistent.

**Caching Benchmark Results:** Running full benchmark suites (possibly executing cryptographic circuits or heavy computations) can be time-intensive. Implement a caching mechanism for benchmark results to avoid unnecessary recomputation. For local development, provide a utility that stores the last run results on disk (e.g., in a `.benchcache` file or directory). On subsequent runs, if the input conditions have not changed, the tool can load results from cache instead of recomputing. For example, one approach is to cache a hash of the benchmark code or version along with results; if unchanged, skip running and use cached data . Ensure there’s logic to **invalidate the cache** when appropriate – e.g., if the benchmarking code changes or the zkVM version updates, the cache should be considered stale . This might be achieved by including a version number or git commit hash in the cache key.

In CI, benchmarks might be precomputed or cached as well. Since CI starts fresh each run, one cannot rely on local disk cache across runs unless using a caching service. If the benchmarks are too slow to run on every PR, consider these strategies:

* Run a subset of quick sanity benchmarks on each PR to ensure nothing is obviously broken.
* Offload full benchmark recomputation to a scheduled job (daily) or require manual trigger when needed, and otherwise use previous results for the website.
* Use GitHub Actions cache to store benchmark outputs keyed by relevant inputs (though caching large data might be tricky and possibly not worth unless benchmarks are extremely slow).

**Forced Reruns via CLI:** Provide command-line flags in the benchmarking utility to force rerunning either all benchmarks or specific ones. For instance, `yarn benchmark --force-all` could ignore the cache and recompute everything, and `--force="benchmarkName"` could redo a specific test. Tests should cover that these flags work (i.e., actually cause recomputation and update the cache). This gives maintainers control to refresh results when needed (e.g., if they suspect an anomaly or after updating the underlying VM implementations).

**Integration with Site Build:** If the static site generation process includes running benchmarks (which it might, to embed results into pages), make sure to separate concerns: one stage produces the data (with caching), another stage builds the site from data. Write tests for the integration of these stages. For example, a test could run the benchmark generator with a small sample and verify it produces a JSON file, then run the Next.js getStaticProps function (or similar) to ensure it correctly processes that JSON into page props.

By treating the benchmark data as a first-class part of the system under test, we ensure that performance numbers shown are not only correct in one-off runs but remain correct as the code evolves. It also prevents scenarios where refactoring the data format could silently break the site’s ability to display results.

## 5. Static Site Generation (SSG) and SSR Verification

The zkVM Benchmarks site likely uses Next.js and may employ **Static Site Generation (SSG)** for speed (if the data is mostly static or updated periodically), possibly combined with some **Server-Side Rendering (SSR)** for dynamic parts. We need to test both modes:

**Build and Export Tests:** Configure tests to run after building the app. For SSG, after running `next build`, you can run `next export` (if using full static export) or just inspect the `.next` build outputs for generated HTML. Write a test that verifies critical pages are generated. For example, after build/export, check that the output directory has an `index.html` and pages for each benchmark category, etc. This can be done with Node’s filesystem APIs or simple smoke tests (e.g., use a headless browser or HTTP request to serve the `out/` directory and ensure it returns 200 for key routes). Essentially, ensure the static generation didn’t fail to include something important.

If using **Incremental Static Regeneration (ISR)** or server-side rendering, set up a test scenario where the Next.js server runs in production mode (`next start`). Then:

* Ping the homepage and key pages and assert they respond with status 200 and contain expected content (perhaps using an HTTP client or Playwright in a non-interactive way).
* If SSR logic (like `getServerSideProps`) is used, test those code paths by calling them directly in a Node test or via a running server.

**Next.js Modes:** It’s valuable to test the app in both development mode and production mode:

* **Dev mode** (`next dev`): faster startup, might have different behavior (like more reloads, not minified).
* **Prod mode** (`next build && next start`): closer to real deployment, catches issues like missing environment variables or build-time errors.
* **Static export** (`next export` if applicable): ensures the site can be fully exported to static files (which might be the case if using only SSG features and no server-only code).

Automate running tests in at least the production mode, since that simulates the real usage. For example, the CI can do:

```yaml
- run: next build
- run: next start &  # start in background
- run: npx playwright test --grep @ssr   # run only tests tagged for SSR checks
```

And similarly possibly run `next export` and then a quick check:

```yaml
- run: next export
- run: npx http-server ./out &  # serve exported files
- run: npx playwright test --grep @static
```

Where tests tagged `@static` verify the static output.

**Dynamic Content Consistency:** If certain pages are supposed to be pre-generated and not change across requests, we can test that consistency. For example, generate the site, then run a local web server for the static files and fetch a page twice to ensure it’s the same. Conversely, if some content is dynamic (like “last updated” timestamps), tests might need to allow some variance or mask out dynamic fields in comparisons.

**SEO & SSR Rendering:** For an SSG site, also consider adding tests for critical SEO aspects (since SSR/SSG is often about SEO). For instance:

* Verify that the `<head>` of pages contains expected `<title>` and meta tags (like description, or OpenGraph tags) if they are generated based on content.
* Use a lightweight DOM parser in a test to validate these static HTML contents.

**Error Page Testing:** Ensure that the static build produces a 404 page or error page if applicable, and test that they render appropriately (both in static form and via server). This is often overlooked but is part of SSG/SSR output.

The primary purpose of these tests is **to catch any build-time or render-time errors**. If a React component or page has an issue that only appears when rendering outside the dev HMR context (for example, using a browser-only API without a guard, which would break SSR), these SSR tests will catch it. They also ensure that when the site is deployed, all pages actually work (no broken links or runtime crashes on load).

## 6. Code Quality and Integration Tests

Quality checks keep the codebase maintainable and prevent bugs from entering:

**ESLint and Formatting:** Enforce coding standards with **ESLint**. The project should have an ESLint config (possibly extending the Next.js recommended rules and maybe Airbnb or other style guides). In CI, run `eslint . --max-warnings=0` (or the equivalent via `next lint`) to ensure no lint errors or warnings. Also run a formatter (like **Prettier**) check – e.g., `prettier --check .` – to ensure code is consistently formatted. This catches style issues early and avoids nitpicking in code reviews. These checks run quickly and should be the first steps in CI (so developers get immediate feedback if something as simple as an import order is wrong or a semi-colon missing).

**TypeScript Type Checking:** Even if using `tsc` is not required to build (Next.js does its own type checks on `next build`), explicitly run **TypeScript’s compiler** in CI to catch any type errors. This could be `tsc --noEmit` or relying on `next build` (which fails on type errors by default in strict mode). Ensuring type safety is crucial, especially for a data-heavy application like benchmarks where type mismatches could lead to incorrect data shown.

**Unit Tests (Vitest/Jest):** Write **unit tests** for pure functions and small modules. For example, if there are utility functions to format numbers (e.g., pretty-printing big numbers or calculating averages), those should have direct tests. Use **Vitest** (for faster, Vite-powered testing) or **Jest** as a testing framework. These tests run in a Node or jsdom environment without a browser, focusing on logic. Vitest has good integration with Vite/React and is typically faster, but Jest is also fine; both can use React Testing Library for component tests. According to Next.js documentation, Vitest and React Testing Library can be set up easily to test components in isolation【6†L1-L8】. Whichever framework is chosen, include setup for DOM testing (jsdom) so that React components can be rendered and assertions made on their output.

**Integration Tests (Component + Library integration):** Some tests fall between unit and E2E – e.g., testing a React component’s behavior interacting with a data fetching function, or testing a custom hook. Use **React Testing Library** to render components in a simulated DOM and verify they behave correctly with given props or context. For instance, a `<BenchmarkChart>` component could be tested by feeding it sample data (perhaps from a fixture JSON) and asserting that it renders the correct number of bars and labels. This does not require a real browser, but ensures that the component logic works and that edge cases (like empty data sets) are handled.

For Next.js-specific integration, you might use **Next.js testing utilities** (if available) or simply test pages as regular React components by mocking out Next router or data dependencies. There are libraries like `next-page-tester` that help render Next pages in tests, but they might not be needed if you focus on testing the component logic and leave page navigation to E2E.

**Coverage and Maintenance:** Aim for a good test coverage on critical modules (not just lines, but covering important branches and cases). Use coverage reports (Vitest and Jest can output coverage info) to identify gaps. As the project grows, maintain a practice that new features come with tests. The code review process can list lack of tests as a blocking issue.

**Linting for Tests and Config:** Also consider having lint rules for tests (for example, to avoid accidentally skipping tests, or to enforce proper waiting in E2E tests). There are ESLint plugins for Jest/Testing Library that ensure best practices (like not using improper selectors or not leaving `.only` in test files). These can prevent common mistakes that lead to fragile tests.

Finally, integrate these tests into developer workflow: e.g., allow running `npm run test:unit` in watch mode locally for TDD, and perhaps use pre-commit hooks (via lint-staged) to run linters/tests on changed files to catch issues before CI.

## 7. Accessibility and Performance Testing

**Accessibility (a11y) Compliance – WCAG 2.1 AA:** The goal is to enforce that the site meets **WCAG 2.1 AA** standards as much as automated tools can verify. Automated accessibility tests should be part of both component testing and end-to-end testing:

* In Storybook (component level), as mentioned, run axe-core against each story. This catches issues in isolated components.

* In E2E, after page interactions, run accessibility scans. Playwright offers integration with **axe** via the `@axe-core/playwright` library. For example, you can do:

  ```js
  const AxeBuilder = require('@axe-core/playwright').default;
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  ```

  This will scan the current page for any violations of WCAG 2.1 A and AA success criteria【11†L221-L229】. By filtering to those tags, we focus on legally important issues. Such a scan can be done on a few key pages or states (for example, the home page, a benchmark results page, etc.). It’s not necessary to scan every page in every test (that might be redundant), but a nightly run could scan all pages.

* Use **Lighthouse** for an additional accessibility audit. Lighthouse’s accessibility score aggregates a bunch of checks (many powered by axe as well). Set up **Lighthouse CI** in the pipeline to run on the deployed preview or localhost. The Lighthouse CI CLI can produce a report and score. Enforce a threshold (e.g., 100% accessibility score, or at least > 90). If the score drops due to a new change, treat it as a failure to be addressed. Lighthouse can catch things like color contrast issues, which are part of WCAG AA.

**Performance Testing (Web Performance):** Since this is a benchmarks site, performance of the site itself is important for user experience but perhaps not as critical as the correctness of data. Still, use Lighthouse (or WebPageTest, etc.) to monitor performance metrics (like Time to Interactive, First Contentful Paint). Set up performance budgets: e.g., ensure the home page stays under a certain size or time. Lighthouse CI allows setting budgets and will fail if a metric regresses beyond a threshold. This prevents bloat over time (such as accidentally shipping a very large image or JS bundle).

**Lighthouse CI Integration:** On each PR, run Lighthouse in CI against a temporary deployment or against `localhost` (the `next start` server). There is a GitHub Action for Lighthouse CI that simplifies this. It can post results to a dashboard or even comment on the PR. At minimum, have it output an HTML report as an artifact for maintainers to review if needed. Focus on the accessibility and performance categories of Lighthouse. (SEO and best practices categories can also be included; they may catch things like missing meta tags or using http resources.)

**Manual a11y Reviews:** Automated tests won’t catch everything (e.g., whether alt text is truly descriptive). As part of the strategy, include guidance that **UX/design reviewers or QA do manual accessibility testing** (like keyboard navigation checks, screen reader spot checks) especially on major new UI features. While not part of CI, this should be in the definition of done for features.

**Enforcing Accessibility in CI:** Decide on a policy that any new axe violation is a CI failure. This might mean having zero violations as a baseline. Because some WCAG aspects can’t be auto-detected, focus on what can be: e.g., no images without alt, form fields with labels, sufficient contrast (axe can flag some contrast issues), etc. The Playwright + axe tests described will ensure no *automatically detectable* violations exist on tested pages【11†L228-L235】. Any violation reported should fail the build, forcing developers to address it or get a waiver if it’s a false positive.

By treating accessibility with the same seriousness as other tests, the project will maintain a high standard of inclusivity. The combination of **axe-core scanning and Lighthouse audits** covers a wide range of issues automatically.

## 8. Review and Reporting in Pull Requests

Having all these tests is only useful if the results are clearly communicated to developers. Each pull request should come with a **comprehensive report** of the testing outcomes:

* **Automated PR Comment or Summary:** Use the CI system to provide a summary of results. For instance, GitHub Actions can produce a **workflow run summary** (via `${{ job.summary }}`) that lists key outcomes: how many tests ran, how many passed, any new visual changes, performance scores, etc. Alternatively, a bot or **Danger.js** can post a comment on the PR summarizing issues. For example, Danger could report: “\:red\_circle: E2E tests failed 2/50 tests. \:warning: Axe found 1 accessibility violation (missing form label on XYZ). \:sparkles: 2 visual changes detected (see artifacts). :100: ESLint/TypeScript passed with no errors.” This gives a quick at-a-glance status beyond the raw CI logs【12†L5-L12】.

* **Visual Diffs in PR:** When visual regression tests find differences, include the diff images in the PR discussion. If using a service like Chromatic, it will handle this by showing the changed component images and requiring approvers to accept or reject changes. If doing it manually, consider uploading the before/after/diff images to a cloud storage or as GitHub artifacts, and linking to them. Test reports could also link to the Storybook preview so reviewers can manually verify the UI if needed.

* **Accessibility Report:** If any accessibility tests fail, list the violations in the PR summary (with descriptive messages). For example, axe returns messages like "Button must have discernible text". Surface those so the developer knows what to fix. If Lighthouse runs, include key scores (performance, accessibility percentage) and note if they dipped below the required threshold.

* **Benchmark Data Changes:** If a PR updates benchmark results, consider generating a small report of how data changed. For instance, if JSON data was updated, maybe run a diff of old vs new (if meaningful) and report if any major benchmark metric changed unexpectedly. This might be more of a manual code review task, but a script could flag if, say, a performance number changed by more than X%, prompting a closer look.

* **Failing the Pipeline:** The CI pipeline should be configured to **fail (red status)** if any critical test category fails. This includes:

  * Unit/integration tests or build errors – obviously fail.
  * E2E test failures – fail.
  * Visual regression – if any unexpected visual diff appears, mark the build as failed (unless using an approval workflow like Chromatic where it's more nuanced). Generally, treat visual diffs as failures that require either updating the baseline (for intentional changes) or fixing the UI.
  * Accessibility violations – fail.
  * Performance regressions – fail if beyond allowed budget.
  * Linting/style – fail (so that developers fix style issues).

  Essentially, **no PR should be merged if it introduces a test regression** in any of these areas. There may be a process to override in exceptional cases, but that should be manual and rare.

* **Artifacts and Logs:** Ensure that CI retains useful artifacts for troubleshooting. For example, if a test fails, have Playwright capture a screenshot of the page at the time of failure or a video of the test run (Playwright can record videos on test failure). Upload these so developers can inspect what went wrong. Similarly, if Lighthouse fails performance budget, provide the full report (HTML or JSON) so the team can see which metric caused it.

All these reporting measures speed up the feedback loop: developers can quickly identify what went wrong and address it, without needing to rerun everything on their own or guess at issues.

## 9. Future Scalability and Minimizing Flakiness

As the project and test suite grow, it’s important to keep the tests reliable and efficient:

* **Parallelize and Optimize:** Utilize the fact that many test tools support parallel execution. Playwright by default will run tests in parallel (across browsers or shards). Vitest runs tests in parallel threads. Ensure the CI is using multiple cores and possibly multiple jobs to cut down total test time. If test suite becomes very large, consider splitting tests into separate workflows that run concurrently (for example, run unit tests on one runner, E2E on another in parallel). GitHub Actions allows matrix or separate jobs for this.

* **Selective Testing:** For scalability, one can implement selective running of tests. For instance, if a change only affects a specific component, maybe only run that component’s visual tests. This can be complex to do automatically, but tagging tests or using changesets can optimize CI. However, since the question emphasizes running all tests on every PR, the baseline is to run everything, which is safer. But in the future, if performance becomes an issue, tools like Nx or Turborepo can detect affected projects and run only relevant tests. A simpler approach: allow maintainers to trigger a lighter test run for draft PRs vs a full run for final PR (not a priority unless CI times become a problem).

* **Test Flakiness Measures:** Flaky tests (tests that sometimes fail for non-code-change reasons) should be aggressively fixed or isolated. Common causes are timing issues, external resource dependency, or environment differences. To reduce flakiness:

  * Keep tests **hermetic** – e.g., if tests rely on network calls, prefer to stub them out. In a benchmarks site, maybe no external calls are needed; if they are (say fetching data from an API), use Playwright’s request interception or a mock server during tests to eliminate network variability.
  * Avoid any reliance on real time or order. If a test uses current date/time, fix the time in tests (e.g., use fake timers or inject a static date).
  * **No randomness** in tests without control. If random data is needed, seed the random generator to a constant value. As a general principle, *deterministic inputs yield stable tests*【29†L5-L8】.
  * When doing visual comparisons, if minor anti-aliasing differences cause false failures, consider setting a small pixel difference tolerance in the comparison, or mask out known unstable regions. For example, if a component shows the current date, in the story or test set it to a fixed date so the screenshot doesn’t change every day.
  * Use consistent environments: with Nix and locked browser versions, we already minimize OS differences. Ensure CI uses the same version of Chrome/Firefox each time (Playwright handles this by bundling specific browser versions). This prevents flake due to rendering differences.
  * If some tests are inherently flaky due to external factors (say a performance timing that sometimes is off by a few ms), implement a retry mechanism for that test or loosen the assertion (e.g., expect response in <500ms might occasionally fail if 510ms; better to give more headroom or use average of multiple runs).
  * Track flaky tests: If a test fails intermittently, mark it somehow (in Playwright, you can tag or mark tests and skip known flaky ones conditionally) and open an issue to fix it. Do not let them languish; either fix the flakiness or remove the test if it’s not giving value.

* **Maintaining Test Assets:** Over time, baseline screenshots and caches can accumulate. Have a strategy for updating and cleaning them:

  * When design changes intentionally, update the baselines in the same PR as the code change (Chromatic or manual baseline update).
  * Delete baselines for removed components.
  * For the benchmark cache, if using a file, ensure that outdated cache files are cleaned or named by version to avoid confusion.

* **Tool Upgrades:** Periodically upgrade testing tools (Playwright, Vitest/Jest, Storybook, etc.) to get improvements but do so carefully. Use a separate branch to bump versions and run the full test suite to see if anything breaks. For example, a new Playwright might produce slightly different screenshots (due to browser engine changes); be prepared to update baselines. A new ESLint rule might start flagging code – decide if you want to adopt it or disable it. By budgeting time for these maintenance tasks, the test suite stays modern and effective. Pin versions in Nix and package.json to avoid surprise updates, and then bump intentionally.

* **Scalability of Benchmarks:** If the number of benchmarks grows or new types are added, make sure the schema and tests can handle it. A future consideration could be property-based testing for benchmark data (generating random plausible data to test the site’s handling). Also, if benchmarks need to run on multiple platforms, consider using CI matrix (e.g., run on Linux and Mac if performance differs). For now, likely not needed unless comparing outputs.

* **Monitoring After Deployment:** While not exactly testing, consider using monitoring tools (like Sentry for error logging, or automated uptime checks) once the site is live. This is beyond CI testing, but it’s the next safety net: if something slips through (like a rare bug), monitoring will catch it and alert the team.

In summary, this testing strategy ensures that at every stage – from a developer’s local environment to the CI pipeline – the zkVM Benchmarks website is thoroughly checked. **Every pull request** will be validated for code quality, component integrity, visual consistency, data correctness, accessibility, and performance. By automating these checks and enforcing a high standard (failing builds on regressions), the project can move fast without breaking things. Moreover, the use of Storybook and visual tests will increase confidence in UI changes, and the use of Nix and consistent tooling will minimize those frustrating “it works locally but not in CI” issues. Adopting these practices will make the codebase robust and maintainable in the long run, and ensure that users of the site get a reliable experience with accurate benchmark information.
