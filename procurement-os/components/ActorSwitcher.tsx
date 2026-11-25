"use client";

import { usePathname } from "next/navigation";
import { setActor } from "@/app/actions";

export function ActorSwitcher({ users, currentId }: { users: { id: string; name: string; role: string }[]; currentId: string }) {
  const pathname = usePathname();
  return (
    <form action={setActor} className="flex items-center gap-2">
      <input type="hidden" name="returnTo" value={pathname} />
      <label htmlFor="actorId" className="label whitespace-nowrap">
        Acting as
      </label>
      <select id="actorId" name="actorId" defaultValue={currentId} className="input max-w-[190px] py-1">
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn">
        Switch
      </button>
    </form>
  );
}
