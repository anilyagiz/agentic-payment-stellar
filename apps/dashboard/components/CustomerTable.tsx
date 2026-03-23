import { CustomerStatus } from "@prisma/client";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  plan: string;
  status: CustomerStatus;
  source: string;
  monthlyVolumeUsd: string;
  walletPublicKey: string | null;
  updatedAt: Date;
};

function formatStatus(status: CustomerStatus) {
  return status.replace(/_/g, " ");
}

export function CustomerTable({ rows }: { rows: CustomerRow[] }) {
  return (
    <div className="table-shell">
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Volume</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <div>
                  <div>{row.name}</div>
                  <div className="footer-note">{row.company ?? "No company"}</div>
                </div>
              </td>
              <td>{row.email}</td>
              <td>{row.plan}</td>
              <td>
                <span className={`status status--${row.status}`}>{formatStatus(row.status)}</span>
              </td>
              <td>{row.monthlyVolumeUsd}</td>
              <td>
                <div>
                  <div>{row.source}</div>
                  <div className="footer-note">{row.walletPublicKey ? `${row.walletPublicKey.slice(0, 10)}…` : "No wallet yet"}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
