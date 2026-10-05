import { describe, expect, it } from "vitest";
import { calculateDeliveryFee, calculateOrderTotal, formatPrice } from "../shared/quickbite";

describe("QuickBite order totals", () => {
  it("adds standard delivery fee below the free-shipping threshold", () => {
    expect(calculateDeliveryFee(120000)).toBe(18000);
    expect(calculateOrderTotal(120000)).toBe(138000);
  });

  it("removes delivery fee for orders above the threshold", () => {
    expect(calculateDeliveryFee(180001)).toBe(0);
    expect(calculateOrderTotal(180001)).toBe(180001);
  });

  it("formats Vietnamese currency consistently", () => {
    expect(formatPrice(79000)).toBe("79.000đ");
  });
});
