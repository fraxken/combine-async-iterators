"use strict";

function getNextAsyncIteratorValue(asyncIterator, index) {
    return asyncIterator.next().then((iterator) => {
        return { index, iterator };
    });
}

async function* combineAsyncIterators(...iterators) {
    // Return if iterators is empty (avoid infinite loop).
    if (iterators.length === 0) {
        return;
    }
    const promiseThatNeverResolve = new Promise(() => null);

    try {
        const asyncIteratorsValues = iterators.map(getNextAsyncIteratorValue);
        let numberOfIteratorsAlive = iterators.length;

        do {
            const { iterator, index } = await Promise.race(asyncIteratorsValues);
            if (iterator.done) {
                numberOfIteratorsAlive--;
                // We dont want Promise.race to resolve again on this index
                // so we replace it with a Promise that will never resolve.
                asyncIteratorsValues[index] = promiseThatNeverResolve;
            }
            else {
                yield iterator.value;
                asyncIteratorsValues[index] = getNextAsyncIteratorValue(iterators[index], index);
            }
        } while (numberOfIteratorsAlive > 0);
    }
    catch (err) {
        // TODO: replace .all with .allSettled
        await Promise.all(iterators.map((it) => it.return()));

        throw err;
    }
}

module.exports = combineAsyncIterators;
