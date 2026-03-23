import { TransactionStatus } from "@prisma/client";

export type TransactionRow = {
  txHash: string;
  sourceAccount: string;
  destination: string;
  amount: string;
  fee: string;
  memo: string | null;
  status: TransactionStatus;
  submittedAt: Date;
};

export function TransactionTable({ rows }: { rows: TransactionRow[] }) {
  return (
    <div className="table-shell">
      <table className="table">
        <thead>
          <tr>
            <th>Hash</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.txHash}>
              <td>{row.txHash.slice(0, 12)}…</td>
              <td>{row.sourceAccount.slice(0, 12)}…</td>
              <td>{row.destination.slice(0, 12)}…</td>
              <td>{row.amount}</td>
              <td>{row.fee}</td>
              <td>
                <span className={`status status--${row.status}`}>{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
