import { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useData } from "../utils/DataContext";
import { calculateNetworkMetrics } from "../utils/simulationEngine";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";

export function NetworkView() {
  const { data, loading, error } = useData();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState([3]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 500 });

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

  // Transform data for force graph
  const graphData = {
    nodes: data.nodes.map((node) => {
      const displayName = node.name || (node as any).label || node.id;
      return {
        id: node.id,
        name: displayName,
        type: node.type,
        location: node.location || (node as any).region || "Unknown",
        country: node.country || "N/A",
        capacity: node.capacity,
        tier: node.tier,
        displayName,
        val: node.capacity / 100, // Size based on capacity
      };
    }),
    links: data.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      leadTime: edge.leadTime,
      capacity: edge.capacity,
      reliability: edge.reliability,
      value: edge.capacity / 100,
    })),
  };

  // Handle container sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: 500,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // Give graph time to mount before centering it
    setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(400, 100);
      }
    }, 500);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize force graph with proper physics and centering
  useEffect(() => {
    if (graphRef.current && containerSize.width > 0) {
      setTimeout(() => {
        // Set physics parameters for better spacing
        graphRef.current
          .d3Force("charge")
          .strength(-1200); // Increased repulsion force

        graphRef.current
          .d3Force("link")
          .distance(() => 150); // Increase link distance

        graphRef.current
          .d3Force("collision")
          ?.strength(0.5);

        // Center and zoom
        graphRef.current.zoomToFit(400, 100, 1.2);
      }, 100);
    }
  }, [containerSize, graphRef]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "supplier":
        return "#3b82f6";
      case "factory":
        return "#8b5cf6";
      case "dc":
        return "#10b981";
      case "retailer":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  const getNodeLabel = (node: any) => {
    const name = node.name || node.id || "Unknown";
    const location = node.location || node.region || "Unknown";
    const capacity = node.capacity?.toLocaleString?.() ?? "N/A";
    return `
      <div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #ccc; color: #111; font-family: sans-serif; min-width: 180px;">
        <strong style="display:block; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: ${getNodeColor(node.type)}">${name}</strong>
        <p style="margin: 2px 0; font-size: 13px;"><b>ID:</b> ${node.id}</p>
        <p style="margin: 2px 0; font-size: 13px;"><b>Type:</b> <span style="text-transform: capitalize;">${node.type}</span></p>
        <p style="margin: 2px 0; font-size: 13px;"><b>Location:</b> ${location}</p>
        <p style="margin: 2px 0; font-size: 13px;"><b>Capacity:</b> ${capacity} units</p>
        <p style="margin: 2px 0; font-size: 13px;"><b>Tier:</b> Tier ${node.tier ?? "N/A"}</p>
        <em style="display:block; margin-top: 6px; font-size: 11px; color: #555;">(Click node to view full details below)</em>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              ref={containerRef}
              className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)]"
              style={{ width: "100%", height: "500px" }}
            >
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeAutoColorBy="type"
                nodeColor={(node: any) => getNodeColor(node.type)}
                nodeLabel={(node: any) => getNodeLabel(node)}
                nodeCanvasObjectMode={() => "after"}
                nodeCanvasObject={(node: any, ctx) => {
                  const rawLabel = node.name || node.id || "";
                  const label = rawLabel.length > 8 ? `${rawLabel.substring(0, 8)}...` : rawLabel;
                  // Scale font size with zoom level for better readability
                  const fontSize = Math.max(12, 16 * Math.sqrt(zoomLevel[0] / 2));
                  ctx.font = `bold ${fontSize}px Sans-Serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "#ffffff";
                  // Add text shadow for better contrast
                  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                  ctx.shadowBlur = 3;
                  ctx.fillText(label, node.x, node.y);
                  ctx.shadowColor = "transparent";
                }}
                onNodeClick={(node: any) => {
                  setSelectedNode(node);
                  // Auto scroll safely to the details panel when clicked
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                linkColor={() => "rgba(255,255,255,0.35)"}
                linkWidth={() => 1.4}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1.2}
                linkDirectionalParticleColor={() => "rgba(255,255,255,0.75)"}
                width={containerSize.width}
                height={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoom">Zoom Level: {zoomLevel[0].toFixed(1)}x</Label>
              <Slider
                id="zoom"
                min="0.5"
                max="5"
                step="0.1"
                value={zoomLevel[0]}
                onChange={(e) => setZoomLevel([parseFloat(e.currentTarget.value)])}
              />
            </div>

            <div className="text-sm text-[var(--ink)]">
              <p>💡 Nodes: {graphData.nodes.length} | Links: {graphData.links.length}</p>
              <p className="text-[var(--ink-dim)]">Tip: Click on nodes to see details. Use zoom slider to adjust view.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "supplier", label: "Suppliers" },
              { type: "factory", label: "Factories" },
              { type: "dc", label: "Distribution Centers" },
              { type: "retailer", label: "Retailers" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getNodeColor(item.type) }}
                />
                <span className="text-sm text-[var(--ink)]">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle>Node Details: {selectedNode.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[var(--ink-dim)]">Type</p>
                <p className="text-sm font-semibold capitalize text-[var(--ink)]">{selectedNode.type}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-dim)]">Location</p>
                <p className="text-sm font-semibold text-[var(--ink)]">{selectedNode.location}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-dim)]">Country</p>
                <p className="text-sm font-semibold text-[var(--ink)]">{selectedNode.country}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-dim)]">Capacity</p>
                <p className="text-sm font-semibold text-[var(--ink)]">{selectedNode.capacity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-dim)]">Supply Tier</p>
                <Badge variant="secondary">Tier {selectedNode.tier}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-[var(--ink-dim)]">Total Nodes</p>
              <p className="text-2xl font-bold text-[var(--ink)]">{data.nodes.length}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--ink-dim)]">Total Connections</p>
              <p className="text-2xl font-bold text-[var(--ink)]">{data.edges.length}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--ink-dim)]">Avg Lead Time</p>
              <p className="text-2xl font-bold text-[var(--ink)]">
                {Math.round(
                  data.edges.reduce((sum, e) => sum + e.leadTime, 0) /
                    data.edges.length
                )}{" "}
                days
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--ink-dim)]">Avg Reliability</p>
              <p className="text-2xl font-bold text-[var(--ink)]">
                {(calculateNetworkMetrics(data.nodes, data.edges).networkReliability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
