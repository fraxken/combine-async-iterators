"use strict";

/**
 * @typedef {object} AsyncIterableObject
 * @property {number} index
 * @property {IteratorResult<any>} value
 */

/**
 * @function getNextAsyncIteratorValue
 * @param {AsyncIterableIterator<any>} iterator
 * @param {!number} index
 * @returns {Promise<AsyncIterableObject>}
 */
function getNextAsyncIteratorValue(iterator, index) {
    return iterator.next().then((value) => {
        return { index, value };
    });
}

/**
 * @async
 * @generator
 * @function combineAsyncIterators
 * @param {...AsyncIterableIterator<any>} iterators
 */
async function* combineAsyncIterators(...iterators) {
    try {
        if (iterators.length === 0) {
            return;
        }
        const promises = iterators.map(getNextAsyncIteratorValue);
        let open = iterators.length;

        do {
            const { value, index } = await Promise.race(promises);
            if (value.done) {
                open--;
                promises[index] = new Promise(() => null);
            }
            else {
                yield value.value;
                promises[index] = getNextAsyncIteratorValue(iterators[index], index);
            }
        } while (open > 0);
    }
    catch (err) {
        await Promise.all(iterators.map((it) => it.return()));

        throw err;
    }
}

module.exports = combineAsyncIterators;
