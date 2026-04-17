import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useData } from "../utils/DataContext";
import {
  calculateNetworkMetrics,
  runMonteCarlo,
} from "../utils/simulationEngine";

export function Dashboard() {
  console.log("🎯 Dashboard component rendered");
  const { data, loading, error } = useData();
  console.log("📊 Dashboard data state:", { data, loading, error });

  if (loading) {
    console.log("⏳ Dashboard showing loading state");
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading supply chain data...</div>
      </div>
    );
  }

  if (error || !data) {
    console.log("❌ Dashboard showing error state:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <div className="text-lg font-semibold mb-2">Error loading data</div>
          <div className="text-sm">{error || 'Unknown error'}</div>
          <div className="text-xs mt-2 text-gray-500">
            Check console for details. The app should still work with demo data.
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ Dashboard rendering with data:", data);

  const metrics = calculateNetworkMetrics(data.nodes, data.edges);
  const monteCarloResults = runMonteCarlo(
    data.disruptions,
    data.nodes,
    data.edges,
    500
  );

  // Top disruptions by impact
  const topDisruptions = [...data.disruptions]
    .sort((a, b) => b.impactScore * b.probability - a.impactScore * a.probability)
    .slice(0, 5);

  // Disruption type distribution
  const typeDistribution = data.disruptions.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
  }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];

  // Financial impact over time simulation
  const impactTimeline = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    baseline: 5000000 + Math.random() * 2000000,
    worstCase: 15000000 + Math.random() * 5000000,
    average: monteCarloResults.expectedFinancialImpact * (0.7 + Math.random() * 0.6),
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ink-dim)]">Network Health</span>
                <Activity className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink)]">
                {Math.round(metrics.networkReliability * 100)}%
              </p>
              <p className="text-xs text-[var(--ink-dim)]">Reliability Score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ink-dim)]">Avg Lead Time</span>
                <Clock className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics.avgLeadTime}d</p>
              <p className="text-xs text-[var(--ink-dim)]">Days to deliver</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ink-dim)]">
                  Expected Financial Impact
                </span>
                <DollarSign className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink)]">
                ${(monteCarloResults.expectedFinancialImpact / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-[var(--ink-dim)]">Monte Carlo (500 iterations)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ink-dim)]">Network Nodes</span>
                <Target className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics.totalNodes}</p>
              <p className="text-xs text-[var(--ink-dim)]">{metrics.totalEdges} connections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Impact Forecast */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Impact Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impactTimeline} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" dot={false} />
                <Line type="monotone" dataKey="worstCase" stroke="#ef4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disruption Types */}
        <Card>
          <CardHeader>
            <CardTitle>Disruption Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Disruptions & Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Disruptions by Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600" />
              Top Disruptions by Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDisruptions.map((d) => (
                <div key={d.id} className="flex justify-between items-start p-2 bg-[var(--card-bg)] rounded">
                  <div>
                    <p className="font-medium text-sm text-[var(--ink)]">{d.name}</p>
                    <p className="text-xs text-[var(--ink-dim)]">{d.type.replace(/_/g, " ")}</p>
                  </div>
                  <Badge variant="destructive">
                    {Math.round(d.impactScore * d.probability)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Service Level */}
        <Card>
          <CardHeader>
            <CardTitle>Service Level & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[var(--ink)]">Current Service Level</span>
                <span className="text-sm font-bold text-[var(--ink)]">{data.budgetConstraints.currentServiceLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${data.budgetConstraints.currentServiceLevel}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[var(--ink)]">Target Service Level</span>
                <span className="text-sm font-bold text-[var(--ink)]">{data.budgetConstraints.serviceLevelTarget}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${data.budgetConstraints.serviceLevelTarget}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--ink-dim)]">Budget Information</p>
              <p className="text-lg font-bold text-[var(--ink)]">
                ${(data.budgetConstraints.totalBudget / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-[var(--ink-dim)]">Total resilience budget available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution (Monte Carlo Analysis)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monteCarloResults.riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probability" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
