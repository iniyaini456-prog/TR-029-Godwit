import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { NetworkView } from "./pages/NetworkView";
import { DisruptionLibrary } from "./pages/DisruptionLibrary";
import { ImpactAnalysis } from "./pages/ImpactAnalysis";
import { ResilienceStrategies } from "./pages/ResilienceStrategies";
import { WarGame } from "./pages/WarGame";
import { ERPIntegration } from "./pages/ERPIntegration";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "network", Component: NetworkView },
      { path: "disruptions", Component: DisruptionLibrary },
      { path: "impact", Component: ImpactAnalysis },
      { path: "strategies", Component: ResilienceStrategies },
      { path: "wargame", Component: WarGame },
      { path: "erp", Component: ERPIntegration },
    ],
  },
]);
