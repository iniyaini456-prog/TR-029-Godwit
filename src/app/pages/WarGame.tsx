import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useData } from "../utils/DataContext";
import {
  simulateDisruption,
  evaluateStrategy,
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
} from "recharts";

export function WarGame() {
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

  const [selectedDisruption, setSelectedDisruption] = useState(
    data.disruptions[0].id
  );
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  const disruption = data.disruptions.find((d) => d.id === selectedDisruption);
  const baselineImpact = disruption
    ? simulateDisruption(disruption, data.nodes, data.edges)
    : null;

  // Calculate impact with strategies
  const scenarioResults = selectedStrategies.length > 0 && disruption && baselineImpact
    ? selectedStrategies.map((stratId) => {
        const strategy = data.strategies.find((s) => s.id === stratId);
        if (!strategy) return null;
        const eval_result = evaluateStrategy(strategy, baselineImpact, 1000000000);
        return {
          strategyName: strategy.name,
          recoveryTime: eval_result.newRecoveryTime,
          financialImpact: eval_result.newFinancialImpact,
          serviceLevelGain: strategy.serviceLevelImprovement,
        };
      })
    : [];

  const comparisonData = [
    {
      scenario: "Baseline (No Strategy)",
      recoveryTime: baselineImpact?.recoveryTime || 0,
      financialImpact: (baselineImpact?.financialImpact || 0) / 1000000,
    },
    ...scenarioResults.filter(Boolean).map((r: any) => ({
      scenario: r.strategyName.substring(0, 20),
      recoveryTime: r.recoveryTime,
      financialImpact: r.financialImpact / 1000000,
    })),
  ];

  const toggleStrategy = (stratId: string) => {
    setSelectedStrategies((prev) =>
      prev.includes(stratId)
        ? prev.filter((id) => id !== stratId)
        : [...prev, stratId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle>War Game Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Select a disruption scenario to test:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.disruptions.map((d) => (
              <Button
                key={d.id}
                variant={selectedDisruption === d.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDisruption(d.id)}
              >
                {d.name.substring(0, 12)}...
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {disruption && baselineImpact && (
        <>
          {/* Baseline Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Baseline Impact: {disruption.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-xl font-bold">{disruption.duration}</p>
                  <p className="text-xs text-gray-600">days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Recovery Time</p>
                  <p className="text-xl font-bold text-red-600">{baselineImpact.recoveryTime}</p>
                  <p className="text-xs text-gray-600">days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Financial Impact</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${(baselineImpact.financialImpact / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Operational Impact</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {baselineImpact.operationalImpact}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Test Resilience Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select strategies to test against this disruption:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.strategies.map((strategy) => (
                  <Button
                    key={strategy.id}
                    variant={selectedStrategies.includes(strategy.id) ? "default" : "outline"}
                    className="justify-start h-auto py-2 px-3 text-left"
                    onClick={() => toggleStrategy(strategy.id)}
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-semibold">{strategy.name}</span>
                      <span className="text-xs opacity-75">
                        ${(strategy.cost / 1000000).toFixed(1)}M • +{strategy.serviceLevelImprovement}%
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Charts */}
          {selectedStrategies.length > 0 && (
            <>
              {/* Recovery Time Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Recovery Time Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Bar dataKey="recoveryTime" fill="#ef4444" name="Recovery Time (days)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Financial Impact Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Impact Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: "Impact ($M)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(v) => `$${(v as number).toFixed(1)}M`} />
                      <Bar dataKey="financialImpact" fill="#f59e0b" name="Financial Impact ($M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Strategy Results</h3>
                <div className="space-y-3">
                  {scenarioResults.filter(Boolean).map((result: any, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {result.strategyName}
                              </h4>
                            </div>
                            <Badge variant="secondary">
                              {Math.round(
                                ((baselineImpact.financialImpact - result.financialImpact) /
                                  baselineImpact.financialImpact) *
                                  100
                              )}
                              % Savings
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 text-xs">Recovery Time</p>
                              <p className="font-semibold text-green-600">
                                {result.recoveryTime} days
                              </p>
                              <p className="text-xs text-gray-500">
                                -{baselineImpact.recoveryTime - result.recoveryTime} days
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Financial Impact</p>
                              <p className="font-semibold">
                                ${result.financialImpact.toFixed(1)}M
                              </p>
                              <p className="text-xs text-gray-500">
                                -${(
                                  (baselineImpact.financialImpact - result.financialImpact) /
                                  1000000
                                ).toFixed(1)}
                                M
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Service Level Gain</p>
                              <p className="font-semibold text-blue-600">
                                +{result.serviceLevelGain}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedStrategies.length === 0 && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <p className="text-blue-900">
                  Select one or more strategies above to see how they would mitigate this disruption.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
