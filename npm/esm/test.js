var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _MuxAsyncIterator_instances, _MuxAsyncIterator_iteratorCount, _MuxAsyncIterator_yields, _MuxAsyncIterator_throws, _MuxAsyncIterator_signal, _MuxAsyncIterator_callIteratorNext, _Queue_source, _Queue_queue, _a;
// https://deno.land/std@0.173.0/async/deferred.ts
import "./_dnt.test_polyfills.js";
import * as dntShim from "./_dnt.test_shims.js";
function deferred() {
    let methods;
    let state = "pending";
    const promise = new Promise((resolve, reject) => {
        methods = {
            async resolve(value) {
                await value;
                state = "fulfilled";
                resolve(value);
            },
            // deno-lint-ignore no-explicit-any
            reject(reason) {
                state = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", { get: () => state });
    return Object.assign(promise, methods);
}
// https://deno.land/std@0.173.0/async/abortable.ts
function abortable(p, signal) {
    if (p instanceof Promise) {
        return abortablePromise(p, signal);
    }
    else {
        return abortableAsyncIterable(p, signal);
    }
}
function abortablePromise(p, signal) {
    if (signal.aborted) {
        return Promise.reject(createAbortError(signal.reason));
    }
    const waiter = deferred();
    const abort = () => waiter.reject(createAbortError(signal.reason));
    signal.addEventListener("abort", abort, { once: true });
    return Promise.race([
        waiter,
        p.finally(() => {
            signal.removeEventListener("abort", abort);
        })
    ]);
}
async function* abortableAsyncIterable(p, signal) {
    if (signal.aborted) {
        throw createAbortError(signal.reason);
    }
    const waiter = deferred();
    const abort = () => waiter.reject(createAbortError(signal.reason));
    signal.addEventListener("abort", abort, { once: true });
    const it = p[Symbol.asyncIterator]();
    while (true) {
        const { done, value } = await Promise.race([waiter, it.next()]);
        if (done) {
            signal.removeEventListener("abort", abort);
            return;
        }
        yield value;
    }
}
function createAbortError(reason) {
    return new DOMException(reason ? `Aborted: ${reason}` : "Aborted", "AbortError");
}
// https://deno.land/std@0.173.0/async/deadline.ts
var DeadlineError = class extends Error {
    constructor() {
        super("Deadline");
        this.name = "DeadlineError";
    }
};
function deadline(p, delay2) {
    const d = deferred();
    const t = setTimeout(() => d.reject(new DeadlineError()), delay2);
    return Promise.race([p, d]).finally(() => clearTimeout(t));
}
// https://deno.land/std@0.173.0/async/debounce.ts
function debounce(fn, wait) {
    let timeout = null;
    let flush = null;
    const debounced = (...args) => {
        debounced.clear();
        flush = () => {
            debounced.clear();
            fn.call(debounced, ...args);
        };
        timeout = setTimeout(flush, wait);
    };
    debounced.clear = () => {
        if (typeof timeout === "number") {
            clearTimeout(timeout);
            timeout = null;
            flush = null;
        }
    };
    debounced.flush = () => {
        flush?.();
    };
    Object.defineProperty(debounced, "pending", {
        get: () => typeof timeout === "number"
    });
    return debounced;
}
// https://deno.land/std@0.173.0/async/delay.ts
function delay(ms, options = {}) {
    const { signal, persistent } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve, reject) => {
        const abort = () => {
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = () => {
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, { once: true });
        if (persistent === false) {
            try {
                dntShim.Deno.unrefTimer(i);
            }
            catch (error) {
                if (!(error instanceof ReferenceError)) {
                    throw error;
                }
                console.error("`persistent` option is only available in Deno");
            }
        }
    });
}
// https://deno.land/std@0.173.0/async/mux_async_iterator.ts
var MuxAsyncIterator = class {
    constructor() {
        _MuxAsyncIterator_instances.add(this);
        _MuxAsyncIterator_iteratorCount.set(this, 0);
        _MuxAsyncIterator_yields.set(this, []);
        // deno-lint-ignore no-explicit-any
        _MuxAsyncIterator_throws.set(this, []);
        _MuxAsyncIterator_signal.set(this, deferred());
    }
    add(iterable) {
        var _a;
        __classPrivateFieldSet(this, _MuxAsyncIterator_iteratorCount, (_a = __classPrivateFieldGet(this, _MuxAsyncIterator_iteratorCount, "f"), ++_a), "f");
        __classPrivateFieldGet(this, _MuxAsyncIterator_instances, "m", _MuxAsyncIterator_callIteratorNext).call(this, iterable[Symbol.asyncIterator]());
    }
    async *iterate() {
        while (__classPrivateFieldGet(this, _MuxAsyncIterator_iteratorCount, "f") > 0) {
            await __classPrivateFieldGet(this, _MuxAsyncIterator_signal, "f");
            for (let i = 0; i < __classPrivateFieldGet(this, _MuxAsyncIterator_yields, "f").length; i++) {
                const { iterator, value } = __classPrivateFieldGet(this, _MuxAsyncIterator_yields, "f")[i];
                yield value;
                __classPrivateFieldGet(this, _MuxAsyncIterator_instances, "m", _MuxAsyncIterator_callIteratorNext).call(this, iterator);
            }
            if (__classPrivateFieldGet(this, _MuxAsyncIterator_throws, "f").length) {
                for (const e of __classPrivateFieldGet(this, _MuxAsyncIterator_throws, "f")) {
                    throw e;
                }
                __classPrivateFieldGet(this, _MuxAsyncIterator_throws, "f").length = 0;
            }
            __classPrivateFieldGet(this, _MuxAsyncIterator_yields, "f").length = 0;
            __classPrivateFieldSet(this, _MuxAsyncIterator_signal, deferred(), "f");
        }
    }
    [(_MuxAsyncIterator_iteratorCount = new WeakMap(), _MuxAsyncIterator_yields = new WeakMap(), _MuxAsyncIterator_throws = new WeakMap(), _MuxAsyncIterator_signal = new WeakMap(), _MuxAsyncIterator_instances = new WeakSet(), _MuxAsyncIterator_callIteratorNext = async function _MuxAsyncIterator_callIteratorNext(iterator) {
        var _a;
        try {
            const { value, done } = await iterator.next();
            if (done) {
                __classPrivateFieldSet(this, _MuxAsyncIterator_iteratorCount, (_a = __classPrivateFieldGet(this, _MuxAsyncIterator_iteratorCount, "f"), --_a), "f");
            }
            else {
                __classPrivateFieldGet(this, _MuxAsyncIterator_yields, "f").push({ iterator, value });
            }
        }
        catch (e) {
            __classPrivateFieldGet(this, _MuxAsyncIterator_throws, "f").push(e);
        }
        __classPrivateFieldGet(this, _MuxAsyncIterator_signal, "f").resolve();
    }, Symbol.asyncIterator)]() {
        return this.iterate();
    }
};
// https://deno.land/std@0.173.0/async/pool.ts
var ERROR_WHILE_MAPPING_MESSAGE = "Threw while mapping.";
function pooledMap(poolLimit, array, iteratorFn) {
    const res = new TransformStream({
        async transform(p, controller) {
            try {
                const s = await p;
                controller.enqueue(s);
            }
            catch (e) {
                if (e instanceof AggregateError && e.message == ERROR_WHILE_MAPPING_MESSAGE) {
                    controller.error(e);
                }
            }
        }
    });
    (async () => {
        const writer = res.writable.getWriter();
        const executing = [];
        try {
            for await (const item of array) {
                const p = Promise.resolve().then(() => iteratorFn(item));
                writer.write(p);
                const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
            await Promise.all(executing);
            writer.close();
        }
        catch {
            const errors = [];
            for (const result of await Promise.allSettled(executing)) {
                if (result.status == "rejected") {
                    errors.push(result.reason);
                }
            }
            writer.write(Promise.reject(new AggregateError(errors, ERROR_WHILE_MAPPING_MESSAGE))).catch(() => {
            });
        }
    })();
    return res.readable[Symbol.asyncIterator]();
}
// https://deno.land/std@0.173.0/async/tee.ts
var Queue = (_a = class {
        constructor(iterable) {
            _Queue_source.set(this, void 0);
            _Queue_queue.set(this, void 0);
            __classPrivateFieldSet(this, _Queue_source, iterable[Symbol.asyncIterator](), "f");
            __classPrivateFieldSet(this, _Queue_queue, {
                value: void 0,
                next: void 0
            }, "f");
            this.head = __classPrivateFieldGet(this, _Queue_queue, "f");
            this.done = false;
        }
        async next() {
            const result = await __classPrivateFieldGet(this, _Queue_source, "f").next();
            if (!result.done) {
                const nextNode = {
                    value: result.value,
                    next: void 0
                };
                __classPrivateFieldGet(this, _Queue_queue, "f").next = nextNode;
                __classPrivateFieldSet(this, _Queue_queue, nextNode, "f");
            }
            else {
                this.done = true;
            }
        }
    },
    _Queue_source = new WeakMap(),
    _Queue_queue = new WeakMap(),
    _a);
function tee(iterable, n = 2) {
    const queue = new Queue(iterable);
    async function* generator() {
        let buffer = queue.head;
        while (true) {
            if (buffer.next) {
                buffer = buffer.next;
                yield buffer.value;
            }
            else if (queue.done) {
                return;
            }
            else {
                await queue.next();
            }
        }
    }
    const branches = Array.from({ length: n }).map(() => generator());
    return branches;
}
// https://deno.land/std@0.173.0/async/retry.ts
var RetryError = class extends Error {
    constructor(cause, count) {
        super(`Exceeded max retry count (${count})`);
        this.name = "RetryError";
        this.cause = cause;
    }
};
var defaultRetryOptions = {
    multiplier: 2,
    maxTimeout: 6e4,
    maxAttempts: 5,
    minTimeout: 1e3
};
async function retry(fn, opts) {
    const options = {
        ...defaultRetryOptions,
        ...opts
    };
    if (options.maxTimeout >= 0 && options.minTimeout > options.maxTimeout) {
        throw new RangeError("minTimeout is greater than maxTimeout");
    }
    let timeout = options.minTimeout;
    let error;
    for (let i = 0; i < options.maxAttempts; i++) {
        try {
            return await fn();
        }
        catch (err) {
            await new Promise((r) => setTimeout(r, timeout));
            timeout *= options.multiplier;
            timeout = Math.max(timeout, options.minTimeout);
            if (options.maxTimeout >= 0) {
                timeout = Math.min(timeout, options.maxTimeout);
            }
            error = err;
        }
    }
    throw new RetryError(error, options.maxAttempts);
}
export { DeadlineError, ERROR_WHILE_MAPPING_MESSAGE, MuxAsyncIterator, RetryError, abortable, abortableAsyncIterable, abortablePromise, deadline, debounce, deferred, delay, pooledMap, retry, tee };
