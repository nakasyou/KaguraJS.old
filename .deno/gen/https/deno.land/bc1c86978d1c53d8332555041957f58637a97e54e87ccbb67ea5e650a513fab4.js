// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
export function splitLast(value, delimiter) {
    const split = value.split(delimiter);
    return [
        split.slice(0, -1).join(delimiter)
    ].concat(split.slice(-1));
}
function tokenAsValue(authToken) {
    return authToken.type === "basic" ? `Basic ${authToken.username}:${authToken.password}` : `Bearer ${authToken.token}`;
}
export class AuthTokens {
    #tokens;
    constructor(tokensStr = ""){
        const tokens = [];
        for (const tokenStr of tokensStr.split(";").filter((s)=>s.length > 0)){
            if (tokensStr.includes("@")) {
                const [host, token] = splitLast(tokenStr, "@");
                if (token.includes(":")) {
                    const [password, username] = splitLast(token, ":");
                    tokens.push({
                        type: "basic",
                        host,
                        username,
                        password
                    });
                } else {
                    tokens.push({
                        type: "bearer",
                        host,
                        token
                    });
                }
            } else {
                console.error("Badly formed auth token discarded.");
            }
        }
        this.#tokens = tokens;
    }
    get(specifier) {
        for (const token of this.#tokens){
            if (token.host.endsWith(specifier.host)) {
                return tokenAsValue(token);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9hdXRoX3Rva2Vucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbnRlcmZhY2UgQmVhcmVyQXV0aFRva2VuIHtcbiAgdHlwZTogXCJiZWFyZXJcIjtcbiAgaG9zdDogc3RyaW5nO1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQmFzaWNBdXRoVG9rZW4ge1xuICB0eXBlOiBcImJhc2ljXCI7XG4gIGhvc3Q6IHN0cmluZztcbiAgdXNlcm5hbWU6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbn1cblxudHlwZSBBdXRoVG9rZW4gPSBCZWFyZXJBdXRoVG9rZW4gfCBCYXNpY0F1dGhUb2tlbjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TGFzdChcbiAgdmFsdWU6IHN0cmluZyxcbiAgZGVsaW1pdGVyOiBzdHJpbmcsXG4pOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc3BsaXQgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICByZXR1cm4gW3NwbGl0LnNsaWNlKDAsIC0xKS5qb2luKGRlbGltaXRlcildLmNvbmNhdChzcGxpdC5zbGljZSgtMSkpIGFzIFtcbiAgICBzdHJpbmcsXG4gICAgc3RyaW5nLFxuICBdO1xufVxuXG5mdW5jdGlvbiB0b2tlbkFzVmFsdWUoYXV0aFRva2VuOiBBdXRoVG9rZW4pOiBzdHJpbmcge1xuICByZXR1cm4gYXV0aFRva2VuLnR5cGUgPT09IFwiYmFzaWNcIlxuICAgID8gYEJhc2ljICR7YXV0aFRva2VuLnVzZXJuYW1lfToke2F1dGhUb2tlbi5wYXNzd29yZH1gXG4gICAgOiBgQmVhcmVyICR7YXV0aFRva2VuLnRva2VufWA7XG59XG5cbmV4cG9ydCBjbGFzcyBBdXRoVG9rZW5zIHtcbiAgI3Rva2VuczogQXV0aFRva2VuW107XG4gIGNvbnN0cnVjdG9yKHRva2Vuc1N0ciA9IFwiXCIpIHtcbiAgICBjb25zdCB0b2tlbnM6IEF1dGhUb2tlbltdID0gW107XG4gICAgZm9yIChjb25zdCB0b2tlblN0ciBvZiB0b2tlbnNTdHIuc3BsaXQoXCI7XCIpLmZpbHRlcigocykgPT4gcy5sZW5ndGggPiAwKSkge1xuICAgICAgaWYgKHRva2Vuc1N0ci5pbmNsdWRlcyhcIkBcIikpIHtcbiAgICAgICAgY29uc3QgW2hvc3QsIHRva2VuXSA9IHNwbGl0TGFzdCh0b2tlblN0ciwgXCJAXCIpO1xuICAgICAgICBpZiAodG9rZW4uaW5jbHVkZXMoXCI6XCIpKSB7XG4gICAgICAgICAgY29uc3QgW3Bhc3N3b3JkLCB1c2VybmFtZV0gPSBzcGxpdExhc3QodG9rZW4sIFwiOlwiKTtcbiAgICAgICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFwiYmFzaWNcIiwgaG9zdCwgdXNlcm5hbWUsIHBhc3N3b3JkIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogXCJiZWFyZXJcIiwgaG9zdCwgdG9rZW4gfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJCYWRseSBmb3JtZWQgYXV0aCB0b2tlbiBkaXNjYXJkZWQuXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiN0b2tlbnMgPSB0b2tlbnM7XG4gIH1cblxuICBnZXQoc3BlY2lmaWVyOiBVUkwpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdGhpcy4jdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4uaG9zdC5lbmRzV2l0aChzcGVjaWZpZXIuaG9zdCkpIHtcbiAgICAgICAgcmV0dXJuIHRva2VuQXNWYWx1ZSh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBaUIxRSxPQUFPLFNBQVMsVUFDZCxLQUFhLEVBQ2IsU0FBaUIsRUFDQztJQUNsQixNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUM7SUFDMUIsT0FBTztRQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFJbEUsQ0FBQztBQUVELFNBQVMsYUFBYSxTQUFvQixFQUFVO0lBQ2xELE9BQU8sVUFBVSxJQUFJLEtBQUssVUFDdEIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxRQUFRLENBQUMsQ0FBQyxFQUFFLFVBQVUsUUFBUSxDQUFDLENBQUMsR0FDbkQsQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLLENBQUMsQ0FBQztBQUNqQztBQUVBLE9BQU8sTUFBTTtJQUNYLENBQUMsTUFBTSxDQUFjO0lBQ3JCLFlBQVksWUFBWSxFQUFFLENBQUU7UUFDMUIsTUFBTSxTQUFzQixFQUFFO1FBQzlCLEtBQUssTUFBTSxZQUFZLFVBQVUsS0FBSyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsSUFBTSxFQUFFLE1BQU0sR0FBRyxHQUFJO1lBQ3ZFLElBQUksVUFBVSxRQUFRLENBQUMsTUFBTTtnQkFDM0IsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLFVBQVUsVUFBVTtnQkFDMUMsSUFBSSxNQUFNLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixNQUFNLENBQUMsVUFBVSxTQUFTLEdBQUcsVUFBVSxPQUFPO29CQUM5QyxPQUFPLElBQUksQ0FBQzt3QkFBRSxNQUFNO3dCQUFTO3dCQUFNO3dCQUFVO29CQUFTO2dCQUN4RCxPQUFPO29CQUNMLE9BQU8sSUFBSSxDQUFDO3dCQUFFLE1BQU07d0JBQVU7d0JBQU07b0JBQU07Z0JBQzVDLENBQUM7WUFDSCxPQUFPO2dCQUNMLFFBQVEsS0FBSyxDQUFDO1lBQ2hCLENBQUM7UUFDSDtRQUNBLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRztJQUNqQjtJQUVBLElBQUksU0FBYyxFQUFzQjtRQUN0QyxLQUFLLE1BQU0sU0FBUyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUU7WUFDaEMsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLEdBQUc7Z0JBQ3ZDLE9BQU8sYUFBYTtZQUN0QixDQUFDO1FBQ0g7SUFDRjtBQUNGLENBQUMifQ==