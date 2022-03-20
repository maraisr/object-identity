export type Hasher = (input: string) => any;

export function identify<T, H extends Hasher>(input: T, hasher: H): ReturnType<H>;