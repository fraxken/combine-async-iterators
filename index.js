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

async function* combineAsyncIterators(...iterators) {
    let open = iterators.length;
    const promises = iterators.map(getNextAsyncIteratorValue);

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

module.exports = combineAsyncIterators;
