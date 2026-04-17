import { ReactNode } from "react";

export default function MobileShell({ children, bg = "#EBEBEB" }: { children: ReactNode; bg?: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#C8C8C8", display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "100%", maxWidth: 430, minHeight: "100vh",
        background: bg, position: "relative",
        overflowX: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.2)",
      }}>
        {children}
      </div>
    </div>
  );
}
