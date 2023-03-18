// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { dirname, ensureDir, extname, isAbsolute, join } from "./deps.ts";
import { assert, CACHE_PERM, isFile, urlToFilename } from "./util.ts";
class Metadata {
    headers;
    url;
    constructor(headers, url){
        this.headers = headers;
        this.url = url;
    }
    async write(cacheFilename) {
        const metadataFilename = Metadata.filename(cacheFilename);
        const json = JSON.stringify({
            headers: this.headers,
            url: this.url
        }, undefined, "  ");
        await Deno.writeTextFile(metadataFilename, json, {
            mode: CACHE_PERM
        });
    }
    static filename(cacheFilename) {
        const currentExt = extname(cacheFilename);
        if (currentExt) {
            const re = new RegExp(`\\${currentExt}$`);
            return cacheFilename.replace(re, ".metadata.json");
        } else {
            return `${cacheFilename}.metadata.json`;
        }
    }
}
export class HttpCache {
    location;
    readOnly;
    constructor(location, readOnly){
        assert(isAbsolute(location));
        this.location = location;
        this.readOnly = readOnly;
    }
    getCacheFilename(url) {
        return join(this.location, urlToFilename(url));
    }
    async get(url) {
        const cacheFilename = join(this.location, urlToFilename(url));
        const metadataFilename = Metadata.filename(cacheFilename);
        if (!await isFile(cacheFilename)) {
            return undefined;
        }
        const file = await Deno.open(cacheFilename, {
            read: true
        });
        const metadataStr = await Deno.readTextFile(metadataFilename);
        const metadata = JSON.parse(metadataStr);
        assert(metadata.headers);
        return [
            file,
            metadata.headers
        ];
    }
    async set(url, headers, content) {
        if (this.readOnly === undefined) {
            this.readOnly = (await Deno.permissions.query({
                name: "write"
            })).state === "denied" ? true : false;
        }
        if (this.readOnly) {
            return;
        }
        const cacheFilename = join(this.location, urlToFilename(url));
        const parentFilename = dirname(cacheFilename);
        await ensureDir(parentFilename);
        await Deno.writeTextFile(cacheFilename, content, {
            mode: CACHE_PERM
        });
        const metadata = new Metadata(headers, url);
        await metadata.write(cacheFilename);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub19jYWNoZUAwLjQuMS9odHRwX2NhY2hlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGRpcm5hbWUsIGVuc3VyZURpciwgZXh0bmFtZSwgaXNBYnNvbHV0ZSwgam9pbiB9IGZyb20gXCIuL2RlcHMudHNcIjtcbmltcG9ydCB7IGFzc2VydCwgQ0FDSEVfUEVSTSwgaXNGaWxlLCB1cmxUb0ZpbGVuYW1lIH0gZnJvbSBcIi4vdXRpbC50c1wiO1xuXG5jbGFzcyBNZXRhZGF0YSB7XG4gIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHVybDogVVJMO1xuXG4gIGNvbnN0cnVjdG9yKGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIHVybDogVVJMKSB7XG4gICAgdGhpcy5oZWFkZXJzID0gaGVhZGVycztcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGNhY2hlRmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1ldGFkYXRhRmlsZW5hbWUgPSBNZXRhZGF0YS5maWxlbmFtZShjYWNoZUZpbGVuYW1lKTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHRoaXMuaGVhZGVycyxcbiAgICAgICAgdXJsOiB0aGlzLnVybCxcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBcIiAgXCIsXG4gICAgKTtcbiAgICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUobWV0YWRhdGFGaWxlbmFtZSwganNvbiwgeyBtb2RlOiBDQUNIRV9QRVJNIH0pO1xuICB9XG5cbiAgc3RhdGljIGZpbGVuYW1lKGNhY2hlRmlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY3VycmVudEV4dCA9IGV4dG5hbWUoY2FjaGVGaWxlbmFtZSk7XG4gICAgaWYgKGN1cnJlbnRFeHQpIHtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXFxcXCR7Y3VycmVudEV4dH0kYCk7XG4gICAgICByZXR1cm4gY2FjaGVGaWxlbmFtZS5yZXBsYWNlKHJlLCBcIi5tZXRhZGF0YS5qc29uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7Y2FjaGVGaWxlbmFtZX0ubWV0YWRhdGEuanNvbmA7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwQ2FjaGUge1xuICBsb2NhdGlvbjogc3RyaW5nO1xuICByZWFkT25seT86IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IobG9jYXRpb246IHN0cmluZywgcmVhZE9ubHk/OiBib29sZWFuKSB7XG4gICAgYXNzZXJ0KGlzQWJzb2x1dGUobG9jYXRpb24pKTtcbiAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5yZWFkT25seSA9IHJlYWRPbmx5O1xuICB9XG5cbiAgZ2V0Q2FjaGVGaWxlbmFtZSh1cmw6IFVSTCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGpvaW4odGhpcy5sb2NhdGlvbiwgdXJsVG9GaWxlbmFtZSh1cmwpKTtcbiAgfVxuXG4gIGFzeW5jIGdldChcbiAgICB1cmw6IFVSTCxcbiAgKTogUHJvbWlzZTxbRGVuby5Gc0ZpbGUsIFJlY29yZDxzdHJpbmcsIHN0cmluZz5dIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgY2FjaGVGaWxlbmFtZSA9IGpvaW4odGhpcy5sb2NhdGlvbiwgdXJsVG9GaWxlbmFtZSh1cmwpKTtcbiAgICBjb25zdCBtZXRhZGF0YUZpbGVuYW1lID0gTWV0YWRhdGEuZmlsZW5hbWUoY2FjaGVGaWxlbmFtZSk7XG4gICAgaWYgKCEoYXdhaXQgaXNGaWxlKGNhY2hlRmlsZW5hbWUpKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgZmlsZSA9IGF3YWl0IERlbm8ub3BlbihjYWNoZUZpbGVuYW1lLCB7IHJlYWQ6IHRydWUgfSk7XG4gICAgY29uc3QgbWV0YWRhdGFTdHIgPSBhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShtZXRhZGF0YUZpbGVuYW1lKTtcbiAgICBjb25zdCBtZXRhZGF0YTogeyBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IH0gPSBKU09OLnBhcnNlKFxuICAgICAgbWV0YWRhdGFTdHIsXG4gICAgKTtcbiAgICBhc3NlcnQobWV0YWRhdGEuaGVhZGVycyk7XG4gICAgcmV0dXJuIFtmaWxlLCBtZXRhZGF0YS5oZWFkZXJzXTtcbiAgfVxuXG4gIGFzeW5jIHNldChcbiAgICB1cmw6IFVSTCxcbiAgICBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMucmVhZE9ubHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5yZWFkT25seSA9XG4gICAgICAgIChhd2FpdCBEZW5vLnBlcm1pc3Npb25zLnF1ZXJ5KHsgbmFtZTogXCJ3cml0ZVwiIH0pKS5zdGF0ZSA9PT0gXCJkZW5pZWRcIlxuICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgIDogZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlYWRPbmx5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlRmlsZW5hbWUgPSBqb2luKHRoaXMubG9jYXRpb24sIHVybFRvRmlsZW5hbWUodXJsKSk7XG4gICAgY29uc3QgcGFyZW50RmlsZW5hbWUgPSBkaXJuYW1lKGNhY2hlRmlsZW5hbWUpO1xuICAgIGF3YWl0IGVuc3VyZURpcihwYXJlbnRGaWxlbmFtZSk7XG4gICAgYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKGNhY2hlRmlsZW5hbWUsIGNvbnRlbnQsIHsgbW9kZTogQ0FDSEVfUEVSTSB9KTtcbiAgICBjb25zdCBtZXRhZGF0YSA9IG5ldyBNZXRhZGF0YShoZWFkZXJzLCB1cmwpO1xuICAgIGF3YWl0IG1ldGFkYXRhLndyaXRlKGNhY2hlRmlsZW5hbWUpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksUUFBUSxZQUFZO0FBQzFFLFNBQVMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsYUFBYSxRQUFRLFlBQVk7QUFFdEUsTUFBTTtJQUNKLFFBQWdDO0lBQ2hDLElBQVM7SUFFVCxZQUFZLE9BQStCLEVBQUUsR0FBUSxDQUFFO1FBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUc7UUFDZixJQUFJLENBQUMsR0FBRyxHQUFHO0lBQ2I7SUFFQSxNQUFNLE1BQU0sYUFBcUIsRUFBaUI7UUFDaEQsTUFBTSxtQkFBbUIsU0FBUyxRQUFRLENBQUM7UUFDM0MsTUFBTSxPQUFPLEtBQUssU0FBUyxDQUN6QjtZQUNFLFNBQVMsSUFBSSxDQUFDLE9BQU87WUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRztRQUNmLEdBQ0EsV0FDQTtRQUVGLE1BQU0sS0FBSyxhQUFhLENBQUMsa0JBQWtCLE1BQU07WUFBRSxNQUFNO1FBQVc7SUFDdEU7SUFFQSxPQUFPLFNBQVMsYUFBcUIsRUFBVTtRQUM3QyxNQUFNLGFBQWEsUUFBUTtRQUMzQixJQUFJLFlBQVk7WUFDZCxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sY0FBYyxPQUFPLENBQUMsSUFBSTtRQUNuQyxPQUFPO1lBQ0wsT0FBTyxDQUFDLEVBQUUsY0FBYyxjQUFjLENBQUM7UUFDekMsQ0FBQztJQUNIO0FBQ0Y7QUFFQSxPQUFPLE1BQU07SUFDWCxTQUFpQjtJQUNqQixTQUFtQjtJQUVuQixZQUFZLFFBQWdCLEVBQUUsUUFBa0IsQ0FBRTtRQUNoRCxPQUFPLFdBQVc7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHO0lBQ2xCO0lBRUEsaUJBQWlCLEdBQVEsRUFBVTtRQUNqQyxPQUFPLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxjQUFjO0lBQzNDO0lBRUEsTUFBTSxJQUNKLEdBQVEsRUFDb0Q7UUFDNUQsTUFBTSxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWM7UUFDeEQsTUFBTSxtQkFBbUIsU0FBUyxRQUFRLENBQUM7UUFDM0MsSUFBSSxDQUFFLE1BQU0sT0FBTyxnQkFBaUI7WUFDbEMsT0FBTztRQUNULENBQUM7UUFDRCxNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQyxlQUFlO1lBQUUsTUFBTSxJQUFJO1FBQUM7UUFDekQsTUFBTSxjQUFjLE1BQU0sS0FBSyxZQUFZLENBQUM7UUFDNUMsTUFBTSxXQUFnRCxLQUFLLEtBQUssQ0FDOUQ7UUFFRixPQUFPLFNBQVMsT0FBTztRQUN2QixPQUFPO1lBQUM7WUFBTSxTQUFTLE9BQU87U0FBQztJQUNqQztJQUVBLE1BQU0sSUFDSixHQUFRLEVBQ1IsT0FBK0IsRUFDL0IsT0FBZSxFQUNBO1FBQ2YsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFdBQVc7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FDWCxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUFFLE1BQU07WUFBUSxFQUFFLEVBQUUsS0FBSyxLQUFLLFdBQ3hELElBQUksR0FDSixLQUFLO1FBQ2IsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQjtRQUNGLENBQUM7UUFDRCxNQUFNLGdCQUFnQixLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsY0FBYztRQUN4RCxNQUFNLGlCQUFpQixRQUFRO1FBQy9CLE1BQU0sVUFBVTtRQUNoQixNQUFNLEtBQUssYUFBYSxDQUFDLGVBQWUsU0FBUztZQUFFLE1BQU07UUFBVztRQUNwRSxNQUFNLFdBQVcsSUFBSSxTQUFTLFNBQVM7UUFDdkMsTUFBTSxTQUFTLEtBQUssQ0FBQztJQUN2QjtBQUNGLENBQUMifQ==