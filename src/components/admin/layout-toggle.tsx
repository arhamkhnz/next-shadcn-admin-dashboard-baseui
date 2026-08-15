"use client";

import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RecordLayout } from "./persistent-layout";

export function LayoutToggle({ value, onChange }: { value: RecordLayout; onChange: (value: RecordLayout) => void }) {
  return (
    <fieldset className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      <legend className="sr-only">Record layout</legend>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="List view"
        aria-pressed={value === "list"}
        className={cn("h-7 rounded-md px-2.5", value === "list" && "bg-background shadow-xs hover:bg-background")}
        onClick={() => onChange("list")}
      >
        <List />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        className={cn("h-7 rounded-md px-2.5", value === "grid" && "bg-background shadow-xs hover:bg-background")}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid />
        <span className="hidden sm:inline">Grid</span>
      </Button>
    </fieldset>
  );
}
