import assert from "node:assert/strict";
import { parseRequest } from "./order_handoff.js";

const parsed = parseRequest({ orderId: "o1", sellerId: "s1", buyerId: "b1", audioText: "Ship it today" });
assert.equal(parsed.orderId, "o1");
assert.throws(() => parseRequest({ orderId: "", sellerId: "s1", buyerId: "b1", audioText: "Ship it" }));
console.log("request boundary checks passed");
