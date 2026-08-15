import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";

import { DocumentFileActions } from "./document-file-actions";

describe("DocumentFileActions", () => {
  afterEach(() => {
    cleanup();
    toast.close();
    vi.restoreAllMocks();
  });

  it("requests a short-lived document URL before previewing a document", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ url: "https://signed.example/document.jpg" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<DocumentFileActions document={{ id: "document-1", type: "DRIVING_LICENSE" }} />);

    await user.click(screen.getByRole("button", { name: /preview driving_license/i }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("/api/backend/drivers/verification/documents/document-1/url", {
        cache: "no-store",
      }),
    );
    expect(open).toHaveBeenCalledWith("https://signed.example/document.jpg", "_blank", "noopener,noreferrer");
  });
});
