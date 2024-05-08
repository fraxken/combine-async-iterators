declare namespace combineAsyncIterators {
    interface CombineOptions {
        throwError?: boolean;
        errorCallback?: (err: Error, index: number) => any;
    }
}

declare function combineAsyncIterators<T = any>(
  ...iterators: AsyncIterableIterator<T>[]
): AsyncIterableIterator<T>;

declare function combineAsyncIterators<T = any>(
    options: combineAsyncIterators.CombineOptions,
    ...iterators: AsyncIterableIterator<T>[]
): AsyncIterableIterator<T>;

export = combineAsyncIterators;
