// Require Node.js Dependencies
const { test, mock } = require("node:test");
const timers = require("node:timers/promises");
const assert = require("node:assert");

// Require Internal Dependencies
const combineAsyncIterators = require("../index.js");

// CONSTANTS
const FIX = ["first_0", "first_1", "first_2", "second_0", "second_1", "second_2"].sort();

// Function for tests
async function* getValues(id, throwOn) {
  for (let count = 0; count < 3; count++) {
    if (throwOn && count === throwOn) {
      throw new Error("oh no!");
    }
    const ms = Math.ceil(Math.random() * 1000);
    await timers.setTimeout(ms);
    yield `${id}_${count}`;
  }
}

// eslint-disable-next-line require-yield
async function* getThrow(_id) {
  throw new Error("oh no!");
}

function getMinimumAsyncIterable(id) {
  const max = 3;
  let i = 0;

  return {
    next() {
      if (i >= max) {
        return { done: true };
      }

      return { value: `${id}_${i++}` };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

test("all values must be retrieved (but not in sequence)", async() => {
  const first = getValues("first");
  const second = getValues("second");

  const retrievedValues = [];
  for await (const value of combineAsyncIterators(first, second)) {
    assert.ok(typeof value === "string");
    retrievedValues.push(value);
  }

  assert.ok(retrievedValues.length === 6, "We must retrieve 6 values");
  const sorted = retrievedValues.slice(0).sort();
  assert.strictEqual(sorted.toString(), FIX.toString());
  assert.notStrictEqual(retrievedValues.toString(), sorted.toString());
});

test("should return if there is nothing to iterate", async() => {
  const retrievedValues = [];
  for await (const value of combineAsyncIterators()) {
    retrievedValues.push(value);
  }

  assert.equal(retrievedValues.length, 0);
});

test("combineAsyncIterators must close all iterators when it throw", async(t) => {
  t.plan(2);

  const first = getThrow("first");
  const second = getThrow("second");

  try {
    for await (const _value of combineAsyncIterators(first, second)) {
      // Do nothing (it throw).
    }
  }
  catch (err) {
    t.assert.strictEqual(err.message, "oh no!");
    const result = await Promise.all([
      first.next(), second.next()
    ]);

    t.assert.strictEqual(result.every((row) => row.done === true), true);
  }
});

test("combineAsyncIterators must not throw if iterator lacks optional properties", async() => {
  const first = getMinimumAsyncIterable("first");
  const second = getMinimumAsyncIterable("second");

  for await (const _value of combineAsyncIterators(first, second)) {
    // Run iterators until completion. They should not throw.
  }
});

test("combineAsyncIterators must return all values of each stream that does not throw, when option throw is false", async() => {
  const first = getValues("first", 2);
  const second = getValues("second");
  const errorCallback = mock.fn();

  const retrievedValues = [];
  const iteratorOptions = {
    throwError: false,
    errorCallback
  };
  for await (const value of combineAsyncIterators(iteratorOptions, first, second)) {
    assert.ok(typeof value === "string");
    retrievedValues.push(value);
  }

  const call = errorCallback.mock.calls[0];
  assert.equal(call.arguments[0].message, "oh no!");
  assert.equal(retrievedValues.length, 5, "We must retrieve 4 values");
  const sorted = retrievedValues.slice(0).sort();
  assert.equal(sorted.toString(), [
    "first_0",
    "first_1",
    "second_0",
    "second_1",
    "second_2"
  ]);
});
