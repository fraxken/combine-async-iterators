"use strict";

function getNextAsyncIteratorFactory(options) {
    return async(asyncIterator, index) => {
        try {
            const iterator = await asyncIterator.next();

            return {
                index,
                iterator
            };
        }
        catch (err) {
            if (options.errorCallback) {
                options.errorCallback(err, index);
            }
            if (options.throwError !== false) {
                return Promise.reject(err);
            }

            return {
                index,
                iterator: {
                    done: true
                }
            };
        }
    };
}

async function* combineAsyncIterators(...iterators) {
    let [options] = iterators;

    if (typeof options.next === "function") {
        options = {};
    }
    else {
        iterators.shift();
    }
    // Return if iterators is empty (avoid infinite loop).
    if (iterators.length === 0) {
        return;
    }
    const promiseThatNeverResolve = new Promise(() => null);
    const getNextAsyncIteratorValue = getNextAsyncIteratorFactory(options);


    try {
        const asyncIteratorsValues = iterators.map(getNextAsyncIteratorValue);
        let numberOfIteratorsAlive = iterators.length;

        do {
            const { iterator, index } = await Promise.race(asyncIteratorsValues);
            if (iterator.done) {
                numberOfIteratorsAlive--;
                // We don't want Promise.race to resolve again on this index
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
