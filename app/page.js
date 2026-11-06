// app/page.js
import Header from "./components/Header";
import DashboardContent from "./components/DashboardContent";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9]">
      <Header />
      <DashboardContent />
      <Footer />
    </div>
  );
}
