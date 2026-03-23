export type AgentEventRow = {
  id: string;
  agentId: string | null;
  kind: string;
  source: string;
  toolName: string;
  status: string;
  summary: string;
  network: string | null;
  txHash: string | null;
  createdAt: Date;
};

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function AgentEventTable({ rows }: { rows: AgentEventRow[] }) {
  return (
    <div className="table-shell">
      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Kind</th>
            <th>Source</th>
            <th>Tool</th>
            <th>Status</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatTime(row.createdAt)}</td>
              <td>{row.kind}</td>
              <td>{row.source}</td>
              <td>{row.toolName}</td>
              <td>{row.status}</td>
              <td>
                <div>
                  <div>{row.summary}</div>
                  <div className="footer-note">
                    {row.network ?? "n/a"}{row.txHash ? ` • ${row.txHash.slice(0, 12)}…` : ""}{row.agentId ? ` • ${row.agentId.slice(0, 8)}…` : ""}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
