import { MoneyValue, formatINR, formatINRCompact } from "@heigin/ui";

export default function MoneyFormats() {
  return (
    <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: "left", paddingRight: 24 }}>Amount</th>
          <th scope="col" style={{ textAlign: "right", paddingRight: 24 }}>Full</th>
          <th scope="col" style={{ textAlign: "right" }}>Compact</th>
        </tr>
      </thead>
      <tbody>
        {[950, 64000, 849600, 23100000].map((amount) => (
          <tr key={amount}>
            <td style={{ paddingRight: 24, color: "var(--hg-color-muted)" }}>{amount}</td>
            <td style={{ textAlign: "right", paddingRight: 24 }}>
              <MoneyValue amount={amount} />
            </td>
            <td style={{ textAlign: "right" }}>
              <MoneyValue amount={amount} format="compact" />
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={3} style={{ paddingTop: 8, color: "var(--hg-color-muted)" }}>
            Plain strings: {formatINR(1234.5, true)} · {formatINRCompact(1500000)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
