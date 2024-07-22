<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A utility that provides a stable identity of an object**

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

## 🚀 Usage

> Avaliable on [jsr](https://jsr.io/@mr/object-identity),
> [NPM](https://npmjs.com/package/object-identity) and
> [deno.land](https://deno.land/x/object_identity)

```ts
import { identify } from 'object-identity';
// or
import { identify } from 'https://deno.land/x/object_identity';

// ~> identity the object
const id1 = identify({ a: new Set(['b', 'c', new Map([['d', 'e']])]) });
// ~> an entirely different object, but structurally the same
const id2 = identify({ a: new Set(['b', 'c', new Map([['e', 'e']])]) });

// they should equal
assert.toEqual(hashA, hashB);
```

## 💨 Benchmark

> via the [`/bench`](/bench) directory with deno 1.45.2

```
✔ object-identity       ~ 13,888,888 ops/sec ± 2.35%
✔ object-hash           ~    126,262 ops/sec ± 0.20%
✔ json-stable-stringify ~    664,893 ops/sec ± 0.51%
✔ tiny-stable-stringify ~    642,673 ops/sec ± 0.50%
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function`
> values and other node builtins. So take this benchmark with a grain of salt, as it's only testing
> "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
