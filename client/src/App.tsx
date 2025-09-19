import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Weather from "@/pages/weather";
import Crops from "@/pages/crops";
import Market from "@/pages/market";
import DiseaseDetection from "@/pages/disease-detection";
import SoilHealth from "@/pages/soil-health";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ChatBot } from "@/components/chat-bot";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 md:pb-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/weather" component={Weather} />
          <Route path="/crops" component={Crops} />
          <Route path="/market" component={Market} />
          <Route path="/disease-detection" component={DiseaseDetection} />
          <Route path="/soil-health" component={SoilHealth} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
