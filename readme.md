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
- 🪶 **Tiny.** Around 700B minified and gzipped, with zero
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
✔ simple         1,057,494 ops/sec
✔ deep             141,423 ops/sec
✔ deep circular    217,110 ops/sec
✔ big               15,252 ops/sec
✔ leafy             48,766 ops/sec
```

<details><summary>All candidates</summary>

```diff
simple
+ ✔ object-identity               1,057,494 ops/sec
  ✔ safe-stable-stringify           536,506 ops/sec   1.97x
  ✔ ohash                           248,373 ops/sec   4.26x
  ✔ object-hash                      93,677 ops/sec  11.29x
  ✔ hash-it †                       317,913 ops/sec   3.33x
  ✔ json-stable-stringify           302,999 ops/sec   3.49x
  ✔ fast-json-stable-stringify      455,616 ops/sec   2.32x
  ✔ tiny-stable-stringify           392,791 ops/sec   2.69x
  ✔ json-stringify-deterministic    307,392 ops/sec   3.44x
  ✔ json-sorted-stringify           399,427 ops/sec   2.65x
  ✔ canonicalize                    263,853 ops/sec   4.01x
  ✔ swr/_internal/stableHash        242,647 ops/sec   4.36x
  ✘ @tufjs/canonical-json

deep
+ ✔ object-identity               141,423 ops/sec
  ✔ safe-stable-stringify          72,228 ops/sec  1.96x
  ✔ ohash                          36,971 ops/sec  3.83x
  ✔ object-hash                    17,306 ops/sec  8.17x
  ✔ hash-it †                      42,931 ops/sec  3.29x
  ✔ json-stable-stringify          40,883 ops/sec  3.46x
  ✔ fast-json-stable-stringify     68,985 ops/sec  2.05x
  ✔ tiny-stable-stringify          59,945 ops/sec  2.36x
  ✔ json-stringify-deterministic   41,703 ops/sec  3.39x
  ✔ json-sorted-stringify          60,691 ops/sec  2.33x
  ✔ canonicalize                   35,895 ops/sec  3.94x
  ✔ swr/_internal/stableHash       33,181 ops/sec  4.26x
  ✔ @tufjs/canonical-json          27,610 ops/sec  5.12x

deep circular
+ ✔ object-identity               217,110 ops/sec
  ✔ safe-stable-stringify         126,820 ops/sec   1.71x
  ✔ ohash                          55,682 ops/sec   3.90x
  ✔ object-hash                    21,086 ops/sec  10.30x
  ✔ hash-it †                      60,168 ops/sec   3.61x
  ✘ json-stable-stringify
  ✔ fast-json-stable-stringify     95,193 ops/sec   2.28x
  ✘ tiny-stable-stringify
  ✔ json-stringify-deterministic   62,806 ops/sec   3.46x
  ✘ json-sorted-stringify
  ✘ canonicalize
  ✔ swr/_internal/stableHash       63,593 ops/sec   3.41x
  ✘ @tufjs/canonical-json

big
+ ✔ object-identity               15,252 ops/sec
  ✔ safe-stable-stringify          6,925 ops/sec  2.20x
  ✔ ohash                          3,181 ops/sec  4.79x
  ✔ object-hash                    1,900 ops/sec  8.03x
  ✔ hash-it †                      3,504 ops/sec  4.35x
  ✔ json-stable-stringify          4,394 ops/sec  3.47x
  ✔ fast-json-stable-stringify     6,184 ops/sec  2.47x
  ✔ tiny-stable-stringify          5,668 ops/sec  2.69x
  ✔ json-stringify-deterministic   4,410 ops/sec  3.46x
  ✔ json-sorted-stringify          5,689 ops/sec  2.68x
  ✔ canonicalize                   3,757 ops/sec  4.06x
  ✔ swr/_internal/stableHash       3,523 ops/sec  4.33x
  ✔ @tufjs/canonical-json          2,527 ops/sec  6.04x

leafy
+ ✔ object-identity               48,766 ops/sec
  ✔ safe-stable-stringify         19,386 ops/sec   2.52x
  ✔ ohash                         31,472 ops/sec   1.55x
  ✔ object-hash                   11,331 ops/sec   4.30x
  ✔ hash-it †                     11,797 ops/sec   4.13x
  ✔ json-stable-stringify          8,736 ops/sec   5.58x
  ✔ fast-json-stable-stringify    16,832 ops/sec   2.90x
  ✔ tiny-stable-stringify          8,974 ops/sec   5.43x
  ✔ json-stringify-deterministic   8,462 ops/sec   5.76x
  ✔ json-sorted-stringify          9,060 ops/sec   5.38x
  ✔ canonicalize                  10,440 ops/sec   4.67x
  ✔ swr/_internal/stableHash       7,988 ops/sec   6.10x
  ✔ @tufjs/canonical-json          4,507 ops/sec  10.82x
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
