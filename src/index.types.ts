import { identify } from 'object-identity';

declare function assert<T>(thing: T): void;

assert<string>(identify('string'));
assert<string>(identify(1));
assert<string>(identify([]));
assert<string>(identify({}));
assert<string>(identify(new Error()));
