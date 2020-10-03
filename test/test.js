"use strict";

// Require Third-party Dependencies
const test = require("japa");
const is = require("@slimio/is");

// Require Internal Dependencies
const combineAsyncIterators = require("../");
const { stub, match } = require("sinon");

// CONSTANTS
const FIX = ["first_0", "first_1", "first_2", "second_0", "second_1", "second_2"].sort();

// Function for tests
async function* getValues(id, throwOn) {
    for (let count = 0; count < 3; count++) {
        if (throwOn && count === throwOn) {
            throw new Error('oh no!');
        }
        const ms = Math.ceil(Math.random() * 1000);
        await new Promise((resolve) => setTimeout(resolve, ms));
        yield `${id}_${count}`;
    }
}

async function* getThrow(id) {
    throw new Error("oh no!");
}

test("all values must be retrieved (but not in sequence)", async(assert) => {
    const first = getValues("first");
    const second = getValues("second");

    const retrievedValues = [];
    for await (const value of combineAsyncIterators(first, second)) {
        assert.isTrue(is.string(value));
        retrievedValues.push(value);
    }

    assert.isTrue(retrievedValues.length === 6, "We must retrieve 6 values");
    const sorted = retrievedValues.slice(0).sort();
    assert.strictEqual(sorted.toString(), FIX.toString());
    assert.notStrictEqual(retrievedValues.toString(), sorted.toString());
}).timeout(10000);

test("combineAsyncIterators must close all iterators when it throw", async(assert) => {
    assert.plan(2);
    const first = getThrow("first");
    const second = getThrow("second");

    try {
        for await (const value of combineAsyncIterators(first, second)) {
            // Do nothing (it throw).
        }
    }
    catch (err) {
        assert.strictEqual(err.message, "oh no!");
        const result = await Promise.all([
            first.next(), second.next()
        ]);

        assert.isTrue(result.every((row) => row.done === true));
    }
});

test("combineAsyncIterators must return all values of each stream that does not throw, when option throw is false", async (assert) => {
    const first = getValues("first", 2);
    const second = getValues("second");
    const errorCallback = stub();

    const retrievedValues = [];
    for await (const value of combineAsyncIterators({
        throwError: false,
        errorCallback
    }, first, second)) {
        assert.isTrue(is.string(value));
        retrievedValues.push(value);
    }

    assert.isTrue(errorCallback.calledWith(match.has('message', 'oh no!')), 'errorCallback to have been called');
    assert.equal(retrievedValues.length, 5, `We must retrieve 4 values`);
    const sorted = retrievedValues.slice(0).sort();
    assert.equal(sorted.toString(), [
        "first_0",
        "first_1",
        "second_0",
        "second_1",
        "second_2"
    ]);
}).timeout(10000);
