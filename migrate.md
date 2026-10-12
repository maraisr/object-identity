# Minimal Node library migration

Recipe and implementation log for `object-identity`, 2026-10-12.
All work is local: no commits, tags, pushes, GitHub writes, or registry releases.

## Use this in another package

Copy this file and ask:

> Migrate this repository using migrate.md. Inspect its existing contract first,
> apply the minimal setup below, verify the actual package consumers will install,
> and update the implementation log with steps taken and gotchas. Do not commit,
> publish, or make remote changes.

Adapt entry points and existing consumer requirements, not the scope. Do not
introduce a framework, shared tooling package, or extra scripts/configuration
just because several repositories will follow this recipe.

## Final tooling and constraints

| Area                | Choice                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| Dependencies        | pnpm, pinned through `packageManager`, with `pnpm-lock.yaml`.                       |
| Build               | tsdown over Rolldown/Oxc; one small config, no custom build script.                 |
| Type checking       | TypeScript's `tsc`, extending `@marais/tsconfig`.                                   |
| Tests               | `node:test` and `node:assert/strict`; execute TypeScript directly.                  |
| Benchmarks          | Mitata for measurement; retain the original compact display with a small formatter. |
| Lint                | Oxlint defaults, warnings treated as failures; no separate lint config.             |
| Format              | Oxfmt with tabs and single quotes.                                                  |
| Publication cleanup | `clean-publish --without-publish`, then the existing npm staging command.           |
| Registry            | npm only. Remove JSR tooling/links; do not unpublish existing releases.             |

Keep exactly these package scripts:

| Script      | Command                                                   |
| ----------- | --------------------------------------------------------- |
| `build`     | `tsdown`                                                  |
| `test`      | `node --test`                                             |
| `typecheck` | `tsc --noEmit`                                            |
| `bench`     | `node --expose-gc lib/mod.bench.ts`                       |
| `lint`      | `oxlint --deny-warnings`                                  |
| `fmt`       | `oxfmt`                                                   |
| `check`     | `tsc --noEmit && oxlint --deny-warnings && oxfmt --check` |

`check` does not run tests or build. Run those separately. Pass watch, coverage,
and formatting-check flags inline rather than adding more script names.

Every direct `devDependency` must be an exact version, such as `"1.2.4"`.
This rule does not apply to runtime `dependencies`. Do not add `.node-version`,
`pnpm-workspace.yaml`, or a replacement config file for either.

Use a supported Node version for development; CI currently covers 24 and 26.
This does not make the library Node-only or authorize adding a new consumer
`engines.node` requirement. Retain existing ESM/CJS exports and zero runtime
dependencies here.

## Migration steps

1. **Inventory the contract.** Read source, tests, manifests, build/benchmark
   scripts, CI, and README. Record public entry points, formats, declaration
   paths, runtime dependencies, intentional test skips, benchmark fixtures,
   release tags, and approval requirements. Do not redesign the library.
2. **Consolidate dependencies.** Make `package.json` the only package/version
   source. Convert `npm:` and import-map dependencies to ordinary imports.
   Keep test libraries and benchmark competitors development-only. Install
   with `pnpm add -D -E` and inspect the resulting version strings.
3. **Use the shared TypeScript base.** Extend `@marais/tsconfig`; add only
   necessary overrides for erasable TypeScript, `.ts` import extensions,
   isolated declarations, and the files to check. Keep type checking separate
   from execution and compilation.
4. **Replace the build.** Use tsdown to emit `dist/index.js`, `index.cjs`,
   `index.d.ts`, and `index.d.cts`. Preserve the existing `esnext` target and
   select `platform: 'neutral'`. Keep source readable; do not add minification
   as part of a tooling migration.
5. **Wire the npm package.** Point ESM and CJS export conditions at their own
   JavaScript and declaration files. Retain `main`, `module`, `types`,
   `./package.json`, and `sideEffects: false`. Allowlist `dist`, `license`, and
   `readme.md`. Do not copy metadata with a custom build script.
