import "./globals.css";

export const metadata = {
  title: "StellarAgent",
  description: "Autonomous payments for autonomous agents on Stellar"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
