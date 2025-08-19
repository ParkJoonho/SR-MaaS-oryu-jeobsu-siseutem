import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ErrorReport from "@/pages/error-report";
import AdminDashboard from "@/pages/admin-dashboard";
import ErrorSubmit from "@/pages/error-submit";
import ErrorEdit from "@/pages/error-edit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/error-report" component={ErrorReport} />
      <Route path="/error-submit" component={ErrorSubmit} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/error-edit/:errorId">
        {(params) => <ErrorEdit errorId={params.errorId} />}
      </Route>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
