# Combine-async-iterators
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