6. **Port tests mechanically.** Replace `Deno.test` with `test` from `node:test`.
   Use `node:assert/strict`: `deepEqual`, `notDeepEqual`, `doesNotMatch`, and
   `throws` replace the existing assertions. Preserve structural comparison,
   property-test run counts, wire-format expectations, and the deliberate skip.
7. **Port measurement, preserve display.** Mitata computed parameters generate
   fresh input outside measured time. Keep candidate options and preflight
   checks. Format results as the original summary and grouped ops/sec
   comparisons, including baseline markers and ratios. Log unsupported cases
   to stderr and continue without adding them to the report.
   Run `lib/mod.bench.ts` as an ordinary Node script. It imports the `bench`
   helper, owns its loops and preflight checks, and awaits each measurement.
   The helper handles Mitata execution and reporting, not file discovery.
8. **Update CI and staged publishing.** Install the pinned pnpm version, use
   frozen installs, run checks/tests/build, and prepare a cleaned package.
   Preserve provenance, human approval, and the stable/`next` tag split.
   Never stage or publish as a validation step.
9. **Verify and record.** Check the emitted files and a clean installed tarball,
   including ESM/CJS and TypeScript consumers. Record actual results and remove
   scratch output. Do not retain extra test harnesses or validator dependencies
   unless they are needed by the package.

### Dependency age without another config file

CI sets `PNPM_CONFIG_MINIMUM_RELEASE_AGE: 4320` to retain the original three-day
dependency-age policy. Use the same environment variable locally when resolving
or updating dependencies:

```sh
PNPM_CONFIG_MINIMUM_RELEASE_AGE=4320 pnpm install
```

This is not a repository-wide local default once `pnpm-workspace.yaml` is
removed. Do not silently claim otherwise or change the user's global settings.

### Publishing a cleaned manifest

The source manifest keeps development scripts and dependencies. The copy packed
for npm must not contain `scripts`, `devDependencies`, or `packageManager`.
Use the same preparation as CI:

```sh
pnpm build
pnpm exec clean-publish --without-publish --temp-dir .publish --fields scripts,devDependencies,packageManager
npm pack --dry-run ./.publish
```

`.publish` is disposable output, ignored by Git. The cleaner refuses to overwrite
an existing directory; remove only that known scratch directory before preparing
another copy. Packing/publishing the repository root bypasses this cleanup.

No `prepack`, `prepublish`, `publish`, or `postpublish` script is added. CI builds
explicitly, prepares `.publish`, then runs the existing `npm stage publish`
inside it, with provenance and public access. Prereleases still use `--tag next`.
Tags must match `package.json`'s version. Only a separately authorized release
may execute the staging command.

### README and benchmark policy

The README must remain identical to its original content except for removing
the JSR installation line and adding `npm add object-identity`. Do not add a
development section, replace the size claim, refresh the numbers, or reformat it.
Oxfmt explicitly ignores `readme.md` to enforce that boundary.

The earlier expanded README and Mitata tables were reverted at the user's
request. Its benchmark numbers and "543B minified and gzipped" claim are retained
historical content, not measurements of this migrated build.

`pnpm bench` prints the old compact layout: one summary row per scenario, then
measured candidate groups with aligned ops/sec, a `+` baseline marker, and ratios.
Unsupported cases are logged to stderr, not represented as table rows.
`pnpm bench --format markdown` prints the matching fenced
blocks and collapsible details for manual use. Neither command reads or writes
the README. Unknown formats fail rather than silently falling back.

The flow is `pnpm bench` (or `npm run bench`) -> `lib/mod.bench.ts`, which
imports `{ bench }` from `scripts/bench.ts`. There is no discovery or required
suite-export schema: benchmark source is an ordinary executable script.

The small Deno-like API accepts a native Mitata callback directly:

```ts
import { bench } from '../scripts/bench.ts';

await bench('stringify', () => JSON.stringify({ a: 1 }));
```

