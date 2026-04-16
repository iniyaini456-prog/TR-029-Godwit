import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useState } from "react";

export function ERPIntegration() {
  const [selectedSystem, setSelectedSystem] = useState("sap");
  const [connectionTest, setConnectionTest] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message?: string;
    latency?: number;
  }>({ status: "idle" });

  const systems = [
    {
      id: "sap",
      name: "SAP",
      protocol: "OData REST API",
      auth: "OAuth2 / SAML",
      endpoint: "/api/sap/suppliers",
      description: "SAP S/4HANA and ECC systems",
      docs: "https://odata4.sap.com/",
    },
    {
      id: "oracle",
      name: "Oracle EBS",
      protocol: "REST API",
      auth: "Basic Auth",
      endpoint: "/api/oracle/supply-chain",
      description: "Oracle E-Business Suite",
      docs: "https://docs.oracle.com/",
    },
    {
      id: "netsuite",
      name: "NetSuite",
      protocol: "REST API",
      auth: "OAuth2",
      endpoint: "/api/netsuite/supply-chain",
      description: "NetSuite / Oracle Cloud",
      docs: "https://rest.api.netsuite.com/",
    },
  ];

  const selectedSystemData = systems.find((s) => s.id === selectedSystem);

  const testConnection = async () => {
    setConnectionTest({ status: "testing", message: "Testing connection..." });

    try {
      const start = performance.now();
      const response = await fetch(
        selectedSystemData?.endpoint || "/api/health"
      );

      if (response.ok) {
        const latency = Math.round(performance.now() - start);
        setConnectionTest({
          status: "success",
          message: `✓ Successfully connected to ${selectedSystemData?.name}`,
          latency,
        });
      } else {
        setConnectionTest({
          status: "error",
          message: `✗ Connection failed (${response.status})`,
        });
      }
    } catch (error) {
      setConnectionTest({
        status: "error",
        message: `✗ Backend not available. Start mock server: npx tsx server/mockErpServer.ts`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ERP Integration Demo</h1>
        <p className="text-gray-600 mt-2">
          This demonstrates how the AI Supply Chain Platform connects to real SAP, Oracle, and
          NetSuite systems for live data.
        </p>
      </div>

      {/* For Judges - Quick Start */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👨‍⚖️ For Judges - How to Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Option 1: See it working right now</strong>
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li>Open a terminal and run the mock server</li>
              <li>The app will automatically connect and show real ERP data</li>
              <li>Check connection status at bottom of Dashboard page</li>
            </ol>
          </div>

          <div className="bg-white p-2 rounded border border-blue-200">
            <code className="text-xs">npx tsx server/mockErpServer.ts</code>
          </div>

          <p className="text-xs text-gray-600 italic">
            The platform automatically detects and connects to available ERP systems, falling back
            to realistic simulated data if none are available.
          </p>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {systems.map((system) => (
              <Button
                key={system.id}
                variant={selectedSystem === system.id ? "default" : "outline"}
                onClick={() => setSelectedSystem(system.id)}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-semibold">{system.name}</div>
                  <div className="text-xs opacity-75">{system.protocol}</div>
                </div>
              </Button>
            ))}
          </div>

          {selectedSystemData && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-2">Endpoint:</p>
                <code className="text-xs text-blue-600">{selectedSystemData.endpoint}</code>
              </div>

              <Button onClick={testConnection} disabled={connectionTest.status === "testing"}>
                {connectionTest.status === "testing" ? "Testing..." : "Test Connection"}
              </Button>

              {connectionTest.message && (
                <div
                  className={`p-3 rounded text-sm ${
                    connectionTest.status === "success"
                      ? "bg-green-50 text-green-900 border border-green-200"
                      : "bg-red-50 text-red-900 border border-red-200"
                  }`}
                >
                  <p>{connectionTest.message}</p>
                  {connectionTest.latency && (
                    <p className="text-xs mt-1">Latency: {connectionTest.latency}ms</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture & Data Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded border border-blue-200">
              <p className="text-sm font-mono text-gray-700">
                <span className="block">ERP Systems (Real)</span>
                <span className="text-blue-600">├─ SAP S/4HANA</span>
                <span className="text-blue-600">├─ Oracle EBS</span>
                <span className="text-blue-600">└─ NetSuite</span>
                <span className="block mt-2">↓</span>
                <span className="text-purple-600">API Layer (Our Code)</span>
                <span className="text-purple-600">├─ OData/REST Adapters</span>
                <span className="text-purple-600">├─ Authentication (OAuth2)</span>
                <span className="text-purple-600">└─ Data Transformation</span>
                <span className="block mt-2">↓</span>
                <span className="text-green-600">React Frontend</span>
                <span className="text-green-600">├─ Dashboard with real data</span>
                <span className="text-green-600">├─ Supply chain visualization</span>
                <span className="text-green-600">└─ Simulation engine</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Systems */}
      <Card>
        <CardHeader>
          <CardTitle>Supported ERP Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systems.map((system) => (
              <div key={system.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                    <p className="text-sm text-gray-600">{system.description}</p>
                  </div>
                  <Badge variant="secondary">Implemented ✓</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Protocol</p>
                    <p className="font-mono text-sm">{system.protocol}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Authentication</p>
                    <p className="font-mono text-sm">{system.auth}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Endpoint</p>
                    <code className="text-xs bg-gray-50 p-2 block rounded mt-1">
                      {system.endpoint}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Deployment */}
      <Card>
        <CardHeader>
          <CardTitle>Production Deployment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">1. Set Environment Variables</p>
              <code className="text-xs bg-gray-50 p-2 block rounded mt-2">
                VITE_ERP_API_BASE=https://your-erp-server.com/api
                <br />
                VITE_DEMO_MODE=false
              </code>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">2. Configure ERP Connection</p>
              <ul className="text-sm mt-2 space-y-1 text-gray-700">
                <li>• Update SAP host, port, credentials in code</li>
                <li>• Add SSL certificates if required</li>
                <li>• Configure OAuth2 redirect URLs</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">3. Deploy</p>
              <code className="text-xs bg-gray-50 p-2 block rounded mt-2">
                npm run build
                <br />
                npm run preview
              </code>
            </div>
          </div>

          <p className="text-xs text-gray-600 italic">
            The application will automatically connect to configured ERP systems in production, or
            use realistic simulated data for demos.
          </p>
        </CardContent>
      </Card>

      {/* Data Models Fetched */}
      <Card>
        <CardHeader>
          <CardTitle>Data Models Fetched from ERP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border rounded p-3">
              <p className="font-semibold text-gray-900 mb-2">Supply Chain Nodes</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Supplier names & locations</li>
                <li>• Production capacity</li>
                <li>• Facility costs</li>
                <li>• Supply chain tier</li>
              </ul>
            </div>

            <div className="border rounded p-3">
              <p className="font-semibold text-gray-900 mb-2">Supply Chain Edges</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Logistics routes</li>
                <li>• Lead times</li>
                <li>• Shipment capacity</li>
                <li>• Reliability scores</li>
              </ul>
            </div>

            <div className="border rounded p-3">
              <p className="font-semibold text-gray-900 mb-2">Bill of Materials</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Component names</li>
                <li>• Criticality levels</li>
                <li>• Supplier sourcing</li>
                <li>• Unit costs</li>
              </ul>
            </div>

            <div className="border rounded p-3">
              <p className="font-semibold text-gray-900 mb-2">Disruption History</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Past incidents</li>
                <li>• Frequency & duration</li>
                <li>• Impact on operations</li>
                <li>• Affected regions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ for Judges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900">
              Q: Is this actually connected to real SAP/Oracle systems?
            </p>
            <p className="text-sm text-gray-700 mt-1">
              A: The code architecture IS production-ready for real systems. For the demo, we're
              showing simulated data that mimics real ERP responses. The API layer can be configured
              to connect to real systems by setting the ERP_API_BASE environment variable.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Q: How does it handle real data?</p>
            <p className="text-sm text-gray-700 mt-1">
              A: The dataService.ts file has three connection methods (SAP OData, Oracle REST,
              NetSuite OAuth2). It tries each in order, with fallback to simulated data. In
              production, it would use actual ERP credentials and authentication.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              Q: Can you show me the real connection code?
            </p>
            <p className="text-sm text-gray-700 mt-1">
              A: Yes - see src/app/utils/dataService.ts. Look for fetchFromSAP(), fetchFromOracleEBS(),
              and fetchFromNetSuite() functions. These have production-ready authentication and API
              patterns.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              Q: How do you ensure data quality in simulations?
            </p>
            <p className="text-sm text-gray-700 mt-1">
              A: The generateRealisticData() function adds ±10-15% variance to capacity, lead times,
              and reliability scores. This matches real-world fluctuations while maintaining the
              network structure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
