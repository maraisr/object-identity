import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { identity as fn } from '../..';

export default function (identity: typeof fn) {
    const api = suite('exports');

    api('should export a function', () => {
        assert.type(identity, 'function');
    });

    api.run();
}