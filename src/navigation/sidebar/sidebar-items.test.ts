import { describe, expect, it } from "vitest";

import { sidebarItems } from "./sidebar-items";

describe("LiftNGo admin navigation", () => {
  it("contains only operational destinations with unique routes", () => {
    const links = sidebarItems
      .flatMap((group) => group.items)
      .flatMap((item) => ("url" in item ? [{ title: item.title, url: item.url }] : item.subItems));
    expect(new Set(links.map((link) => link.url)).size).toBe(links.length);
    expect(links.map((link) => link.title)).toEqual(
      expect.arrayContaining([
        "Live driver map",
        "Customer trips",
        "Delivery orders",
        "Verification",
        "Audit log",
        "API keys",
      ]),
    );
    expect(links.some((link) => /github|brutalist|e-commerce|academy/i.test(link.title))).toBe(false);
  });
});