Or pass `{ fn, group, baseline }` as the second argument. `fn` can be
a normal callback or a Mitata generator using computed parameters. The source
file performs its candidate preflight checks, logs unsupported cases, and
continues without calling `bench` for them. There is no `ignore` option.
`baseline: true` selects the comparison baseline; otherwise the first measured
row in the group is used.

Await each call so measurements do not overlap. The helper uses Mitata's
per-benchmark execution API, with errors propagated, and prints the accumulated
report once at natural, successful script completion (`beforeExit`). No extra
`run()` call, registration framework, package-name coupling, or output code is
needed in the benchmark source. The helper never rewrites the README.

## Changes applied here

| Surface                         | Final change                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `package.json`                  | Seven scripts, exact dev dependencies, pnpm pin, dist exports/files. Name and version remain `object-identity@0.2.3`. |
| `pnpm-lock.yaml`                | Reproducible dependency graph; no workspace configuration.                                                            |
| `tsconfig.json`                 | Extends `@marais/tsconfig`, with only migration-required overrides.                                                   |
| `tsdown.config.ts`              | Small typed configuration for the runtime-neutral dual-format build.                                                  |
| `.oxfmtrc.json`                 | Tabs/single quotes, no manifest reordering; ignore generated lockfile and preserved README.                           |
| `lib/mod.test.ts`               | Node test registration/assertions; original behavior and one skip retained.                                           |
| `lib/mod.bench.ts`              | Executable benchmark source: fixtures, candidates, preflight checks, and awaited `bench` calls.                       |
| `scripts/bench.ts`              | Reusable `bench` API wrapping Mitata, arguments, and compact/Markdown reporting of measured cases only.               |
| `.github/workflows/ci.yml`      | Node 24/26 health, inline coverage, clean-package dry run, preserved npm staged releases.                             |
| `.gitignore`                    | Ignore `dist` and `.publish` instead of the old generated `npm` directory.                                            |
| `readme.md`                     | JSR line removed; `npm add object-identity` added. Everything else restored.                                          |
| `deno.json`, `scripts/build.ts` | Removed; no Deno commands or custom build remain.                                                                     |
| `lib/mod.ts`                    | No algorithm, wire-format, or public API changes.                                                                     |

## Implementation log and gotchas

1. The first working pass used tsdown, native Node tests, Mitata's standard
   Markdown output, standalone Node/pnpm/lint configuration, package validators,
   and an installed-package test harness.
2. The user requested a micro-library setup. Removed `.node-version`,
   `pnpm-workspace.yaml`, `.oxlintrc.json`, the custom package-test harness, and
   the publint/attw direct dependencies. Reduced scripts to the seven above.
   Installed `@marais/tsconfig` and `clean-publish`, and pinned all dev versions.
3. The user then restricted README edits and preferred the original benchmark
   display. Restored the README, excluded it from formatting, and repurposed
   `scripts/bench.ts` as a compact formatter. Verified its output against every
   original README benchmark row and ratio, without altering those numbers.
4. Confirmed the cleaner creates a separate manifest without the three requested
   development fields and leaves the source manifest intact. Found a failure-
   propagation issue in its publish wrapper, so CI only uses its preparation
   mode and invokes npm directly for actual staging.
5. In an intermediate revision, moved benchmark execution into `scripts/bench.ts`.
   `lib/*.bench.ts` supplied definitions like test source files. The shared
   contract was type-only, avoiding a runtime import cycle. Measurement IDs
   included the source filename so matching scenario names in different files
   could not overwrite each other's results. The displayed layout stayed unchanged.
   Exercised `npm run bench` with a temporary second definition using a duplicate
   scenario name: both suites ran without colliding, all original comparisons
   remained present, and the README stayed unchanged. Removed the temporary
   definition afterward; no extra files or dependencies were retained. Node 24
   also loaded definitions without starting a run or printing output.
