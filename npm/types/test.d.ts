export var DeadlineError: {
    new (): {
        name: string;
        message: string;
        stack?: string | undefined;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export var ERROR_WHILE_MAPPING_MESSAGE: string;
export var MuxAsyncIterator: {
    new (): {
        "__#2@#iteratorCount": number;
        "__#2@#yields": any[];
        "__#2@#throws": any[];
        "__#2@#signal": never;
        add(iterable: any): void;
        "__#2@#callIteratorNext"(iterator: any): Promise<void>;
        iterate(): AsyncGenerator<any, void, unknown>;
        [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    };
};
export var RetryError: {
    new (cause: any, count: any): {
        name: string;
        cause: any;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export function abortable(p: any, signal: any): Promise<any> | AsyncGenerator<any, void, unknown>;
export function abortableAsyncIterable(p: any, signal: any): AsyncGenerator<any, void, unknown>;
export function abortablePromise(p: any, signal: any): Promise<any>;
export function deadline(p: any, delay2: any): Promise<any>;
export function debounce(fn: any, wait: any): {
    (...args: any[]): void;
    clear(): void;
    flush(): void;
    readonly pending: boolean;
};
export function deferred(): never;
export function delay(ms: any, options?: {}): Promise<any>;
export function pooledMap(poolLimit: any, array: any, iteratorFn: any): any;
export function retry(fn: any, opts: any): Promise<any>;
export function tee(iterable: any, n?: number): AsyncGenerator<undefined, void, unknown>[];
