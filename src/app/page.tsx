import { Suspense } from "react";
import Chat from "./chat";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-muted flex h-dvh items-center justify-center text-sm">
          Loading QueryMind…
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}
