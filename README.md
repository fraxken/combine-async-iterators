# Combine-async-iterators
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/fraxken/combine-async-iterators/master/package.json&query=$.version&label=Version)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/fraxken/combine-async-iterators)
![size](https://img.shields.io/bundlephobia/min/combine-async-iterators)
[![Known Vulnerabilities](https://snyk.io//test/github/fraxken/combine-async-iterators/badge.svg?targetFile=package.json)](https://snyk.io//test/github/fraxken/combine-async-iterators?targetFile=package.json)

Combine Multiple Asynchronous Iterators in one (not a sequence). It use **Promise.race** under the hood (the code idea is from [Targos](http://github.com/targos)).

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
const combineAsyncIterators = require("combine-async-iterators");

async function* getValues(id) {
    for (let count = 0; count < 5; count++) {
        const ms = Math.ceil(Math.random() * 1000);
        await new Promise((resolve) => setTimeout(resolve, ms));
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

## API

```ts
function combineAsyncIterators(...iterators: AsyncIterableIterator<any>[]): AsyncIterableIterator<any>
```

## Licence
MIT

