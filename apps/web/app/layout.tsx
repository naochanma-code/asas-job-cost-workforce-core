import "./style.css";
export const metadata = { title: "ASAS · โครงการและทีม" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
