<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A utility that provides a stable identity of an object**

<br>
<br>

<sup>

This is free to use software, but if you do like it, consider supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚡ Features

- ✅ **Intuitive**
- 🌪 **Recursive/Circular support**
- 🏎 **Performant** — check the [benchmarks](#-benchmark).
- 🪶 **Lightweight** — a mere 387B and no
  [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## ⚙️ Install

- **npm** — available as [`object-identity`](https://www.npmjs.com/package/object-identity)
- **JSR** — available as [`@mr/object-identity`](https://jsr.io/@mr/object-identity)

## 🚀 Usage

```ts
import { identify } from 'object-identity';

// ~> identity the object
const id1 = identify({ a: new Set(['b', 'c', new Map([['d', 'e']])]) });
// ~> an entirely different object, but structurally the same
const id2 = identify({ a: new Set(['b', 'c', new Map([['e', 'e']])]) });

// they should equal
assert.toEqual(hashA, hashB);
```

## 💨 Benchmark

```
benchmark                  time (avg)        iter/s             (min … max)       p75       p99      p995
--------------------------------------------------------------------------- -----------------------------
object-identity              2.2 µs/iter     453,803.6     (1.99 µs … 2.44 µs) 2.35 µs 2.44 µs 2.44 µs
object-hash                 8.76 µs/iter     114,168.3   (7.96 µs … 225.33 µs) 8.71 µs 11.75 µs 14.92 µs
json-stable-stringify       1.77 µs/iter     565,184.5     (1.75 µs … 1.86 µs) 1.77 µs 1.86 µs 1.86 µs
tiny-stable-stringify       1.63 µs/iter     612,009.4     (1.62 µs … 1.68 µs) 1.64 µs 1.68 µs 1.68 µs

summary
  object-identity
   1.35x slower than tiny-stable-stringify
   1.25x slower than json-stable-stringify
   3.97x faster than object-hash
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function`
> values and other node builtins. So take this benchmark with a grain of salt, as it's only testing
> "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
