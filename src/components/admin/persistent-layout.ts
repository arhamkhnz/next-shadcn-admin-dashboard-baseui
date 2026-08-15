"use client";

import { useEffect, useState } from "react";

export type RecordLayout = "list" | "grid";

const STORAGE_PREFIX = "liftngo:record-layout:";

function currentTabKey() {
  return `${STORAGE_PREFIX}${window.location.pathname.replace(/\/$/, "") || "/"}`;
}

export function usePersistentLayout(): [RecordLayout, (layout: RecordLayout) => void] {
  const [layout, setLayoutState] = useState<RecordLayout>("list");

  useEffect(() => {
    const saved = window.localStorage.getItem(currentTabKey());
    if (saved === "list" || saved === "grid") setLayoutState(saved);
  }, []);

  function setLayout(next: RecordLayout) {
    setLayoutState(next);
    window.localStorage.setItem(currentTabKey(), next);
  }

  return [layout, setLayout];
}
