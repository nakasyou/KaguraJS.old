// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
export async function runTestDefinitions(testDefinitions, options) {
    const testFailures = [];
    for (const definition of testDefinitions){
        options.process.stdout.write("test " + definition.name + " ...");
        if (definition.ignore) {
            options.process.stdout.write(` ${options.chalk.gray("ignored")}\n`);
            continue;
        }
        const context = getTestContext(definition, undefined);
        let pass = false;
        try {
            await definition.fn(context);
            if (context.hasFailingChild) {
                testFailures.push({
                    name: definition.name,
                    err: new Error("Had failing test step.")
                });
            } else {
                pass = true;
            }
        } catch (err) {
            testFailures.push({
                name: definition.name,
                err
            });
        }
        const testStepOutput = context.getOutput();
        if (testStepOutput.length > 0) {
            options.process.stdout.write(testStepOutput);
        } else {
            options.process.stdout.write(" ");
        }
        options.process.stdout.write(getStatusText(pass ? "ok" : "fail"));
        options.process.stdout.write("\n");
    }
    if (testFailures.length > 0) {
        options.process.stdout.write("\nFAILURES");
        for (const failure of testFailures){
            options.process.stdout.write("\n\n");
            options.process.stdout.write(failure.name + "\n");
            options.process.stdout.write(indentText((failure.err?.stack ?? failure.err).toString(), 1));
        }
        options.process.exit(1);
    }
    function getTestContext(definition, parent) {
        return {
            name: definition.name,
            parent,
            origin: options.origin,
            /** @type {any} */ err: undefined,
            status: "ok",
            children: [],
            get hasFailingChild () {
                return this.children.some((c)=>c.status === "fail" || c.status === "pending");
            },
            getOutput () {
                let output = "";
                if (this.parent) {
                    output += "test " + this.name + " ...";
                }
                if (this.children.length > 0) {
                    output += "\n" + this.children.map((c)=>indentText(c.getOutput(), 1)).join("\n") + "\n";
                } else if (!this.err) {
                    output += " ";
                }
                if (this.parent && this.err) {
                    output += "\n";
                }
                if (this.err) {
                    output += indentText((this.err.stack ?? this.err).toString(), 1);
                    if (this.parent) {
                        output += "\n";
                    }
                }
                if (this.parent) {
                    output += getStatusText(this.status);
                }
                return output;
            },
            async step (nameOrTestDefinition, fn) {
                const definition = getDefinition();
                const context = getTestContext(definition, this);
                context.status = "pending";
                this.children.push(context);
                if (definition.ignore) {
                    context.status = "ignored";
                    return false;
                }
                try {
                    await definition.fn(context);
                    context.status = "ok";
                    if (context.hasFailingChild) {
                        context.status = "fail";
                        return false;
                    }
                    return true;
                } catch (err) {
                    context.status = "fail";
                    context.err = err;
                    return false;
                }
                /** @returns {TestDefinition} */ function getDefinition() {
                    if (typeof nameOrTestDefinition === "string") {
                        if (!(fn instanceof Function)) {
                            throw new TypeError("Expected function for second argument.");
                        }
                        return {
                            name: nameOrTestDefinition,
                            fn
                        };
                    } else if (typeof nameOrTestDefinition === "object") {
                        return nameOrTestDefinition;
                    } else {
                        throw new TypeError("Expected a test definition or name and function.");
                    }
                }
            }
        };
    }
    function getStatusText(status) {
        switch(status){
            case "ok":
                return options.chalk.green(status);
            case "fail":
            case "pending":
                return options.chalk.red(status);
            case "ignored":
                return options.chalk.gray(status);
            default:
                {
                    const _assertNever = status;
                    return status;
                }
        }
    }
    function indentText(text, indentLevel) {
        if (text === undefined) {
            text = "[undefined]";
        } else if (text === null) {
            text = "[null]";
        } else {
            text = text.toString();
        }
        return text.split(/\r?\n/).map((line)=>"  ".repeat(indentLevel) + line).join("\n");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG50QDAuMzMuMS9saWIvdGVzdF9ydW5uZXIvdGVzdF9ydW5uZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuZXhwb3J0IGludGVyZmFjZSBDaGFsayB7XG4gIGdyZWVuKHRleHQ6IHN0cmluZyk6IHN0cmluZztcbiAgcmVkKHRleHQ6IHN0cmluZyk6IHN0cmluZztcbiAgZ3JheSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9kZVByb2Nlc3Mge1xuICBzdGRvdXQ6IHtcbiAgICB3cml0ZSh0ZXh0OiBzdHJpbmcpOiB2b2lkO1xuICB9O1xuICBleGl0KGNvZGU6IG51bWJlcik6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSdW5UZXN0RGVmaW5pdGlvbnNPcHRpb25zIHtcbiAgY2hhbGs6IENoYWxrO1xuICBwcm9jZXNzOiBOb2RlUHJvY2VzcztcbiAgLyoqIFRoZSBmaWxlIHRoZSB0ZXN0cyBhcmUgcnVubmluZyBpbi4gKi9cbiAgb3JpZ2luOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVzdERlZmluaXRpb24ge1xuICBuYW1lOiBzdHJpbmc7XG4gIGZuOiAoY29udGV4dDogVGVzdENvbnRleHQpID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICBpZ25vcmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlc3RDb250ZXh0IHtcbiAgbmFtZTogc3RyaW5nO1xuICBwYXJlbnQ6IFRlc3RDb250ZXh0IHwgdW5kZWZpbmVkO1xuICBvcmlnaW46IHN0cmluZztcbiAgZXJyOiBhbnk7XG4gIGNoaWxkcmVuOiBUZXN0Q29udGV4dFtdO1xuICBoYXNGYWlsaW5nQ2hpbGQ6IGJvb2xlYW47XG4gIGdldE91dHB1dCgpOiBzdHJpbmc7XG4gIHN0ZXAoXG4gICAgbmFtZU9yRGVmaW5pdGlvbjogc3RyaW5nIHwgVGVzdERlZmluaXRpb24sXG4gICAgZm4/OiAoY29udGV4dDogVGVzdENvbnRleHQpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+LFxuICApOiBQcm9taXNlPGJvb2xlYW4+O1xuICBzdGF0dXM6IFwib2tcIiB8IFwiZmFpbFwiIHwgXCJwZW5kaW5nXCIgfCBcImlnbm9yZWRcIjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blRlc3REZWZpbml0aW9ucyhcbiAgdGVzdERlZmluaXRpb25zOiBUZXN0RGVmaW5pdGlvbltdLFxuICBvcHRpb25zOiBSdW5UZXN0RGVmaW5pdGlvbnNPcHRpb25zLFxuKSB7XG4gIGNvbnN0IHRlc3RGYWlsdXJlcyA9IFtdO1xuICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgdGVzdERlZmluaXRpb25zKSB7XG4gICAgb3B0aW9ucy5wcm9jZXNzLnN0ZG91dC53cml0ZShcInRlc3QgXCIgKyBkZWZpbml0aW9uLm5hbWUgKyBcIiAuLi5cIik7XG4gICAgaWYgKGRlZmluaXRpb24uaWdub3JlKSB7XG4gICAgICBvcHRpb25zLnByb2Nlc3Muc3Rkb3V0LndyaXRlKGAgJHtvcHRpb25zLmNoYWxrLmdyYXkoXCJpZ25vcmVkXCIpfVxcbmApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRleHQgPSBnZXRUZXN0Q29udGV4dChkZWZpbml0aW9uLCB1bmRlZmluZWQpO1xuICAgIGxldCBwYXNzID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGRlZmluaXRpb24uZm4oY29udGV4dCk7XG4gICAgICBpZiAoY29udGV4dC5oYXNGYWlsaW5nQ2hpbGQpIHtcbiAgICAgICAgdGVzdEZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGRlZmluaXRpb24ubmFtZSxcbiAgICAgICAgICBlcnI6IG5ldyBFcnJvcihcIkhhZCBmYWlsaW5nIHRlc3Qgc3RlcC5cIiksXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFzcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0ZXN0RmFpbHVyZXMucHVzaCh7IG5hbWU6IGRlZmluaXRpb24ubmFtZSwgZXJyIH0pO1xuICAgIH1cbiAgICBjb25zdCB0ZXN0U3RlcE91dHB1dCA9IGNvbnRleHQuZ2V0T3V0cHV0KCk7XG4gICAgaWYgKHRlc3RTdGVwT3V0cHV0Lmxlbmd0aCA+IDApIHtcbiAgICAgIG9wdGlvbnMucHJvY2Vzcy5zdGRvdXQud3JpdGUodGVzdFN0ZXBPdXRwdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLnByb2Nlc3Muc3Rkb3V0LndyaXRlKFwiIFwiKTtcbiAgICB9XG4gICAgb3B0aW9ucy5wcm9jZXNzLnN0ZG91dC53cml0ZShnZXRTdGF0dXNUZXh0KHBhc3MgPyBcIm9rXCIgOiBcImZhaWxcIikpO1xuICAgIG9wdGlvbnMucHJvY2Vzcy5zdGRvdXQud3JpdGUoXCJcXG5cIik7XG4gIH1cblxuICBpZiAodGVzdEZhaWx1cmVzLmxlbmd0aCA+IDApIHtcbiAgICBvcHRpb25zLnByb2Nlc3Muc3Rkb3V0LndyaXRlKFwiXFxuRkFJTFVSRVNcIik7XG4gICAgZm9yIChjb25zdCBmYWlsdXJlIG9mIHRlc3RGYWlsdXJlcykge1xuICAgICAgb3B0aW9ucy5wcm9jZXNzLnN0ZG91dC53cml0ZShcIlxcblxcblwiKTtcbiAgICAgIG9wdGlvbnMucHJvY2Vzcy5zdGRvdXQud3JpdGUoZmFpbHVyZS5uYW1lICsgXCJcXG5cIik7XG4gICAgICBvcHRpb25zLnByb2Nlc3Muc3Rkb3V0LndyaXRlKFxuICAgICAgICBpbmRlbnRUZXh0KChmYWlsdXJlLmVycj8uc3RhY2sgPz8gZmFpbHVyZS5lcnIpLnRvU3RyaW5nKCksIDEpLFxuICAgICAgKTtcbiAgICB9XG4gICAgb3B0aW9ucy5wcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUZXN0Q29udGV4dChcbiAgICBkZWZpbml0aW9uOiBUZXN0RGVmaW5pdGlvbixcbiAgICBwYXJlbnQ6IFRlc3RDb250ZXh0IHwgdW5kZWZpbmVkLFxuICApOiBUZXN0Q29udGV4dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGRlZmluaXRpb24ubmFtZSxcbiAgICAgIHBhcmVudCxcbiAgICAgIG9yaWdpbjogb3B0aW9ucy5vcmlnaW4sXG4gICAgICAvKiogQHR5cGUge2FueX0gKi9cbiAgICAgIGVycjogdW5kZWZpbmVkLFxuICAgICAgc3RhdHVzOiBcIm9rXCIsXG4gICAgICBjaGlsZHJlbjogW10sXG4gICAgICBnZXQgaGFzRmFpbGluZ0NoaWxkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5zb21lKChjKSA9PlxuICAgICAgICAgIGMuc3RhdHVzID09PSBcImZhaWxcIiB8fCBjLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCJcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBnZXRPdXRwdXQoKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSBcIlwiO1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCJ0ZXN0IFwiICsgdGhpcy5uYW1lICsgXCIgLi4uXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIG91dHB1dCArPSBcIlxcblwiICsgdGhpcy5jaGlsZHJlbi5tYXAoKGMpID0+XG4gICAgICAgICAgICBpbmRlbnRUZXh0KGMuZ2V0T3V0cHV0KCksIDEpXG4gICAgICAgICAgKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5lcnIpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHRoaXMuZXJyKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZXJyKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IGluZGVudFRleHQoKHRoaXMuZXJyLnN0YWNrID8/IHRoaXMuZXJyKS50b1N0cmluZygpLCAxKTtcbiAgICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIG91dHB1dCArPSBcIlxcblwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gZ2V0U3RhdHVzVGV4dCh0aGlzLnN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH0sXG4gICAgICBhc3luYyBzdGVwKG5hbWVPclRlc3REZWZpbml0aW9uLCBmbikge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gZ2V0RGVmaW5pdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBnZXRUZXN0Q29udGV4dChkZWZpbml0aW9uLCB0aGlzKTtcbiAgICAgICAgY29udGV4dC5zdGF0dXMgPSBcInBlbmRpbmdcIjtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChkZWZpbml0aW9uLmlnbm9yZSkge1xuICAgICAgICAgIGNvbnRleHQuc3RhdHVzID0gXCJpZ25vcmVkXCI7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBkZWZpbml0aW9uLmZuKGNvbnRleHQpO1xuICAgICAgICAgIGNvbnRleHQuc3RhdHVzID0gXCJva1wiO1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc0ZhaWxpbmdDaGlsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zdGF0dXMgPSBcImZhaWxcIjtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnRleHQuc3RhdHVzID0gXCJmYWlsXCI7XG4gICAgICAgICAgY29udGV4dC5lcnIgPSBlcnI7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEByZXR1cm5zIHtUZXN0RGVmaW5pdGlvbn0gKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGVmaW5pdGlvbigpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG5hbWVPclRlc3REZWZpbml0aW9uID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoIShmbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgZnVuY3Rpb24gZm9yIHNlY29uZCBhcmd1bWVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBuYW1lOiBuYW1lT3JUZXN0RGVmaW5pdGlvbixcbiAgICAgICAgICAgICAgZm4sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWVPclRlc3REZWZpbml0aW9uID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZU9yVGVzdERlZmluaXRpb247XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgIFwiRXhwZWN0ZWQgYSB0ZXN0IGRlZmluaXRpb24gb3IgbmFtZSBhbmQgZnVuY3Rpb24uXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3RhdHVzVGV4dChzdGF0dXM6IFRlc3RDb250ZXh0W1wic3RhdHVzXCJdKSB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgXCJva1wiOlxuICAgICAgICByZXR1cm4gb3B0aW9ucy5jaGFsay5ncmVlbihzdGF0dXMpO1xuICAgICAgY2FzZSBcImZhaWxcIjpcbiAgICAgIGNhc2UgXCJwZW5kaW5nXCI6XG4gICAgICAgIHJldHVybiBvcHRpb25zLmNoYWxrLnJlZChzdGF0dXMpO1xuICAgICAgY2FzZSBcImlnbm9yZWRcIjpcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuY2hhbGsuZ3JheShzdGF0dXMpO1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBjb25zdCBfYXNzZXJ0TmV2ZXI6IG5ldmVyID0gc3RhdHVzO1xuICAgICAgICByZXR1cm4gc3RhdHVzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluZGVudFRleHQodGV4dDogc3RyaW5nLCBpbmRlbnRMZXZlbDogbnVtYmVyKSB7XG4gICAgaWYgKHRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGV4dCA9IFwiW3VuZGVmaW5lZF1cIjtcbiAgICB9IGVsc2UgaWYgKHRleHQgPT09IG51bGwpIHtcbiAgICAgIHRleHQgPSBcIltudWxsXVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0ID0gdGV4dC50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dC5zcGxpdCgvXFxyP1xcbi8pXG4gICAgICAubWFwKChsaW5lKSA9PiBcIiAgXCIucmVwZWF0KGluZGVudExldmVsKSArIGxpbmUpXG4gICAgICAuam9pbihcIlxcblwiKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQTJDMUUsT0FBTyxlQUFlLG1CQUNwQixlQUFpQyxFQUNqQyxPQUFrQyxFQUNsQztJQUNBLE1BQU0sZUFBZSxFQUFFO0lBQ3ZCLEtBQUssTUFBTSxjQUFjLGdCQUFpQjtRQUN4QyxRQUFRLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsV0FBVyxJQUFJLEdBQUc7UUFDekQs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