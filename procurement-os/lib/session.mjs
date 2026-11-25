import { cookies } from "next/headers";
import { loadStore, getUser, defaultUser } from "./data/store.mjs";

export const ACTOR_COOKIE = "wpos_actor";

/** Resolve the acting user from the session cookie, defaulting to the MD. */
export async function currentActor() {
  const store = loadStore();
  const jar = await cookies();
  const id = jar.get(ACTOR_COOKIE)?.value;
  const actor = id ? getUser(store, id) : defaultUser(store);
  return { store, actor };
}
