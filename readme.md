<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A tiny, fast utility that canonicalizes any value into a stable identity, for structurally
equality.**

<br>
<br>

<sup>

This is free to use software, but if you do like it, consider supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚡ Features

- 🧬 **Canonical.** The same shape always produces the same id.
- 🌀 **Deep and cycle-safe.** Handles nested objects, arrays, sets, maps, and circular references.
- 🏎 **Fast.** See the [benchmarks](#-benchmark).
- 🪶 **Tiny.** Around 543B minified and gzipped, with zero
  [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## ⚙️ Install

- **npm** — available as [`object-identity`](https://www.npmjs.com/package/object-identity)
- **JSR** — available as [`@mr/object-identity`](https://jsr.io/@mr/object-identity)

## 🚀 Usage

```ts
import { identify } from 'object-identity';

// same shape, different key order, same id
identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true

// a plain object and an equivalent Map produce the same id
identify({ a: 'b' }) === identify(new Map([['a', 'b']])); // true

// nesting, Sets, Dates, and RegExps are all supported
const key = identify({ user: 7, filters: new Set(['active', 'new']) });
```

## 💨 Benchmark

- **simple** a complete nested object, with an arrays and other mixed primitives.
- **deep** a long, narrow nesting chain.
- **deep circular** the deep chain, but every node points back and the tail closes the loop.
- **big** a wide object: hundreds of keys, but with small values.
- **leafy** a large flat array of mixed primitives.

<!-- BEGIN BENCHMARK -->

```
✔ simple         829,712 ops/sec
✔ deep           117,578 ops/sec
✔ deep circular  169,652 ops/sec
✔ big             11,664 ops/sec
✔ leafy           41,925 ops/sec
```

<details><summary>All candidates</summary>

```diff
simple
+ ✔ object-identity               829,712 ops/sec
  ✔ safe-stable-stringify         544,561 ops/sec  1.52x
  ✔ ohash                         257,343 ops/sec  3.22x
  ✔ object-hash                    96,890 ops/sec  8.56x
  ✔ hash-it †                     328,222 ops/sec  2.53x
  ✔ json-stable-stringify         309,313 ops/sec  2.68x
  ✔ fast-json-stable-stringify    458,943 ops/sec  1.81x
  ✔ tiny-stable-stringify         402,523 ops/sec  2.06x
  ✔ json-stringify-deterministic  311,265 ops/sec  2.67x
  ✔ json-sorted-stringify         402,961 ops/sec  2.06x
  ✔ canonicalize                  267,754 ops/sec  3.10x
  ✔ swr/_internal/stableHash      250,439 ops/sec  3.31x
  ✘ @tufjs/canonical-json

deep
+ ✔ object-identity               117,578 ops/sec
  ✔ safe-stable-stringify          74,688 ops/sec  1.57x
  ✔ ohash                          38,360 ops/sec  3.07x
  ✔ object-hash                    17,877 ops/sec  6.58x
  ✔ hash-it †                      44,260 ops/sec  2.66x
  ✔ json-stable-stringify          41,899 ops/sec  2.81x
  ✔ fast-json-stable-stringify     70,452 ops/sec  1.67x
  ✔ tiny-stable-stringify          62,336 ops/sec  1.89x
  ✔ json-stringify-deterministic   43,571 ops/sec  2.70x
  ✔ json-sorted-stringify          62,523 ops/sec  1.88x
  ✔ canonicalize                   37,471 ops/sec  3.14x
  ✔ swr/_internal/stableHash       34,445 ops/sec  3.41x
  ✔ @tufjs/canonical-json          28,960 ops/sec  4.06x

deep circular
+ ✔ object-identity               169,652 ops/sec
  ✔ safe-stable-stringify         133,794 ops/sec  1.27x
  ✔ ohash                          58,065 ops/sec  2.92x
  ✔ object-hash                    22,029 ops/sec  7.70x
  ✔ hash-it †                      62,480 ops/sec  2.72x
  ✘ json-stable-stringify
  ✔ fast-json-stable-stringify     94,420 ops/sec  1.80x
  ✘ tiny-stable-stringify
  ✔ json-stringify-deterministic   62,684 ops/sec  2.71x
  ✘ json-sorted-stringify
  ✘ canonicalize
  ✔ swr/_internal/stableHash       54,642 ops/sec  3.10x
  ✘ @tufjs/canonical-json

big
+ ✔ object-identity               11,664 ops/sec
  ✔ safe-stable-stringify          7,097 ops/sec  1.64x
  ✔ ohash                          3,287 ops/sec  3.55x
  ✔ object-hash                    1,940 ops/sec  6.01x
  ✔ hash-it †                      3,583 ops/sec  3.26x
  ✔ json-stable-stringify          4,396 ops/sec  2.65x
  ✔ fast-json-stable-stringify     6,219 ops/sec  1.88x
  ✔ tiny-stable-stringify          5,771 ops/sec  2.02x
  ✔ json-stringify-deterministic   4,448 ops/sec  2.62x
  ✔ json-sorted-stringify          5,719 ops/sec  2.04x
  ✔ canonicalize                   3,799 ops/sec  3.07x
  ✔ swr/_internal/stableHash       3,536 ops/sec  3.30x
  ✔ @tufjs/canonical-json          2,542 ops/sec  4.59x

leafy
+ ✔ object-identity               41,925 ops/sec
  ✔ safe-stable-stringify         20,088 ops/sec  2.09x
  ✔ ohash                         32,586 ops/sec  1.29x
  ✔ object-hash                   11,693 ops/sec  3.59x
  ✔ hash-it †                     12,092 ops/sec  3.47x
  ✔ json-stable-stringify          8,863 ops/sec  4.73x
  ✔ fast-json-stable-stringify    16,968 ops/sec  2.47x
  ✔ tiny-stable-stringify          9,269 ops/sec  4.52x
  ✔ json-stringify-deterministic   8,680 ops/sec  4.83x
  ✔ json-sorted-stringify          9,522 ops/sec  4.40x
  ✔ canonicalize                  10,858 ops/sec  3.86x
  ✔ swr/_internal/stableHash       7,982 ops/sec  5.25x
  ✔ @tufjs/canonical-json          4,714 ops/sec  8.89x
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
