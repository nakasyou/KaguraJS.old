// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
export function shimOptionsToTransformShims(options) {
    const shims = [];
    const testShims = [];
    if (typeof options.deno === "object") {
        add(options.deno.test, getDenoTestShim);
    } else {
        add(options.deno, getDenoShim);
    }
    add(options.blob, getBlobShim);
    add(options.crypto, getCryptoShim);
    add(options.prompts, getPromptsShim);
    add(options.timers, getTimersShim);
    add(options.domException, getDomExceptionShim);
    add(options.undici, getUndiciShim);
    add(options.weakRef, getWeakRefShim);
    add(options.webSocket, getWebSocketShim);
    if (options.custom) {
        shims.push(...options.custom);
        testShims.push(...options.custom);
    }
    if (options.customDev) {
        testShims.push(...options.customDev);
    }
    return {
        shims,
        testShims
    };
    function add(option, getShim) {
        if (option === true) {
            shims.push(getShim());
            testShims.push(getShim());
        } else if (option === "dev") {
            testShims.push(getShim());
        }
    }
}
function getDenoShim() {
    return {
        package: {
            name: "@deno/shim-deno",
            version: "~0.12.0"
        },
        globalNames: [
            "Deno"
        ]
    };
}
function getDenoTestShim() {
    return {
        package: {
            name: "@deno/shim-deno-test",
            version: "~0.4.0"
        },
        globalNames: [
            "Deno"
        ]
    };
}
function getCryptoShim() {
    return {
        package: {
            name: "@deno/shim-crypto",
            version: "~0.3.1"
        },
        globalNames: [
            "crypto",
            typeOnly("Crypto"),
            typeOnly("SubtleCrypto"),
            typeOnly("AlgorithmIdentifier"),
            typeOnly("Algorithm"),
            typeOnly("RsaOaepParams"),
            typeOnly("BufferSource"),
            typeOnly("AesCtrParams"),
            typeOnly("AesCbcParams"),
            typeOnly("AesGcmParams"),
            typeOnly("CryptoKey"),
            typeOnly("KeyAlgorithm"),
            typeOnly("KeyType"),
            typeOnly("KeyUsage"),
            typeOnly("EcdhKeyDeriveParams"),
            typeOnly("HkdfParams"),
            typeOnly("HashAlgorithmIdentifier"),
            typeOnly("Pbkdf2Params"),
            typeOnly("AesDerivedKeyParams"),
            typeOnly("HmacImportParams"),
            typeOnly("JsonWebKey"),
            typeOnly("RsaOtherPrimesInfo"),
            typeOnly("KeyFormat"),
            typeOnly("RsaHashedKeyGenParams"),
            typeOnly("RsaKeyGenParams"),
            typeOnly("BigInteger"),
            typeOnly("EcKeyGenParams"),
            typeOnly("NamedCurve"),
            typeOnly("CryptoKeyPair"),
            typeOnly("AesKeyGenParams"),
            typeOnly("HmacKeyGenParams"),
            typeOnly("RsaHashedImportParams"),
            typeOnly("EcKeyImportParams"),
            typeOnly("AesKeyAlgorithm"),
            typeOnly("RsaPssParams"),
            typeOnly("EcdsaParams")
        ]
    };
}
function getBlobShim() {
    return {
        module: "buffer",
        globalNames: [
            "Blob"
        ]
    };
}
function getPromptsShim() {
    return {
        package: {
            name: "@deno/shim-prompts",
            version: "~0.1.0"
        },
        globalNames: [
            "alert",
            "confirm",
            "prompt"
        ]
    };
}
function getTimersShim() {
    return {
        package: {
            name: "@deno/shim-timers",
            version: "~0.1.0"
        },
        globalNames: [
            "setInterval",
            "setTimeout"
        ]
    };
}
function getUndiciShim() {
    return {
        package: {
            name: "undici",
            version: "^5.14.0"
        },
        globalNames: [
            "fetch",
            "File",
            "FormData",
            "Headers",
            "Request",
            "Response",
            typeOnly("BodyInit"),
            typeOnly("HeadersInit"),
            typeOnly("RequestInit"),
            typeOnly("ResponseInit")
        ]
    };
}
function getDomExceptionShim() {
    return {
        package: {
            name: "domexception",
            version: "^4.0.0"
        },
        typesPackage: {
            name: "@types/domexception",
            version: "^4.0.0"
        },
        globalNames: [
            {
                name: "DOMException",
                exportName: "default"
            }
        ]
    };
}
function getWeakRefShim() {
    return {
        package: {
            name: "@deno/sham-weakref",
            version: "~0.1.0"
        },
        globalNames: [
            "WeakRef",
            typeOnly("WeakRefConstructor")
        ]
    };
}
function getWebSocketShim() {
    return {
        package: {
            name: "ws",
            version: "^8.12.0"
        },
        typesPackage: {
            name: "@types/ws",
            version: "^8.5.4",
            peerDependency: false
        },
        globalNames: [
            {
                name: "WebSocket",
                exportName: "default"
            }
        ]
    };
}
function typeOnly(name) {
    return {
        name,
        typeOnly: true
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvc2hpbXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBHbG9iYWxOYW1lLCBTaGltIH0gZnJvbSBcIi4uL3RyYW5zZm9ybS50c1wiO1xuXG4vKiogUHJvdmlkZSBgdHJ1ZWAgdG8gdXNlIHRoZSBzaGltIGluIGJvdGggdGhlIGRpc3RyaWJ1dGVkIGNvZGUgYW5kIHRlc3QgY29kZSxcbiAqIGBcImRldlwiYCB0byBvbmx5IHVzZSBpdCBpbiB0aGUgdGVzdCBjb2RlLCBvciBgZmFsc2VgIHRvIG5vdCB1c2UgdGhlIHNoaW1cbiAqIGF0IGFsbC5cbiAqXG4gKiBAcmVtYXJrcyBEZWZhdWx0cyB0byBgZmFsc2VgLlxuICovXG5leHBvcnQgdHlwZSBTaGltVmFsdWUgPSBib29sZWFuIHwgXCJkZXZcIjtcblxuLyoqIFByb3ZpZGUgYHRydWVgIHRvIHVzZSB0aGUgc2hpbSBpbiBib3RoIHRoZSBkaXN0cmlidXRlZCBjb2RlIGFuZCB0ZXN0IGNvZGUsXG4gKiBgXCJkZXZcImAgdG8gb25seSB1c2UgaXQgaW4gdGhlIHRlc3QgY29kZSwgb3IgYGZhbHNlYCB0byBub3QgdXNlIHRoZSBzaGltXG4gKiBhdCBhbGwuXG4gKlxuICogQHJlbWFya3MgVGhlc2UgYWxsIGRlZmF1bHQgdG8gYGZhbHNlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaGltT3B0aW9ucyB7XG4gIC8qKiBTaGltIHRoZSBgRGVub2AgbmFtZXNwYWNlLiAqL1xuICBkZW5vPzogU2hpbVZhbHVlIHwge1xuICAgIHRlc3Q6IFNoaW1WYWx1ZTtcbiAgfTtcbiAgLyoqIFNoaW0gdGhlIGdsb2JhbCBgc2V0VGltZW91dGAgYW5kIGBzZXRJbnRlcnZhbGAgZnVuY3Rpb25zIHdpdGhcbiAgICogRGVubyBhbmQgYnJvd3NlciBjb21wYXRpYmxlIHZlcnNpb25zLlxuICAgKi9cbiAgdGltZXJzPzogU2hpbVZhbHVlO1xuICAvKiogU2hpbSB0aGUgZ2xvYmFsIGBjb25maXJtYCwgYGFsZXJ0YCwgYW5kIGBwcm9tcHRgIGZ1bmN0aW9ucy4gKi9cbiAgcHJvbXB0cz86IFNoaW1WYWx1ZTtcbiAgLyoqIFNoaW0gdGhlIGBCbG9iYCBnbG9iYWwgd2l0aCB0aGUgb25lIGZyb20gdGhlIGBcImJ1ZmZlclwiYCBtb2R1bGUuICovXG4gIGJsb2I/OiBTaGltVmFsdWU7XG4gIC8qKiBTaGltIHRoZSBgY3J5cHRvYCBnbG9iYWwuICovXG4gIGNyeXB0bz86IFNoaW1WYWx1ZTtcbiAgLyoqIFNoaW0gYERPTUV4Y2VwdGlvbmAgdXNpbmcgdGhlIFwiZG9tZXhjZXB0aW9uXCIgcGFja2FnZSAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZG9tZXhjZXB0aW9uKSAqL1xuICBkb21FeGNlcHRpb24/OiBTaGltVmFsdWU7XG4gIC8qKiBTaGltIGBmZXRjaGAsIGBGaWxlYCwgYEZvcm1EYXRhYCwgYEhlYWRlcnNgLCBgUmVxdWVzdGAsIGFuZCBgUmVzcG9uc2VgIGJ5XG4gICAqIHVzaW5nIHRoZSBcInVuZGljaVwiIHBhY2thZ2UgKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3VuZGljaSkuXG4gICAqL1xuICB1bmRpY2k/OiBTaGltVmFsdWU7XG4gIC8qKiBVc2UgYSBzaGFtIGZvciB0aGUgYFdlYWtSZWZgIGdsb2JhbCwgd2hpY2ggdXNlcyBgZ2xvYmFsVGhpcy5XZWFrUmVmYCB3aGVuXG4gICAqIGl0IGV4aXN0cy4gVGhlIHNoYW0gd2lsbCB0aHJvdyBhdCBydW50aW1lIHdoZW4gY2FsbGluZyBgZGVyZWYoKWAgYW5kIGBXZWFrUmVmYFxuICAgKiBkb2Vzbid0IGdsb2JhbGx5IGV4aXN0LCBzbyB0aGlzIGlzIG9ubHkgaW50ZW5kZWQgdG8gaGVscCB0eXBlIGNoZWNrIGNvZGUgdGhhdFxuICAgKiB3b24ndCBhY3R1YWxseSB1c2UgaXQuXG4gICAqL1xuICB3ZWFrUmVmPzogU2hpbVZhbHVlO1xuICAvKiogU2hpbSBgV2ViU29ja2V0YCB3aXRoIHRoZSBgd3NgIHBhY2thZ2UgKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3dzKS4gKi9cbiAgd2ViU29ja2V0PzogYm9vbGVhbiB8IFwiZGV2XCI7XG4gIC8qKiBDdXN0b20gc2hpbXMgdG8gdXNlLiAqL1xuICBjdXN0b20/OiBTaGltW107XG4gIC8qKiBDdXN0b20gc2hpbXMgdG8gdXNlIG9ubHkgZm9yIHRoZSB0ZXN0IGNvZGUuICovXG4gIGN1c3RvbURldj86IFNoaW1bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZW5vU2hpbU9wdGlvbnMge1xuICAvKiogT25seSBpbXBvcnQgdGhlIGBEZW5vYCBuYW1lc3BhY2UgZm9yIGBEZW5vLnRlc3RgLlxuICAgKiBUaGlzIG1heSBiZSB1c2VmdWwgZm9yIGVudmlyb25tZW50c1xuICAgKi9cbiAgdGVzdDogYm9vbGVhbiB8IFwiZGV2XCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGltT3B0aW9uc1RvVHJhbnNmb3JtU2hpbXMob3B0aW9uczogU2hpbU9wdGlvbnMpIHtcbiAgY29uc3Qgc2hpbXM6IFNoaW1bXSA9IFtdO1xuICBjb25zdCB0ZXN0U2hpbXM6IFNoaW1bXSA9IFtdO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5kZW5vID09PSBcIm9iamVjdFwiKSB7XG4gICAgYWRkKG9wdGlvbnMuZGVuby50ZXN0LCBnZXREZW5vVGVzdFNoaW0pO1xuICB9IGVsc2Uge1xuICAgIGFkZChvcHRpb25zLmRlbm8sIGdldERlbm9TaGltKTtcbiAgfVxuICBhZGQob3B0aW9ucy5ibG9iLCBnZXRCbG9iU2hpbSk7XG4gIGFkZChvcHRpb25zLmNyeXB0bywgZ2V0Q3J5cHRvU2hpbSk7XG4gIGFkZChvcHRpb25zLnByb21wdHMsIGdldFByb21wdHNTaGltKTtcbiAgYWRkKG9wdGlvbnMudGltZXJzLCBnZXRUaW1lcnNTaGltKTtcbiAgYWRkKG9wdGlvbnMuZG9tRXhjZXB0aW9uLCBnZXREb21FeGNlcHRpb25TaGltKTtcbiAgYWRkKG9wdGlvbnMudW5kaWNpLCBnZXRVbmRpY2lTaGltKTtcbiAgYWRkKG9wdGlvbnMud2Vha1JlZiwgZ2V0V2Vha1JlZlNoaW0pO1xuICBhZGQob3B0aW9ucy53ZWJTb2NrZXQsIGdldFdlYlNvY2tldFNoaW0pO1xuXG4gIGlmIChvcHRpb25zLmN1c3RvbSkge1xuICAgIHNoaW1zLnB1c2goLi4ub3B0aW9ucy5jdXN0b20pO1xuICAgIHRlc3RTaGltcy5wdXNoKC4uLm9wdGlvbnMuY3VzdG9tKTtcbiAgfVxuICBpZiAob3B0aW9ucy5jdXN0b21EZXYpIHtcbiAgICB0ZXN0U2hpbXMucHVzaCguLi5vcHRpb25zLmN1c3RvbURldik7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNoaW1zLFxuICAgIHRlc3RTaGltcyxcbiAgfTtcblxuICBmdW5jdGlvbiBhZGQob3B0aW9uOiBib29sZWFuIHwgXCJkZXZcIiB8IHVuZGVmaW5lZCwgZ2V0U2hpbTogKCkgPT4gU2hpbSkge1xuICAgIGlmIChvcHRpb24gPT09IHRydWUpIHtcbiAgICAgIHNoaW1zLnB1c2goZ2V0U2hpbSgpKTtcbiAgICAgIHRlc3RTaGltcy5wdXNoKGdldFNoaW0oKSk7XG4gICAgfSBlbHNlIGlmIChvcHRpb24gPT09IFwiZGV2XCIpIHtcbiAgICAgIHRlc3RTaGltcy5wdXNoKGdldFNoaW0oKSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlbm9TaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIHBhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwiQGRlbm8vc2hpbS1kZW5vXCIsXG4gICAgICB2ZXJzaW9uOiBcIn4wLjEyLjBcIixcbiAgICB9LFxuICAgIGdsb2JhbE5hbWVzOiBbXCJEZW5vXCJdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREZW5vVGVzdFNoaW0oKTogU2hpbSB7XG4gIHJldHVybiB7XG4gICAgcGFja2FnZToge1xuICAgICAgbmFtZTogXCJAZGVuby9zaGltLWRlbm8tdGVzdFwiLFxuICAgICAgdmVyc2lvbjogXCJ+MC40LjBcIixcbiAgICB9LFxuICAgIGdsb2JhbE5hbWVzOiBbXCJEZW5vXCJdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRDcnlwdG9TaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIHBhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwiQGRlbm8vc2hpbS1jcnlwdG9cIixcbiAgICAgIHZlcnNpb246IFwifjAuMy4xXCIsXG4gICAgfSxcbiAgICBnbG9iYWxOYW1lczogW1xuICAgICAgXCJjcnlwdG9cIixcbiAgICAgIHR5cGVPbmx5KFwiQ3J5cHRvXCIpLFxuICAgICAgdHlwZU9ubHkoXCJTdWJ0bGVDcnlwdG9cIiksXG4gICAgICB0eXBlT25seShcIkFsZ29yaXRobUlkZW50aWZpZXJcIiksXG4gICAgICB0eXBlT25seShcIkFsZ29yaXRobVwiKSxcbiAgICAgIHR5cGVPbmx5KFwiUnNhT2FlcFBhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiQnVmZmVyU291cmNlXCIpLFxuICAgICAgdHlwZU9ubHkoXCJBZXNDdHJQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkFlc0NiY1BhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiQWVzR2NtUGFyYW1zXCIpLFxuICAgICAgdHlwZU9ubHkoXCJDcnlwdG9LZXlcIiksXG4gICAgICB0eXBlT25seShcIktleUFsZ29yaXRobVwiKSxcbiAgICAgIHR5cGVPbmx5KFwiS2V5VHlwZVwiKSxcbiAgICAgIHR5cGVPbmx5KFwiS2V5VXNhZ2VcIiksXG4gICAgICB0eXBlT25seShcIkVjZGhLZXlEZXJpdmVQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkhrZGZQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkhhc2hBbGdvcml0aG1JZGVudGlmaWVyXCIpLFxuICAgICAgdHlwZU9ubHkoXCJQYmtkZjJQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkFlc0Rlcml2ZWRLZXlQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkhtYWNJbXBvcnRQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkpzb25XZWJLZXlcIiksXG4gICAgICB0eXBlT25seShcIlJzYU90aGVyUHJpbWVzSW5mb1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiS2V5Rm9ybWF0XCIpLFxuICAgICAgdHlwZU9ubHkoXCJSc2FIYXNoZWRLZXlHZW5QYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIlJzYUtleUdlblBhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiQmlnSW50ZWdlclwiKSxcbiAgICAgIHR5cGVPbmx5KFwiRWNLZXlHZW5QYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIk5hbWVkQ3VydmVcIiksXG4gICAgICB0eXBlT25seShcIkNyeXB0b0tleVBhaXJcIiksXG4gICAgICB0eXBlT25seShcIkFlc0tleUdlblBhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiSG1hY0tleUdlblBhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiUnNhSGFzaGVkSW1wb3J0UGFyYW1zXCIpLFxuICAgICAgdHlwZU9ubHkoXCJFY0tleUltcG9ydFBhcmFtc1wiKSxcbiAgICAgIHR5cGVPbmx5KFwiQWVzS2V5QWxnb3JpdGhtXCIpLFxuICAgICAgdHlwZU9ubHkoXCJSc2FQc3NQYXJhbXNcIiksXG4gICAgICB0eXBlT25seShcIkVjZHNhUGFyYW1zXCIpLFxuICAgIF0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEJsb2JTaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIG1vZHVsZTogXCJidWZmZXJcIixcbiAgICBnbG9iYWxOYW1lczogW1wiQmxvYlwiXSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvbXB0c1NoaW0oKTogU2hpbSB7XG4gIHJldHVybiB7XG4gICAgcGFja2FnZToge1xuICAgICAgbmFtZTogXCJAZGVuby9zaGltLXByb21wdHNcIixcbiAgICAgIHZlcnNpb246IFwifjAuMS4wXCIsXG4gICAgfSxcbiAgICBnbG9iYWxOYW1lczogW1wiYWxlcnRcIiwgXCJjb25maXJtXCIsIFwicHJvbXB0XCJdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUaW1lcnNTaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIHBhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwiQGRlbm8vc2hpbS10aW1lcnNcIixcbiAgICAgIHZlcnNpb246IFwifjAuMS4wXCIsXG4gICAgfSxcbiAgICBnbG9iYWxOYW1lczogW1wic2V0SW50ZXJ2YWxcIiwgXCJzZXRUaW1lb3V0XCJdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRVbmRpY2lTaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIHBhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwidW5kaWNpXCIsXG4gICAgICB2ZXJzaW9uOiBcIl41LjE0LjBcIixcbiAgICB9LFxuICAgIGdsb2JhbE5hbWVzOiBbXG4gICAgICBcImZldGNoXCIsXG4gICAgICBcIkZpbGVcIixcbiAgICAgIFwiRm9ybURhdGFcIixcbiAgICAgIFwiSGVhZGVyc1wiLFxuICAgICAgXCJSZXF1ZXN0XCIsXG4gICAgICBcIlJlc3BvbnNlXCIsXG4gICAgICB0eXBlT25seShcIkJvZHlJbml0XCIpLFxuICAgICAgdHlwZU9ubHkoXCJIZWFkZXJzSW5pdFwiKSxcbiAgICAgIHR5cGVPbmx5KFwiUmVxdWVzdEluaXRcIiksXG4gICAgICB0eXBlT25seShcIlJlc3BvbnNlSW5pdFwiKSxcbiAgICBdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREb21FeGNlcHRpb25TaGltKCk6IFNoaW0ge1xuICByZXR1cm4ge1xuICAgIHBhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwiZG9tZXhjZXB0aW9uXCIsXG4gICAgICB2ZXJzaW9uOiBcIl40LjAuMFwiLFxuICAgIH0sXG4gICAgdHlwZXNQYWNrYWdlOiB7XG4gICAgICBuYW1lOiBcIkB0eXBlcy9kb21leGNlcHRpb25cIixcbiAgICAgIHZlcnNpb246IFwiXjQuMC4wXCIsXG4gICAgfSxcbiAgICBnbG9iYWxOYW1lczogW3tcbiAgICAgIG5hbWU6IFwiRE9NRXhjZXB0aW9uXCIsXG4gICAgICBleHBvcnROYW1lOiBcImRlZmF1bHRcIixcbiAgICB9XSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0V2Vha1JlZlNoaW0oKTogU2hpbSB7XG4gIHJldHVybiB7XG4gICAgcGFja2FnZToge1xuICAgICAgbmFtZTogXCJAZGVuby9zaGFtLXdlYWtyZWZcIixcbiAgICAgIHZlcnNpb246IFwifjAuMS4wXCIsXG4gICAgfSxcbiAgICBnbG9iYWxOYW1lczogW1wiV2Vha1JlZlwiLCB0eXBlT25seShcIldlYWtSZWZDb25zdHJ1Y3RvclwiKV0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFdlYlNvY2tldFNoaW0oKTogU2hpbSB7XG4gIHJldHVybiB7XG4gICAgcGFja2FnZToge1xuICAgICAgbmFtZTogXCJ3c1wiLFxuICAgICAgdmVyc2lvbjogXCJeOC4xMi4wXCIsXG4gICAgfSxcbiAgICB0eXBlc1BhY2thZ2U6IHtcbiAgICAgIG5hbWU6IFwiQHR5cGVzL3dzXCIsXG4gICAgICB2ZXJzaW9uOiBcIl44LjUuNFwiLFxuICAgICAgcGVlckRlcGVuZGVuY3k6IGZhbHNlLFxuICAgIH0sXG4gICAgZ2xvYmFsTmFtZXM6IFt7XG4gICAgICBuYW1lOiBcIldlYlNvY2tldFwiLFxuICAgICAgZXhwb3J0TmFtZTogXCJkZWZhdWx0XCIsXG4gICAgfV0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHR5cGVPbmx5KG5hbWU6IHN0cmluZyk6IEdsb2JhbE5hbWUge1xuICByZXR1cm4ge1xuICAgIG5hbWUsXG4gICAgdHlwZU9ubHk6IHRydWUsXG4gIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBNEQxRSxPQUFPLFNBQVMsNEJBQTRCLE9BQW9CLEVBQUU7SUFDaEUsTUFB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