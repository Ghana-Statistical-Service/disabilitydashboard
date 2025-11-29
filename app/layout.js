// app/layout.js
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "Disability Dashboard",
  description: "A quick snapshot overview of Ghana's disability data.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
