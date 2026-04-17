import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useData } from "../utils/DataContext";
import {
  evaluateStrategy,
  findParetoOptimalStrategies,
  simulateDisruption,
} from "../utils/simulationEngine";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

export function ResilienceStrategies() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading supply chain data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  const [selectedStrategy, setSelectedStrategy] = useState(data.strategies[0].id);
  const [selectedBudget, setSelectedBudget] = useState(data.budgetConstraints.totalBudget);

  const strategy = data.strategies.find((s) => s.id === selectedStrategy);

  // Calculate average disruption impact
  const disruptions = data.disruptions;
  const impacts = disruptions.map((d) =>
    simulateDisruption(d, data.nodes, data.edges)
  );
  const avgImpact = {
    recoveryTime:
      impacts.reduce((sum, i) => sum + i.recoveryTime, 0) / impacts.length,
    financialImpact:
      impacts.reduce((sum, i) => sum + i.financialImpact, 0) / impacts.length,
    operationalImpact:
      impacts.reduce((sum, i) => sum + i.operationalImpact, 0) / impacts.length,
    serviceLevelDegradation:
      impacts.reduce((sum, i) => sum + i.serviceLevelDegradation, 0) / impacts.length,
  };

  // Get Pareto optimal strategies
  const paretoStrategies = findParetoOptimalStrategies(
    data.strategies,
    data.disruptions,
    data.nodes,
    data.edges,
    selectedBudget
  );

  const strategyComparison = data.strategies.map((s) => {
    const avgImpactForEval = {
      recoveryTime: avgImpact.recoveryTime,
      financialImpact: avgImpact.financialImpact,
      operationalImpact: avgImpact.operationalImpact,
      serviceLevelDegradation: avgImpact.serviceLevelDegradation,
      disruptionId: "avg",
      disruptionName: "Average",
      affectedProducts: 0,
      cascadeEffects: [],
    };
    const eval_result = evaluateStrategy(s, avgImpactForEval, selectedBudget);
    return {
      name: s.name.substring(0, 20),
      cost: s.cost,
      serviceLevelGain: s.serviceLevelImprovement,
      roi: eval_result.roi,
      recoveryReduction: s.recoveryTimeReduction,
      isFeasible: eval_result.feasible,
    };
  });

  return (
    <div className="space-y-6">
      {/* Budget Control */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="budget" className="text-sm font-medium">
                  Available Budget
                </label>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    ${(selectedBudget / 1000000).toFixed(1)}M / ${(data.budgetConstraints.totalBudget / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-gray-600">
                    ${selectedBudget.toLocaleString()} | {((selectedBudget / data.budgetConstraints.totalBudget) * 100).toFixed(0)}% allocated
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  id="budget"
                  type="range"
                  min="0"
                  max={data.budgetConstraints.totalBudget}
                  step="500000"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>${(data.budgetConstraints.totalBudget / 2000000).toFixed(1)}M</span>
                  <span>${(data.budgetConstraints.totalBudget / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Drag to allocate budget for resilience initiatives
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ROI vs Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy ROI vs Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="cost"
                name="Cost ($M)"
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <YAxis type="number" dataKey="roi" name="ROI (%)" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload as any;
                    return (
                      <div className="bg-white border border-gray-300 rounded p-2 text-xs">
                        <p className="font-semibold">{data.name}</p>
                        <p>Cost: ${(data.cost / 1000000).toFixed(1)}M</p>
                        <p>ROI: {data.roi.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Strategies"
                data={strategyComparison}
                fill="#3b82f6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strategy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Cost vs Service Level Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" label={{ value: "Cost ($M)", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Service Level Gain (%)", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" fill="#f59e0b" name="Cost ($)" />
              <Bar yAxisId="right" dataKey="serviceLevelGain" fill="#10b981" name="Service Level Gain (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pareto Optimal Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Strategies (Pareto Optimal)</CardTitle>
        </CardHeader>
        <CardContent>
          {paretoStrategies.length > 0 ? (
            <div className="space-y-2">
              {paretoStrategies.map((s) => (
                <div key={s.id} className="p-3 bg-green-50 border border-green-200 rounded flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-green-900">{s.name}</p>
                    <p className="text-xs text-green-700">{s.type}</p>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              No feasible strategies within the current budget. Increase budget allocation to see recommendations.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Strategy Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Explore Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.strategies.map((s) => (
              <Button
                key={s.id}
                variant={selectedStrategy === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy(s.id)}
              >
                {s.name.substring(0, 15)}...
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Details */}
      {strategy && (
        <Card>
          <CardHeader>
            <CardTitle>{strategy.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Type</p>
                <p className="font-semibold capitalize">{strategy.type.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Investment Cost</p>
                <p className="font-semibold">${(strategy.cost / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Service Level Improvement</p>
                <p className="font-semibold text-green-600">+{strategy.serviceLevelImprovement}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Recovery Time Reduction</p>
                <p className="font-semibold text-blue-600">-{strategy.recoveryTimeReduction} days</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Implementation Details</p>
              <p className="text-sm text-gray-700">{strategy.implementation}</p>
            </div>

            {selectedBudget >= strategy.cost && (
              <div className="pt-4 border-t border-gray-200 bg-green-50 p-3 rounded flex justify-between items-center">
                <span className="text-sm font-medium text-green-900">✓ Within Budget</span>
                <Button variant="default" size="sm">
                  Add to Plan
                </Button>
              </div>
            )}

            {selectedBudget < strategy.cost && (
              <div className="pt-4 border-t border-gray-200 bg-red-50 p-3 rounded">
                <span className="text-sm font-medium text-red-900">
                  ✗ Exceeds Budget by ${((strategy.cost - selectedBudget) / 1000000).toFixed(1)}M
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
