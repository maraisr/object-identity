import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { identity as fn } from '../..';

export default function (identity: typeof fn) {
    const array = suite('array');

    array('flat', () => {
        assert.equal(identity([1, 2, 3]), 'a1,2,3');
    });

    array('key order', () => {
        assert.equal(identity([3, 2, 1]), 'a1,2,3');
    });

    array('nested', () => {
        assert.equal(identity([[3, 2, 1], [1, 2, 3]]), 'aa1,2,3,a1,2,3');
    });

    array('matches', () => {
        assert.equal(identity([[3, 2, 1], [1, 2, 3]]), identity([[3, 2, 1], [1, 2, 3]]));
        assert.equal(identity([[3, 2, 1], [1, 2, 3]]), identity([[1, 2, 3], [3, 2, 1]]));
    });

    array.run();
}