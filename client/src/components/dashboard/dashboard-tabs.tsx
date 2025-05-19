import { useState } from "react";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentList } from "@/components/documents/document-list";
import { SubscriptionPlans } from "@/components/plans/subscription-plans";

type TabId = "search" | "documents" | "plans";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("search");

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      <div className="border-b border-neutral-light mt-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabClick("search")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "search"
                ? "border-navy text-navy hover:text-navy-light"
                : "border-transparent text-neutral-medium hover:text-navy-light hover:border-navy-light"
            }`}
          >
            Pesquisa Jurídica
          </button>
          <button
            onClick={() => handleTabClick("documents")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-navy text-navy hover:text-navy-light"
                : "border-transparent text-neutral-medium hover:text-navy-light hover:border-navy-light"
            }`}
          >
            Análise de Documentos
          </button>
          <button
            onClick={() => handleTabClick("plans")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plans"
                ? "border-navy text-navy hover:text-navy-light"
                : "border-transparent text-neutral-medium hover:text-navy-light hover:border-navy-light"
            }`}
          >
            Planos de Assinatura
          </button>
        </nav>
      </div>

      <div className="py-6">
        {/* Search Tab */}
        <div className={`space-y-6 ${activeTab === "search" ? "" : "hidden"}`}>
          <SearchForm />
          <SearchResults />
        </div>

        {/* Documents Tab */}
        <div className={`space-y-6 ${activeTab === "documents" ? "" : "hidden"}`}>
          <DocumentUpload />
          <DocumentList />
        </div>

        {/* Plans Tab */}
        <div className={`space-y-6 ${activeTab === "plans" ? "" : "hidden"}`}>
          <SubscriptionPlans />
        </div>
      </div>
    </>
  );
}
