import { getProps } from "../lib/source";

/** Props generated from TypeScript at build time (react-docgen-typescript). */
export function PropsTable({ component }: { component: string }) {
  const doc = getProps(component);
  if (!doc) return null;
  return (
    <div className="props">
      <h3 className="h4">
        <code>{component}</code> props
      </h3>
      {doc.props.length === 0 ? (
        <p className="muted small">No HeiGin-specific props.</p>
      ) : (
        <div className="table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((p) => (
                <tr key={p.name}>
                  <td>
                    <code>{p.name}</code>
                    {p.required && <span className="required" title="Required"> *</span>}
                  </td>
                  <td>
                    <code className="type">{p.type}</code>
                  </td>
                  <td>{p.defaultValue !== null ? <code>{p.defaultValue}</code> : <span className="muted">—</span>}</td>
                  <td>{p.description || <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {doc.extends.length > 0 && (
        <p className="muted small">Also accepts the native/primitive props of: {doc.extends.join(", ")}.</p>
      )}
    </div>
  );
}
