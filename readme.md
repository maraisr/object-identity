<div align="right">
<h1><code>object-identity</code></h1>
<br />
<br />

<p><code>npm add object-identity</code> hashes objects</p>
<span>
<a href="https://github.com/maraisr/object-identity/actions/workflows/ci.yml">
	<img src="https://github.com/maraisr/object-identity/actions/workflows/ci.yml/badge.svg"/>
</a>
<a href="https://npm-stat.com/charts.html?package=object-identity">
	<img src="https://badgen.net/npm/dw/object-identity?labelColor=black&color=black&cache=600" alt="downloads"/>
</a>
<a href="https://packagephobia.com/result?p=object-identity">
	<img src="https://badgen.net/packagephobia/install/object-identity?labelColor=black&color=black" alt="size"/>
</a>
<a href="https://bundlephobia.com/result?p=object-identity">
	<img src="https://badgen.net/bundlephobia/minzip/object-identity?labelColor=black&color=black" alt="size"/>
</a>
</span>

<br />
<br />
</div>

## ⚡ Features

- ✅ **Intuitive**

- 🌪 **Recursive/Circular support**

- 🏎 **Performant** — _TBD benchmarks_

- 🪶 **Lightweight** — a mere 503B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## 🚀 Usage

```ts
import { createHash } from 'node:crypto';
import { identify } from 'object-identity';

// ~> Some user defined hasher
const hasher = (value) => createHash('sha1').update(value).digest('hex');

// Lets hash the object
const hashA = identify({ a: "b" }, hasher);
const hashB = identify({ a: "b" }, hasher);

expect(hashA).toEqual(hashB);
```

## License

MIT © [Marais Rossouw](https://marais.io)
