import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useData } from "../utils/DataContext";
import { simulateDisruption } from "../utils/simulationEngine";
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
} from "recharts";

export function ImpactAnalysis() {
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

  const [selectedDisruptionId, setSelectedDisruptionId] = useState(
    data.disruptions[0].id
  );

  const selectedDisruption = data.disruptions.find((d) => d.id === selectedDisruptionId);
  const impact = selectedDisruption
    ? simulateDisruption(selectedDisruption, data.nodes, data.edges)
    : null;

  const affectedNodeNames = selectedDisruption
    ? selectedDisruption.affectedNodes
        .map((id) => data.nodes.find((n) => n.id === id)?.name)
        .filter(Boolean)
    : [];

  // Create timeline data for recovery
  const recoveryTimeline = selectedDisruption
    ? Array.from({ length: selectedDisruption.duration + 5 }, (_, i) => ({
        day: i,
        impact:
          100 *
          Math.exp(-((i - selectedDisruption.duration / 2) ** 2) / (selectedDisruption.duration * 5)),
        recovery: Math.min(100, (i / (selectedDisruption.duration + 5)) * 100),
      }))
    : [];

  // BOM impact analysis
  const criticalBOM = data.billOfMaterials.filter((b) => b.criticality === "critical");

  // Capacity impact by node type
  const capacityImpact = selectedDisruption
    ? [
        {
          type: "supplier",
          total: data.nodes
            .filter((n) => n.type === "supplier")
            .reduce((sum, n) => sum + n.capacity, 0),
          affected: data.nodes
            .filter(
              (n) =>
                n.type === "supplier" &&
                selectedDisruption.affectedNodes.includes(n.id)
            )
            .reduce((sum, n) => sum + n.capacity, 0),
        },
        {
          type: "factory",
          total: data.nodes
            .filter((n) => n.type === "factory")
            .reduce((sum, n) => sum + n.capacity, 0),
          affected: data.nodes
            .filter(
              (n) =>
                n.type === "factory" &&
                selectedDisruption.affectedNodes.includes(n.id)
            )
            .reduce((sum, n) => sum + n.capacity, 0),
        },
        {
          type: "dc",
          total: data.nodes
            .filter((n) => n.type === "dc")
            .reduce((sum, n) => sum + n.capacity, 0),
          affected: data.nodes
            .filter(
              (n) =>
                n.type === "dc" &&
                selectedDisruption.affectedNodes.includes(n.id)
            )
            .reduce((sum, n) => sum + n.capacity, 0),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Disruption Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Disruption Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {data.disruptions.map((d) => (
              <Button
                key={d.id}
                variant={selectedDisruptionId === d.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDisruptionId(d.id)}
              >
                {d.name.substring(0, 12)}...
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDisruption && impact && (
        <>
          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 mb-1">Recovery Time</p>
                <p className="text-2xl font-bold text-red-600">{impact.recoveryTime}</p>
                <p className="text-xs text-gray-600">Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 mb-1">Financial Impact</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(impact.financialImpact / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 mb-1">Service Level Impact</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {impact.serviceLevelDegradation}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 mb-1">Cascade Effects</p>
                <p className="text-2xl font-bold text-purple-600">
                  {impact.cascadeEffects.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery & Impact Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recoveryTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Days", position: "insideBottomRight", offset: -5 }} />
                  <YAxis label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="impact" stroke="#ef4444" name="Impact Level" />
                  <Line type="monotone" dataKey="recovery" stroke="#10b981" name="Recovery Progress" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Capacity Impact by Node Type */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity Impact by Node Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={capacityImpact.map((item) => ({
                    type: item.type,
                    available: item.total - item.affected,
                    affected: item.affected,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="available" fill="#10b981" name="Available Capacity" />
                  <Bar dataKey="affected" fill="#ef4444" name="Affected Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Affected Nodes and BOM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Affected Nodes ({affectedNodeNames.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedDisruption.affectedNodes.map((nodeId) => {
                    const node = data.nodes.find((n) => n.id === nodeId);
                    return (
                      <div key={nodeId} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium text-sm">{node?.name}</p>
                        <p className="text-xs text-gray-600">
                          {node?.location}, {node?.country} • Capacity: {node?.capacity.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical BOM Items at Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalBOM.map((item) => {
                    const supplier = data.nodes.find((n) => n.id === item.supplier);
                    const isAffected = selectedDisruption.affectedNodes.includes(item.supplier);
                    return (
                      <div
                        key={item.id}
                        className={`p-2 rounded ${
                          isAffected ? "bg-red-50 border border-red-200" : "bg-gray-50"
                        }`}
                      >
                        <p className={`font-medium text-sm ${isAffected ? "text-red-700" : ""}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          From: {supplier?.name} {isAffected ? "⚠️ AFFECTED" : "✓"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cascade Effects */}
          {impact.cascadeEffects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cascade Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  This disruption may cascade to the following downstream nodes:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {impact.cascadeEffects.map((nodeId) => {
                    const node = data.nodes.find((n) => n.id === nodeId);
                    return (
                      <div key={nodeId} className="p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm font-medium">{node?.name}</p>
                        <p className="text-xs text-gray-600">{node?.type}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
