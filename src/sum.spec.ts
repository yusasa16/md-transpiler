import { describe, expect, it } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
	it("should return the sum of two numbers", () => {
		expect(sum(1, 2)).toBe(3);
	});
});
