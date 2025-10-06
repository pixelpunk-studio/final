import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Save } from "lucide-react";
import FeaturesEditor from "./editors/FeaturesEditor";
import ServicesEditor from "./editors/ServicesEditor";
import PortfolioEditor from "./editors/PortfolioEditor";
import PricingEditor from "./editors/PricingEditor";
import ReviewsEditor from "./editors/ReviewsEditor";
import ContactsViewer from "./editors/ContactsViewer";
import FooterEditor from "./editors/FooterEditor";
import ActivityLogs from "./ActivityLogs";

export default function AdminPanel() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("features");
  const [saveMessage, setSaveMessage] = useState("");

  const tabs = [
    { id: "features", label: "Features" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Our Work" },
    { id: "pricing", label: "Pricing" },
    { id: "reviews", label: "Reviews" },
    { id: "contacts", label: "Contacts" },
    { id: "footer", label: "Footer" },
    { id: "logs", label: "Activity Logs" },
  ];

  const handleSave = () => {
    setSaveMessage("Changes are auto-saved");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <div className="flex items-center gap-4">
            {saveMessage && (
              <span className="text-sm text-gray-600">{saveMessage}</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
              aria-label="Save changes"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? "text-black border-b-2 border-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "features" && <FeaturesEditor />}
        {activeTab === "services" && <ServicesEditor />}
        {activeTab === "portfolio" && <PortfolioEditor />}
        {activeTab === "pricing" && <PricingEditor />}
        {activeTab === "reviews" && <ReviewsEditor />}
        {activeTab === "contacts" && <ContactsViewer />}
        {activeTab === "footer" && <FooterEditor />}
        {activeTab === "logs" && <ActivityLogs />}
      </main>
    </div>
  );
}
