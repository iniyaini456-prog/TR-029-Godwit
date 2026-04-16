import { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { supplyChainNodes, supplyChainEdges } from "../data/mockData";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";

export function NetworkView() {
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState([1]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 384 });

  // Transform data for force graph
  const graphData = {
    nodes: supplyChainNodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      location: node.location,
      country: node.country,
      capacity: node.capacity,
      tier: node.tier,
      val: node.capacity / 100, // Size based on capacity
    })),
    links: supplyChainEdges.map((edge) => ({
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
          height: 384,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
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
    return node.name;
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
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              style={{ width: "100%", height: "384px" }}
            >
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeAutoColorBy="type"
                nodeColor={(node: any) => getNodeColor(node.type)}
                nodeLabel={(node: any) => getNodeLabel(node)}
                nodeCanvasObjectMode={() => "after"}
                nodeCanvasObject={(node: any, ctx) => {
                  const label = node.name.substring(0, 3);
                  // Scale font size with zoom level for better readability
                  const fontSize = Math.max(12, 18 * Math.sqrt(zoomLevel[0] / 2));
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
                onNodeClick={(node: any) => setSelectedNode(node)}
                linkColor={() => "rgba(0,0,0,0.2)"}
                linkWidth={0.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1}
                width={containerSize.width}
                height={384}
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

            <div className="text-sm text-gray-600">
              <p>💡 Nodes: {graphData.nodes.length} | Links: {graphData.links.length}</p>
              <p>Tip: Click on nodes to see details. Use zoom slider to adjust view.</p>
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
                <span className="text-sm text-gray-700">{item.label}</span>
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
                <p className="text-xs text-gray-600">Type</p>
                <p className="text-sm font-semibold capitalize">{selectedNode.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Location</p>
                <p className="text-sm font-semibold">{selectedNode.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Country</p>
                <p className="text-sm font-semibold">{selectedNode.country}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Capacity</p>
                <p className="text-sm font-semibold">{selectedNode.capacity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Supply Tier</p>
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
              <p className="text-sm text-gray-600">Total Nodes</p>
              <p className="text-2xl font-bold">{supplyChainNodes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold">{supplyChainEdges.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Lead Time</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  supplyChainEdges.reduce((sum, e) => sum + e.leadTime, 0) /
                    supplyChainEdges.length
                )}{" "}
                days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Reliability</p>
              <p className="text-2xl font-bold">
                {(
                  (supplyChainEdges.reduce((sum, e) => sum + e.reliability, 0) /
                    supplyChainEdges.length) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
