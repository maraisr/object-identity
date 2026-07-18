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
✔ simple         844,238 ops/sec    0.90 kb/op
✔ deep           107,950 ops/sec    4.44 kb/op
✔ deep circular  172,118 ops/sec    3.43 kb/op
✔ big             13,375 ops/sec   37.54 kb/op
✔ leafy           36,851 ops/sec    6.14 kb/op
```

<details><summary>All candidates</summary>

```diff
simple
+ ✔ object-identity               844,238 ops/sec           0.90 kb/op
  ✔ safe-stable-stringify         551,360 ops/sec  1.53x    4.51 kb/op   5.02x
  ✔ ohash                         263,285 ops/sec  3.21x    8.74 kb/op   9.72x
  ✔ object-hash                    95,764 ops/sec  8.82x   29.38 kb/op  32.68x
  ✔ hash-it †                     325,133 ops/sec  2.60x    6.14 kb/op   6.83x
  ✔ json-stable-stringify         303,650 ops/sec  2.78x    8.47 kb/op   9.43x
  ✔ fast-json-stable-stringify    458,690 ops/sec  1.84x    5.22 kb/op   5.80x
  ✔ tiny-stable-stringify         404,876 ops/sec  2.09x    2.20 kb/op   2.44x
  ✔ json-stringify-deterministic  312,054 ops/sec  2.71x    7.02 kb/op   7.81x
  ✔ json-sorted-stringify         411,702 ops/sec  2.05x    2.16 kb/op   2.41x
  ✔ canonicalize                  260,869 ops/sec  3.24x   11.33 kb/op  12.61x
  ✘ @tufjs/canonical-json
  ✔ swr/_internal/stableHash      158,932 ops/sec  5.31x    5.04 kb/op   5.60x

deep
+ ✔ object-identity               107,950 ops/sec            4.44 kb/op
  ✔ safe-stable-stringify          71,610 ops/sec  1.51x    29.35 kb/op   6.62x
  ✔ ohash                          34,071 ops/sec  3.17x    60.37 kb/op  13.61x
  ✔ object-hash                    17,498 ops/sec  6.17x   141.26 kb/op  31.84x
  ✔ hash-it †                      32,722 ops/sec  3.30x    68.89 kb/op  15.53x
  ✔ json-stable-stringify          38,666 ops/sec  2.79x    85.27 kb/op  19.22x
  ✔ fast-json-stable-stringify     63,878 ops/sec  1.69x    33.12 kb/op   7.47x
  ✔ tiny-stable-stringify          55,754 ops/sec  1.94x    11.27 kb/op   2.54x
  ✔ json-stringify-deterministic   39,571 ops/sec  2.73x    73.65 kb/op  16.60x
  ✔ json-sorted-stringify          56,182 ops/sec  1.92x    11.28 kb/op   2.54x
  ✔ canonicalize                   33,613 ops/sec  3.21x   104.36 kb/op  23.52x
  ✔ @tufjs/canonical-json          26,566 ops/sec  4.06x   125.48 kb/op  28.28x
  ✔ swr/_internal/stableHash       14,314 ops/sec  7.54x    33.77 kb/op   7.61x

deep circular
+ ✔ object-identity               172,118 ops/sec            3.43 kb/op
  ✔ safe-stable-stringify         114,958 ops/sec  1.50x    18.43 kb/op   5.38x
  ✔ ohash                          56,240 ops/sec  3.06x    43.46 kb/op  12.68x
  ✔ object-hash                    20,850 ops/sec  8.26x   129.14 kb/op  37.67x
  ✔ hash-it †                      54,990 ops/sec  3.13x    53.54 kb/op  15.62x
  ✘ json-stable-stringify
  ✔ fast-json-stable-stringify     86,627 ops/sec  1.99x    24.80 kb/op   7.24x
  ✘ tiny-stable-stringify
  ✔ json-stringify-deterministic   59,471 ops/sec  2.89x    52.06 kb/op  15.19x
  ✘ json-sorted-stringify
  ✘ canonicalize
  ✘ @tufjs/canonical-json
  ✔ swr/_internal/stableHash       33,449 ops/sec  5.15x    20.84 kb/op   6.08x

big
+ ✔ object-identity               13,375 ops/sec            37.54 kb/op
  ✔ safe-stable-stringify          6,997 ops/sec  1.91x    327.66 kb/op   8.73x
  ✔ ohash                          3,182 ops/sec  4.20x    607.82 kb/op  16.19x
  ✔ object-hash                    1,864 ops/sec  7.18x   1188.59 kb/op  31.66x
  ✔ hash-it †                      4,509 ops/sec  2.97x    382.27 kb/op  10.18x
  ✔ json-stable-stringify          4,425 ops/sec  3.02x    544.05 kb/op  14.49x
  ✔ fast-json-stable-stringify     6,164 ops/sec  2.17x    334.76 kb/op   8.92x
  ✔ tiny-stable-stringify          5,674 ops/sec  2.36x    126.33 kb/op   3.36x
  ✔ json-stringify-deterministic   4,508 ops/sec  2.97x    432.41 kb/op  11.52x
  ✔ json-sorted-stringify          5,707 ops/sec  2.34x    126.46 kb/op   3.37x
  ✔ canonicalize                   3,742 ops/sec  3.57x    746.54 kb/op  19.88x
  ✔ @tufjs/canonical-json          2,497 ops/sec  5.36x   1109.21 kb/op  29.54x
  ✔ swr/_internal/stableHash       2,317 ops/sec  5.77x    348.14 kb/op   9.27x

leafy
+ ✔ object-identity               36,851 ops/sec            6.14 kb/op
  ✔ safe-stable-stringify         18,009 ops/sec  2.05x   155.39 kb/op   25.29x
  ✔ ohash                         34,044 ops/sec  1.08x   157.24 kb/op   25.59x
  ✔ object-hash                   10,037 ops/sec  3.67x   150.11 kb/op   24.43x
  ✔ hash-it †                     11,610 ops/sec  3.17x   104.44 kb/op   17.00x
  ✔ json-stable-stringify          8,804 ops/sec  4.19x   228.89 kb/op   37.26x
  ✔ fast-json-stable-stringify    17,204 ops/sec  2.14x   155.45 kb/op   25.30x
  ✔ tiny-stable-stringify          9,023 ops/sec  4.08x    12.48 kb/op    2.03x
  ✔ json-stringify-deterministic   8,558 ops/sec  4.31x   151.55 kb/op   24.67x
  ✔ json-sorted-stringify          8,840 ops/sec  4.17x    12.52 kb/op    2.04x
  ✔ canonicalize                  10,357 ops/sec  3.56x   176.75 kb/op   28.77x
  ✔ @tufjs/canonical-json          4,601 ops/sec  8.01x   791.00 kb/op  128.75x
  ✔ swr/_internal/stableHash       5,966 ops/sec  6.18x   206.29 kb/op   33.58x
```

</details>

_Memory is gross V8 heap allocation per operation; fixture construction is excluded._

<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
