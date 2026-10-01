import { RequestFailure } from "@/lib/http";
import { isAdmin } from "./auth";
import { requireStore } from "./service";

/** Every admin route: a connected store and a signed-in host. */
export async function requireAdmin() {
  const store = requireStore();
  if (!(await isAdmin(store))) throw new RequestFailure(401, "Sign in again.");
  return store;
}
