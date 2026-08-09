import { describe, expect, it } from "vitest";
import handler from "../api/hello-world/hello-world.js";
import { createResponse } from "./helpers.js";

const request = (apiKey) => ({ headers: apiKey === undefined ? {} : { "x-api-key": apiKey } });

describe("GET /api/hello-world/hello-world", () => {
  it("returns Hello World with a valid key", () => {
    const res = createResponse();
    handler(request("fixed-secret-key"), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Hello World" });
  });

  it.each([undefined, "wrong-key"])("rejects key %s", (apiKey) => {
    const res = createResponse();
    handler(request(apiKey), res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});
