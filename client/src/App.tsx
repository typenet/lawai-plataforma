import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import NewDocument from "@/pages/new-document";
import Documents from "@/pages/documents";
import HistoryPage from "@/pages/history";
import SimplifiedFloatingButton from "@/components/ai-assistant/simplified-floating-button";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/novo-documento" component={NewDocument} />
      <Route path="/documentos" component={Documents} />
      <Route path="/historico" component={HistoryPage} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <SimplifiedFloatingButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
