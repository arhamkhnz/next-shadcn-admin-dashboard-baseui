import { Suspense } from "react";

import { initialBoard } from "./_components/data";
import { Kanban } from "./_components/kanban";

export default function Page() {
  return (
    <div data-content-padding="false">
      <Suspense fallback={null}>
        <Kanban initialBoard={initialBoard} />
      </Suspense>
    </div>
  );
}
