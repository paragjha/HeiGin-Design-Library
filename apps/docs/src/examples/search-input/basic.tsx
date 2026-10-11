import { useState } from "react";
import { SearchInput } from "@heigin/ui";

const contacts = ["Asha Rao", "Vikram Iyer", "Neha Kapoor", "Rohan Mehta", "Priya Nair"];

export default function SearchInputBasic() {
  const [query, setQuery] = useState("");
  const results = contacts.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ maxWidth: 320 }}>
      <SearchInput aria-label="Search contacts" placeholder="Search contacts" value={query} onValueChange={setQuery} />
      <p role="status" style={{ fontSize: 12, color: "var(--hg-color-muted)" }}>
        {results.length} of {contacts.length} contacts
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
        {results.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