6. Replaced that discovery layer with the user's preferred callable API.
   `lib/mod.bench.ts` runs directly again, imports `bench`, performs its own
   preflight checks, and awaits calls with native Mitata callbacks. The helper
   owns timing, diagnostics, and automatic reporting. Removed the suite-export
   contract, globbing, package-name lookup, and pending-result registry.
   Verified sync/async callbacks, computed-parameter generators, explicit skips,
   error propagation, and one automatic report on Node 24/26. A full direct
   run retained all five scenarios, 59 measurements, and six skips without
   touching the README. Ordinary tests and `pnpm check` still pass.
7. Removed the `ignore` option after the user approved omitting unsupported
   table rows. Preflight now logs its reason and continues before calling
   `bench`. Simplified the helper and formatter to measured numeric results
   only; the README's historical benchmark block remains unchanged.
   A full run confirmed five summaries, 59 measured candidate rows, six stderr
   skip diagnostics, and no unsupported rows in stdout. Type checking, lint,
   and formatting of the changed files passed.
8. Retried `pnpm check`: its remaining failure is Oxfmt wanting to expand the
   original one-line `let` declaration in `lib/mod.ts`. The user explicitly
   chose to leave that file unchanged. Do not silently reformat it or disable
   its formatting check; this repository-wide check remains unresolved.

| Gotcha                                                                           | Resolution                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm retains an explicitly supplied range even with `--save-exact`.              | Removed every dev range and checked every final version string. Pass exact versions, not range specifiers, when adding dev dependencies.                                                                                                   |
| pnpm 12 does not accept `--minimum-release-age` on `add` or read `npm_config_*`. | Used `PNPM_CONFIG_MINIMUM_RELEASE_AGE=4320`; confirmed it resolves to 4320. No replacement config file or global mutation.                                                                                                                 |
| Native Node TypeScript does not type-check or read tsconfig path aliases.        | Keep `tsc --noEmit`, explicit `.ts` imports, and erasable syntax.                                                                                                                                                                          |
| The shared base enables JavaScript checking.                                     | Override both `allowJs` and `checkJs` to false for isolated TypeScript declarations; retain the base's strictness and other settings.                                                                                                      |
| Isolated declaration checking also covers exported config/functions.             | Type the tsdown config as `UserConfig` and explicitly type the exported `bench` API, deriving its callback type from Mitata.                                                                                                               |
| The first type check lacked `object-hash` and React declarations.                | Add `@types/object-hash` and `@types/react`. React is development-only, needed by the existing SWR benchmark; no blanket module stubs.                                                                                                     |
| Node's `require(esm)` can hide a wrong CommonJS mapping.                         | Verify both actual resolved filenames and execution, not just whether require succeeds. Use separate `.d.ts` and `.d.cts`.                                                                                                                 |
| Reusing benchmark objects can measure identity caches instead of work.           | Mitata computed parameters create inputs outside the timer. A diagnostic observed 130 unique inputs for 130 calls and confirmed allocation precedes the generated timing block.                                                            |
| Unsupported candidates and missing results are different.                        | Log preflight skips to stderr and omit their rows; fail on baseline errors, import errors, invalid measurements, and unexpected errors during timing.                                                                                      |
| `clean-publish` retains some lifecycle scripts by default.                       | Explicitly remove the whole `scripts` field, plus dev dependencies and the pnpm pin.                                                                                                                                                       |
| `clean-publish@7.1.0` can swallow the publish subprocess exit code.              | Its wrapper ignores the returned code; a nonzero-child probe confirmed tinyexec resolves instead of throwing. Prepare with `--without-publish`, then run `npm stage publish` directly in CI. No registry operation was used to probe this. |
| The old dry run invoked `npm version patch` in a generated package.              | Delete that step: doing it in the new root would mutate source and can create a commit/tag.                                                                                                                                                |
| The old gzip metric included a separate minification pass.                       | The emitted unminified ESM measured 809 gzip bytes during migration; not comparable to 543 minified gzip bytes. Preserve the README claim as requested, with this distinction logged here.                                                 |
| pnpm warns about deprecated transitive `@yuku-*` tooling packages.               | Leave upstream warnings visible rather than forcing overrides; none become library runtime dependencies.                                                                                                                                   |

