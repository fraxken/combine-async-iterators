"use strict";

function getNextAsyncIteratorFactory(options) {
    return async(asyncIterator, index) => {
        try {
            const iterator = await asyncIterator.next();

            return { index, iterator };
        }
        catch (err) {
            if (options.errorCallback) {
                options.errorCallback(err, index);
            }
            if (options.throwError !== false) {
                return Promise.reject(err);
            }

            return { index, iterator: { done: true } };
        }
    };
}

async function* combineAsyncIterators(...iterators) {
    let [options] = iterators;
    if (typeof options.next === "function") {
        options = Object.create(null);
    }
    else {
        iterators.shift();
    }

    // Return if iterators is empty (avoid infinite loop).
    if (iterators.length === 0) {
        return;
    }
    const getNextAsyncIteratorValue = getNextAsyncIteratorFactory(options);

    try {
        const asyncIteratorsValues = new Map(iterators.map((it, idx) => [idx, getNextAsyncIteratorValue(it, idx)]));

        do {
            const { iterator, index } = await Promise.race(asyncIteratorsValues.values());
            if (iterator.done) {
                asyncIteratorsValues.delete(index);
            }
            else {
                yield iterator.value;
                asyncIteratorsValues.set(index, getNextAsyncIteratorValue(iterators[index], index));
            }
        } while (asyncIteratorsValues.size > 0);
    }
    finally {
        // TODO: replace .all with .allSettled
        await Promise.all(iterators.map((it) => it.return()));
    }
}

module.exports = combineAsyncIterators;
