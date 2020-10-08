# Combine-async-iterators
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/fraxken/combine-async-iterators/master/package.json&query=$.version&label=Version)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/fraxken/combine-async-iterators)
![size](https://img.shields.io/bundlephobia/min/combine-async-iterators)
[![Known Vulnerabilities](https://snyk.io//test/github/fraxken/combine-async-iterators/badge.svg?targetFile=package.json)](https://snyk.io//test/github/fraxken/combine-async-iterators?targetFile=package.json)

Combine Multiple Asynchronous Iterators in one (not a sequence). It use **Promise.race** under the hood (the code idea is from [Targos](http://github.com/targos)).

> ⚠️ This package was mainly built to work with native Asynchronous Generators (Iterators).

## Requirements
- [Node.js](https://nodejs.org/en/) version 11 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i combine-async-iterators
# or
$ yarn add combine-async-iterators
```

## Usage example
```js
const { promisify } = require("util");
const combineAsyncIterators = require("combine-async-iterators");

const sleep = promisify(setTimeout);

async function* getValues(id) {
    for (let count = 0; count < 5; count++) {
        await sleep(Math.ceil(Math.random() * 1000));
        yield `${id}_${count}`;
    }
}

async function main() {
    const asyncIterator = combineAsyncIterators(getValues("first"), getValues("second"));
    for await (const value of asyncIterator) {
        console.log(value);
    }
}
main().catch(console.error);
```

**Since 2.0.0** it is also possible to recover errors through a callback. By default the method is stopped when an error is thrown (the `throwError` parameter allow to disable this behaviour).

```js
function errorCallback(err) {
    console.error("got you:", err);
}

const iteratorOptions = { errorCallback, throwError: false };
const asyncIterator = combineAsyncIterators(iteratorOptions, getValues("first"), getValues("second"));
for await (const value of asyncIterator) {
    console.log(value);
}
```

## API

```ts
declare function combineAsyncIterators(
    ...iterators: AsyncIterableIterator<any>[]
): AsyncIterableIterator<any>;

declare namespace combineAsyncIterators {
    interface CombineOptions {
        throwError?: boolean;
        errorCallback?: (err: Error, index: number) => any;
    }
}

declare function combineAsyncIterators(
    options: combineAsyncIterators.CombineOptions,
    ...iterators: AsyncIterableIterator<any>[]
): AsyncIterableIterator<any>;

export = combineAsyncIterators;
```

## Licence
MIT

