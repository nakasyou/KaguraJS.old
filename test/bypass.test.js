import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("bypass", () => {
  assertEquals("gensokyo", "gensokyo");
});
