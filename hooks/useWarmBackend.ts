// hooks/useWarmBackend.ts
//
// Call this at the top of any auth page (signup, login) so the wake-up
// ping fires the moment the user lands on the page — this is the single
// biggest lever, since it gives the server the most possible head start
// before they finish typing and hit submit.

import { useEffect } from "react";
import { warmBackend } from "@/lib/warmBackend";

export function useWarmBackend() {
  useEffect(() => {
    warmBackend();
  }, []);
}