### Versions resolved

pnpm 12.4.1; `@marais/tsconfig` 0.0.5; TypeScript 7.0.2; tsdown 0.23.0
(Rolldown 1.2.13); Oxlint 1.87.0; Oxfmt 0.72.0; Mitata 1.0.34;
clean-publish 7.1.0. The lockfile is authoritative for the complete graph.
TypeScript 7 supplies native `tsc`; no preview compiler or TypeScript loader
was added.

### Verification log

- Before the minimal revision, the 82 active unit/property tests and four
  clean-tarball checks passed on Node 24.21.0 and 26.8.2. The known limitation
  stayed skipped, and Node 24 reported 100% source line/branch/function coverage.
  The extra package-test harness was then removed, not retained as tooling.
- The reduced shared-tsconfig setup passed type checking, lint, and dual-format
  builds. Exact dev versions, seven scripts, and cleaned/source manifest
  separation were checked directly.
- A full Mitata run completed all five scenarios: 59 measured comparisons and
  six explicit unsupported combinations. Fresh-input timing was verified
  separately.
- The compact formatter reproduced the original README summary, candidate
  rows, alignment, and ratios exactly when given the original measurements.

Verification recorded during the migration; later refinements and the current
formatting-check exception are logged above:

| Check                                                    | Result                                                                                                                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen pnpm install and `pnpm check`                     | Passed with the final lockfile, shared tsconfig, Oxlint defaults, and Oxfmt configuration.                                                                                                    |
| Source tests on Node 24.21.0 and 26.8.2                  | 82 passed and one intentional skip on each; 100% source lines, branches, and functions covered.                                                                                               |
| Builds on both Node versions                             | Both JavaScript formats and their matching declarations emitted successfully. Runtime source changes are formatting-only.                                                                     |
| Cleaned npm tarball                                      | Exactly seven files: four distribution files, license, README, and package.json. No scripts, dev dependencies, or package-manager field in the installed manifest; source manifest unchanged. |
| Installed ESM/CJS and declarations on both Node versions | Runtime resolution selected the correct files with TypeScript stripping disabled; `.mts` and `.cts` consumer type checks passed.                                                              |
| Full behavior suite against both installed builds        | 164 passed and two original skips per Node version. The verification harness and consumer directories were temporary, not added to the repository.                                            |
| Compact benchmark output on Node 26                      | Five summary rows and all 65 candidate rows: 59 measurements and six explicit skips.                                                                                                          |
| Markdown benchmark output on Node 24                     | Original fenced summary/diff blocks and collapsible details, with the same expected row counts. Invalid format values fail.                                                                   |
| README isolation                                         | Both benchmark modes left it byte-for-byte unchanged. Its complete Git diff is only the JSR-line removal and npm installation example.                                                        |
| Minimal setup                                            | Exactly seven scripts and exact dev versions; no Node-version, pnpm-workspace, lint-config, custom build, or permanent package-test files remain.                                             |

The hosted Ubuntu arm64 workflow and registry staging are intentionally not
executed locally. They remain for an explicitly authorized future push/release.

## References

- [Node TypeScript execution](https://nodejs.org/docs/latest-v24.x/api/typescript.html)
- [Node test runner](https://nodejs.org/docs/latest-v24.x/api/test.html)
- [tsdown](https://tsdown.dev/)
- [Mitata computed parameters](https://github.com/evanwashere/mitata#computed-parameters)
- [pnpm configuration](https://pnpm.io/configuring)
- [clean-publish](https://github.com/shashkovdanil/clean-publish)
- [npm staged publishing](https://docs.npmjs.com/cli/v11/commands/npm-stage)
