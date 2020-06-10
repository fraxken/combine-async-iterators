export interface CombineOptions {
    throwError?: boolean;
    errorCallback: (err: Error) => any;
}

declare function combineAsyncIterators(...iterators: AsyncIterableIterator<any>[]): AsyncIterableIterator<any>;
declare function combineAsyncIterators(options: CombineOptions, ...iterators: AsyncIterableIterator<any>[]): AsyncIterableIterator<any>;

export = combineAsyncIterators;

