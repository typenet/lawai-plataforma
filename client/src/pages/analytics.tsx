import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { 
  Search, 
  FileText, 
  Clock, 
  Home, 
  PlusCircle, 
  History,
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Calendar, 
  MessageSquare, 
  Bell,
  FileIcon,
  BarChart,
  TrendingUp,
  Database,
  UserIcon,
  HardDrive
} from "lucide-react";
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("analytics");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/api/login?returnTo=/analytics";
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9F85FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-700">Carregando...</h2>
        </div>
      </div>
    );
  }

  // Componente de link de menu lateral
  const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full py-3 px-4 rounded-md text-left transition-colors ${
        active 
          ? "bg-[#EAE5FF] text-[#9F85FF]" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className={`mr-3 ${active ? "text-[#9F85FF]" : "text-gray-500"}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );

  // Dados para o gráfico de barras
  const chartData = [
    { month: 'Jan', documentCount: 17 },
    { month: 'Fev', documentCount: 18 },
    { month: 'Mar', documentCount: 20 },
    { month: 'Abr', documentCount: 17 },
    { month: 'Mai', documentCount: 25 },
  ];

  // Componente de card de estatística
  const StatCard = ({ 
    icon, 
    title, 
    value, 
    iconColor
  }: { 
    icon: React.ReactNode, 
    title: string, 
    value: string | number, 
    iconColor: string
  }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
      <div className={`mr-4 ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xs text-gray-500 font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // Componente de card de performance
  const PerformanceCard = ({ 
    title, 
    value, 
    subtitle,
    changeValue
  }: { 
    title: string, 
    value: string | number,
    subtitle: string,
    changeValue?: string
  }) => (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <h3 className="text-sm text-gray-600">{title}</h3>
        {changeValue && (
          <span className="text-xs text-green-600">
            {changeValue}
          </span>
        )}
      </div>
      {typeof value === 'number' ? (
        <div className="mb-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#9F85FF] rounded-full" 
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="mb-1">
          <span className="text-lg font-bold">{value}</span>
        </div>
      )}
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm z-10 flex flex-col border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center bg-[#9F85FF] rounded-md p-1.5 mr-2">
            <svg className="h-6 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2z" />
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#9F85FF]">LawAI</span>
          
          <button className="ml-auto text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={activeSection === "dashboard"}
            onClick={() => window.location.href = "/dashboard"}
          />
          <SidebarLink
            icon={<PlusCircle className="h-5 w-5" />}
            label="Novo documento"
            active={activeSection === "newDocument"}
            onClick={() => window.location.href = "/novo-documento"}
          />
          <SidebarLink
            icon={<FileText className="h-5 w-5" />}
            label="Documentos"
            active={activeSection === "documents"}
            onClick={() => window.location.href = "/documentos"}
          />
          <SidebarLink
            icon={<History className="h-5 w-5" />}
            label="Histórico"
            active={activeSection === "history"}
            onClick={() => window.location.href = "/historico"}
          />
          <SidebarLink
            icon={<BarChart className="h-5 w-5" />}
            label="Analytics"
            active={activeSection === "analytics"}
            onClick={() => setActiveSection("analytics")}
          />
          <SidebarLink
            icon={<Users className="h-5 w-5" />}
            label="Clientes"
            active={activeSection === "clients"}
            onClick={() => setActiveSection("clients")}
          />
          <SidebarLink
            icon={<HelpCircle className="h-5 w-5" />}
            label="Ajuda"
            active={activeSection === "help"}
            onClick={() => setActiveSection("help")}
          />
          <SidebarLink
            icon={<Settings className="h-5 w-5" />}
            label="Configurações"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = "/api/logout"}
            className="flex items-center w-full py-2 px-4 rounded-md text-left text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">LawAI Insight</h1>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="Pesquisar documentos..." 
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50"
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#9F85FF] text-white flex items-center justify-center">
                  <span className="font-medium text-sm">MA</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-[#9F85FF]" />
            <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
          </div>

          {/* Document Analysis Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Document Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">Monthly documents analyzed in 2025</p>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 'dataMax + 15']} />
                  <Tooltip />
                  <Bar dataKey="documentCount" fill="#9F85FF" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Usage Statistics</h3>
              <p className="text-sm text-gray-600 mb-4">Key metrics for your account</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                  icon={<FileIcon className="h-5 w-5" />}
                  title="Total Documents"
                  value="186"
                  iconColor="text-[#9F85FF]"
                />
                
                <StatCard 
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="AI Analysis Used"
                  value="124"
                  iconColor="text-[#9F85FF]"
                />
                
                <StatCard 
                  icon={<UserIcon className="h-5 w-5" />}
                  title="Active Clients"
                  value="18"
                  iconColor="text-[#9F85FF]"
                />
                
                <StatCard 
                  icon={<HardDrive className="h-5 w-5" />}
                  title="Storage Used"
                  value="2.4 GB"
                  iconColor="text-[#9F85FF]"
                />
              </div>
            </div>
            
            {/* Monthly Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Monthly Performance</h3>
              <p className="text-sm text-gray-600 mb-4">Statistical overview year-to-date</p>
              
              <PerformanceCard 
                title="Document Processing"
                value={92}
                subtitle="92%"
                changeValue="+5.2% from last month"
              />
              
              <PerformanceCard 
                title="Average Processing Time"
                value="1.8 minutes"
                subtitle="minutes"
              />
              
              <PerformanceCard 
                title="Processing Accuracy"
                value="98.6%"
                subtitle=""
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}