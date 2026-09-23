"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RightsLookup() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/registry?q=${encodeURIComponent(q)}` : "/registry");
  }

  return (
    <form className="search-line" onSubmit={submit}>
      <input aria-label="Search registered rights" placeholder="Search title, holder, licence key…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button className="text-action" type="submit">Search →</button>
    </form>
  );
}
