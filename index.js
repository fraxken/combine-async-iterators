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
    const getNextAsyncIteratorValue = getNextAsyncIteratorFactory(options);


    try {
        const asyncIteratorsValues = new Map();
        iterators.forEach((it, idx) => asyncIteratorsValues
            .set(idx, getNextAsyncIteratorValue(it, idx))
        );
        let numberOfIteratorsAlive = iterators.length;

        do {
            const response = await Promise.race(
                Array.from(asyncIteratorsValues.values())
            );
            if (response) {
                const {
                    iterator,
                    index
                } = response;
                if (iterator.done) {
                    numberOfIteratorsAlive--;
                    asyncIteratorsValues.delete(index);
                }
                else {
                    yield iterator.value;
                    asyncIteratorsValues.set(index, getNextAsyncIteratorValue(iterators[index], index));
                }
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
