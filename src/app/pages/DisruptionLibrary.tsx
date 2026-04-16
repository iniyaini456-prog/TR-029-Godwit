import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { disruptionScenarios, supplyChainNodes, supplyChainEdges } from "../data/mockData";
import { simulateDisruption } from "../utils/simulationEngine";
import mlData from '../data/ml_predictions.json';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

export function DisruptionLibrary() {
  const impacts = disruptionScenarios.map((d) =>
    simulateDisruption(d, supplyChainNodes, supplyChainEdges)
  );

  const riskData = disruptionScenarios.map((d) => {
    // Dynamically shift probability based on the ML Model
    const mlModulatedProb = mlData?.mean_delay_probability ? (d.probability * mlData.mean_delay_probability * 2) : d.probability;
    
    return {
      name: d.name.substring(0, 15),
      probability: mlModulatedProb * 100,
      impact: d.impactScore,
      riskScore: mlModulatedProb * d.impactScore,
      duration: d.duration,
    };
  });

  const typeMap: Record<string, string> = {
    port_closure: "⚓ Port Closure",
    material_shortage: "📦 Material Shortage",
    geopolitical: "🌍 Geopolitical",
    natural_disaster: "⛈️ Natural Disaster",
    pandemic: "🦠 Pandemic",
    cyber_attack: "🔒 Cyber Attack",
  };

  return (
    <div className="space-y-6">
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix: Probability vs Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="probability" name="Probability (%)" />
              <YAxis type="number" dataKey="impact" name="Impact Score" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    return (
                      <div className="bg-white border border-gray-300 rounded p-2 text-xs">
                        <p className="font-semibold">{(payload[0].payload as any).name}</p>
                        <p>Probability: {(payload[0].payload as any).probability.toFixed(1)}%</p>
                        <p>Impact: {(payload[0].payload as any).impact}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Disruptions" data={riskData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disruption List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Disruption Scenarios</h3>
        <div className="space-y-3">
          {disruptionScenarios.map((d, idx) => {
            const impact = impacts[idx];
            return (
              <Card key={d.id}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={20} className="text-red-600" />
                          <h4 className="font-semibold text-gray-900">{d.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{typeMap[d.type]}</p>
                      </div>
                      <Badge
                        variant={
                          ((mlData?.mean_delay_probability ? (d.probability * mlData.mean_delay_probability * 2) : d.probability) * d.impactScore) > 60 ? "destructive" : "secondary"
                        }
                      >
                        Risk: {Math.round((mlData?.mean_delay_probability ? (d.probability * mlData.mean_delay_probability * 2) : d.probability) * d.impactScore)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Probability (ML Driven)</p>
                        <p className="font-semibold text-blue-600">{((mlData?.mean_delay_probability ? (d.probability * mlData.mean_delay_probability * 2) : d.probability) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Impact Score</p>
                        <p className="font-semibold">{d.impactScore}/100</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Duration</p>
                        <p className="font-semibold">{d.duration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Historical Occurrences</p>
                        <p className="font-semibold">{d.historicalOccurrences}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Last Date</p>
                        <p className="font-semibold">{d.date || "N/A"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Affected Nodes</p>
                        <div className="flex flex-wrap gap-1">
                          {d.affectedNodes.map((nodeId) => (
                            <Badge key={nodeId} variant="outline">
                              {nodeId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Affected Regions</p>
                        <div className="flex flex-wrap gap-1">
                          {d.affectedRegions.map((region) => (
                            <Badge key={region} variant="outline">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600 text-xs">Recovery Time</p>
                        <p className="font-semibold text-red-600">{impact.recoveryTime} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Financial Impact</p>
                        <p className="font-semibold">
                          ${(impact.financialImpact / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Service Level Impact</p>
                        <p className="font-semibold">{impact.serviceLevelDegradation}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Cascade Effects</p>
                        <p className="font-semibold">{impact.cascadeEffects.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
