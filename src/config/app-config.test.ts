import { describe, expect, it } from "vitest";

import { APP_CONFIG } from "./app-config";

describe("APP_CONFIG", () => {
  it("uses LiftNGo branding without starter repository links", () => {
    expect(APP_CONFIG.name).toBe("LiftNGo Admin");
    expect(JSON.stringify(APP_CONFIG)).not.toMatch(/Studio Admin|github\.com\/arhamkhnz/i);
  });
});
