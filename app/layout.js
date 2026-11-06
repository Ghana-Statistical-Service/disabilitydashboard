// app/layout.js
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "Disability Data Dashboard | Ghana Statistical Service",
  description:
    "Disability statistics for Ghana from the 2021 Population and Housing Census, measured with the Washington Group Short Set.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
