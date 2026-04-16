import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Activity, ShieldAlert, 
  ShieldCheck, Save
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';

// --- DATA MODELS ---

type NodeStatus = 'healthy' | 'at-risk' | 'disrupted';

interface SupplyNode {
  id: string;
  label: string;
  type: 'supplier' | 'factory' | 'dc' | 'retailer';
  capacity: number;
  x: number;
  y: number;
  status: NodeStatus;
  region: string;
}

interface SupplyEdge {
  id: string;
  source: string;
  target: string;
  leadTime: number;
}

interface DisruptionScenario {
  id: string;
  name: string;
  targetTypes: string[];
  targetRegions: string[];
  description: string;
}

interface Strategy {
  id: string;
  title: string;
  cost: number;
  roi: number;
  timeline: string;
  riskReduction: number;
  description: string;
}

interface SavedScenario {
  id: string;
  name: string;
  financialImpact: number;
  serviceLevel: number;
  daysToRecovery: number;
  timestamp: number;
}

// --- INITIAL DATA ---

const INITIAL_NODES: SupplyNode[] = [
  { id: 'sup-a', label: 'Supplier A', type: 'supplier', capacity: 5000, x: 100, y: 100, status: 'healthy', region: 'Shanghai' },
  { id: 'sup-b', label: 'Supplier B', type: 'supplier', capacity: 3000, x: 100, y: 300, status: 'healthy', region: 'Chennai' },
  { id: 'fac-1', label: 'Factory 1', type: 'factory', capacity: 4000, x: 300, y: 100, status: 'healthy', region: 'Vietnam' },
  { id: 'fac-2', label: 'Factory 2', type: 'factory', capacity: 3500, x: 300, y: 300, status: 'healthy', region: 'Malaysia' },
  { id: 'dc-sin', label: 'DC Singapore', type: 'dc', capacity: 8000, x: 500, y: 100, status: 'healthy', region: 'Singapore' },
  { id: 'dc-dxb', label: 'DC Dubai', type: 'dc', capacity: 6000, x: 500, y: 300, status: 'healthy', region: 'Dubai' },
  { id: 'ret-eu', label: 'Retailer EU', type: 'retailer', capacity: 2000, x: 700, y: 100, status: 'healthy', region: 'Europe' },
  { id: 'ret-us', label: 'Retailer US', type: 'retailer', capacity: 2500, x: 700, y: 300, status: 'healthy', region: 'US' },
];

const INITIAL_EDGES: SupplyEdge[] = [
  { id: 'e1', source: 'sup-a', target: 'fac-1', leadTime: 7 },
  { id: 'e2', source: 'sup-b', target: 'fac-2', leadTime: 10 },
  { id: 'e3', source: 'sup-a', target: 'fac-2', leadTime: 12 },
  { id: 'e4', source: 'fac-1', target: 'dc-sin', leadTime: 5 },
  { id: 'e5', source: 'fac-2', target: 'dc-dxb', leadTime: 8 },
  { id: 'e6', source: 'fac-1', target: 'dc-dxb', leadTime: 7 },
  { id: 'e7', source: 'dc-sin', target: 'ret-eu', leadTime: 14 },
  { id: 'e8', source: 'dc-dxb', target: 'ret-us', leadTime: 12 },
  { id: 'e9', source: 'dc-sin', target: 'ret-us', leadTime: 15 },
];

const SCENARIOS: DisruptionScenario[] = [
  { id: 'port-closure', name: 'Port Closure', targetTypes: ['dc'], targetRegions: ['Singapore', 'Dubai'], description: 'Major port operations halted due to labor strikes or accidents.' },
  { id: 'supplier-bankruptcy', name: 'Supplier Bankruptcy', targetTypes: ['supplier'], targetRegions: ['Shanghai', 'Chennai'], description: 'Key tier-1 supplier files for insolvency.' },
  { id: 'climate-event', name: 'Climate Event', targetTypes: ['factory'], targetRegions: ['Vietnam', 'Malaysia'], description: 'Typhoon or severe flooding impacts manufacturing hubs.' },
  { id: 'geopolitical', name: 'Geopolitical Restriction', targetTypes: ['supplier', 'factory'], targetRegions: ['Shanghai', 'Vietnam'], description: 'New trade tariffs or export bans enacted.' },
  { id: 'raw-material', name: 'Raw Material Shortage', targetTypes: ['supplier'], targetRegions: ['Shanghai', 'Chennai'], description: 'Global shortage of critical raw materials.' },
];

const STRATEGIES_DB: Record<string, Strategy[]> = {
  'port-closure': [
    { id: 's1', title: 'Alternative Routing', cost: 150000, roi: 320, timeline: '2 days', riskReduction: 85, description: 'Reroute shipments to secondary ports.' },
    { id: 's2', title: 'Air Freight Expedite', cost: 450000, roi: 150, timeline: 'Immediate', riskReduction: 95, description: 'Convert ocean freight to air for critical SKUs.' },
    { id: 's3', title: 'Buffer Stock Utilization', cost: 50000, roi: 400, timeline: 'Immediate', riskReduction: 60, description: 'Draw down existing safety stock at destination DCs.' },
    { id: 's4', title: 'Nearshoring', cost: 2000000, roi: 180, timeline: '6-12 months', riskReduction: 90, description: 'Develop local manufacturing capabilities.' },
    { id: 's5', title: 'Safety Stock Increase', cost: 300000, roi: 210, timeline: '1 month', riskReduction: 70, description: 'Permanently increase baseline inventory levels.' },
  ],
  'supplier-bankruptcy': [
    { id: 's6', title: 'Dual Sourcing Activation', cost: 100000, roi: 500, timeline: '1 week', riskReduction: 90, description: 'Shift volume to pre-approved secondary suppliers.' },
    { id: 's7', title: 'Spot Market Procurement', cost: 250000, roi: 120, timeline: 'Immediate', riskReduction: 75, description: 'Buy materials on open market at premium.' },
    { id: 's8', title: 'Supplier Financial Injection', cost: 1000000, roi: 80, timeline: '1 week', riskReduction: 50, description: 'Provide emergency capital to keep supplier afloat.' },
    { id: 's9', title: 'Vertical Integration', cost: 5000000, roi: 150, timeline: '1-2 years', riskReduction: 95, description: 'Acquire supplier assets and operations.' },
    { id: 's10', title: 'Product Redesign', cost: 400000, roi: 200, timeline: '3-6 months', riskReduction: 85, description: 'Engineer out the dependency on the bankrupt supplier.' },
  ],
  'climate-event': [
    { id: 's11', title: 'Geographic Diversification', cost: 1500000, roi: 250, timeline: '6-12 months', riskReduction: 85, description: 'Spread production across multiple climate zones.' },
    { id: 's12', title: 'Redundant DC Activation', cost: 300000, roi: 300, timeline: '1 week', riskReduction: 80, description: 'Spin up temporary warehousing in safe zones.' },
    { id: 's13', title: 'Demand Sensing', cost: 150000, roi: 450, timeline: '1 month', riskReduction: 65, description: 'AI-driven forecasting to shape demand away from constrained products.' },
    { id: 's14', title: 'Emergency Procurement', cost: 200000, roi: 180, timeline: 'Immediate', riskReduction: 70, description: 'Rapid sourcing from unaffected regions.' },
    { id: 's15', title: 'Parametric Insurance', cost: 100000, roi: 600, timeline: 'Pre-event', riskReduction: 90, description: 'Automated payouts based on weather triggers to cover losses.' },
  ],
  'geopolitical': [
    { id: 's16', title: 'FTZ Strategy', cost: 250000, roi: 350, timeline: '3 months', riskReduction: 80, description: 'Utilize Foreign Trade Zones to delay/reduce tariffs.' },
    { id: 's17', title: 'Tariff Hedging', cost: 100000, roi: 200, timeline: 'Immediate', riskReduction: 60, description: 'Financial instruments to offset currency/tariff risks.' },
    { id: 's18', title: 'Local Sourcing', cost: 800000, roi: 220, timeline: '6 months', riskReduction: 90, description: 'Shift procurement to domestic suppliers.' },
    { id: 's19', title: 'Supply Chain Mapping', cost: 75000, roi: 500, timeline: '1 month', riskReduction: 40, description: 'Deep n-tier visibility to identify hidden geopolitical risks.' },
    { id: 's20', title: 'Nearshoring', cost: 2000000, roi: 180, timeline: '6-12 months', riskReduction: 90, description: 'Move operations closer to end markets.' },
  ],
  'raw-material': [
    { id: 's21', title: 'Strategic Stockpile', cost: 500000, roi: 280, timeline: '3 months', riskReduction: 85, description: 'Build reserves of critical raw materials.' },
    { id: 's22', title: 'Substitute Materials', cost: 300000, roi: 400, timeline: '6 months', riskReduction: 75, description: 'R&D to qualify alternative materials.' },
    { id: 's23', title: 'Long-term Contracts', cost: 0, roi: 350, timeline: '1 month', riskReduction: 70, description: 'Lock in supply and pricing with key vendors.' },
    { id: 's24', title: 'Circular Supply', cost: 600000, roi: 200, timeline: '1 year', riskReduction: 60, description: 'Recycle and reuse materials from end-of-life products.' },
    { id: 's25', title: 'Supplier Development', cost: 150000, roi: 450, timeline: '6 months', riskReduction: 80, description: 'Invest in supplier capacity and capabilities.' },
  ]
};

// --- HELPER COMPONENTS ---

// --- MAIN APP COMPONENT ---

export default function App() {
  // State
  const [nodes, setNodes] = useState<SupplyNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<SupplyEdge[]>(INITIAL_EDGES);
  
  const [selectedScenario, setSelectedScenario] = useState<string>('port-closure');
  const [severity, setSeverity] = useState<number>(5);
  const [duration, setDuration] = useState<number>(30);
  const [budget, setBudget] = useState<number>(1000000);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  
  const [metrics, setMetrics] = useState({
    nodesAffected: 0,
    daysToRecovery: 0,
    financialImpact: 0,
    serviceLevel: 98.5,
    budgetUsed: 0
  });
  
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  
  const [activeStrategies, setActiveStrategies] = useState<Strategy[]>([]);
  const [implementedStrategies, setImplementedStrategies] = useState<Set<string>>(new Set());
  
  const [appState, setAppState] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Simulation Logic
  const triggerDisruption = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setSimulationStep(0);
    setImplementedStrategies(new Set());
    
    // Reset nodes
    setNodes(INITIAL_NODES.map(n => ({ ...n, status: 'healthy' })));
    setMetrics({
      nodesAffected: 0,
      daysToRecovery: 0,
      financialImpact: 0,
      serviceLevel: 98.5,
      budgetUsed: 0
    });
    
    const scenario = SCENARIOS.find(s => s.id === selectedScenario);
    if (!scenario) return;

    // Load strategies
    let strats = STRATEGIES_DB[selectedScenario] || [];
    // Sort by ROI
    strats = [...strats].sort((a, b) => b.roi - a.roi);
    setActiveStrategies(strats);

    // Step 1: Identify initial impacted nodes
    const initialImpacted = INITIAL_NODES.filter(n => 
      scenario.targetTypes.includes(n.type) && 
      (scenario.id === 'raw-material' || scenario.targetRegions.includes(n.region))
    );

    // Start cascade
    let currentNodes = INITIAL_NODES.map(n => ({ ...n, status: 'healthy' as NodeStatus }));
    let step = 0;
    let affectedCount = 0;
    let cost = 0;
    let serviceDrop = 0;
    
    const cascadeInterval = setInterval(() => {
      step++;
      setSimulationStep(step);
      
      let newNodes = [...currentNodes];
      let newlyAffected = 0;
      
      if (step === 1) {
        // Hit initial nodes
        initialImpacted.forEach(n => {
          const idx = newNodes.findIndex(node => node.id === n.id);
          if (idx !== -1) {
            newNodes[idx].status = 'disrupted';
            newlyAffected++;
            cost += (severity * newNodes[idx].capacity * 500 * (duration / 30));
          }
        });
      } else {
        // Propagate down edges
        const previousDisrupted = currentNodes.filter(n => n.status === 'disrupted').map(n => n.id);
        const previousAtRisk = currentNodes.filter(n => n.status === 'at-risk').map(n => n.id);
        
        edges.forEach(edge => {
          if (previousDisrupted.includes(edge.source)) {
            const targetIdx = newNodes.findIndex(n => n.id === edge.target);
            if (targetIdx !== -1 && newNodes[targetIdx].status === 'healthy') {
              // If lead time is short, disrupt immediately, else at risk
              if (edge.leadTime < 10 && severity > 5) {
                newNodes[targetIdx].status = 'disrupted';
                cost += (severity * newNodes[targetIdx].capacity * 200 * (duration / 30));
              } else {
                newNodes[targetIdx].status = 'at-risk';
                cost += (severity * newNodes[targetIdx].capacity * 50 * (duration / 30));
              }
              newlyAffected++;
            }
          } else if (previousAtRisk.includes(edge.source)) {
            const targetIdx = newNodes.findIndex(n => n.id === edge.target);
            if (targetIdx !== -1 && newNodes[targetIdx].status === 'healthy' && severity > 7) {
              newNodes[targetIdx].status = 'at-risk';
              newlyAffected++;
            }
          }
        });
      }
      
      affectedCount += newlyAffected;
      serviceDrop += newlyAffected * (severity * 0.15);
      
      currentNodes = newNodes;
      setNodes(newNodes);
      
      setMetrics(prev => ({
        ...prev,
        nodesAffected: prev.nodesAffected + newlyAffected,
        financialImpact: prev.financialImpact + cost,
        serviceLevel: Math.max(0, 98.5 - serviceDrop),
        daysToRecovery: Math.floor(severity * duration * 0.5)
      }));
      
      cost = 0; // Reset cost accumulator for next step
      
      if (newlyAffected === 0 && step > 1) {
        clearInterval(cascadeInterval);
        setIsSimulating(false);
      }
    }, 800);
  };

  const implementStrategy = (strategy: Strategy) => {
    if (implementedStrategies.has(strategy.id)) return;
    if (metrics.budgetUsed + strategy.cost > budget) {
      alert("Insufficient budget for this strategy!");
      return;
    }

    setImplementedStrategies(prev => new Set(prev).add(strategy.id));
    
    // Apply benefits
    setMetrics(prev => ({
      ...prev,
      budgetUsed: prev.budgetUsed + strategy.cost,
      financialImpact: Math.max(0, prev.financialImpact - (strategy.cost * (strategy.roi / 100))),
      serviceLevel: Math.min(100, prev.serviceLevel + (strategy.riskReduction * 0.05)),
      daysToRecovery: Math.max(0, prev.daysToRecovery - Math.floor(strategy.riskReduction * 0.2))
    }));

    // Heal some nodes
    setNodes(prev => prev.map(n => {
      if (n.status === 'disrupted' && Math.random() > 0.5) return { ...n, status: 'at-risk' };
      if (n.status === 'at-risk' && Math.random() > 0.3) return { ...n, status: 'healthy' };
      return n;
    }));
  };

  const saveScenario = () => {
    if (!scenarioName) return;
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: scenarioName,
      financialImpact: metrics.financialImpact,
      serviceLevel: metrics.serviceLevel,
      daysToRecovery: metrics.daysToRecovery,
      timestamp: Date.now()
    };
    setSavedScenarios([...savedScenarios, newScenario]);
    setScenarioName('');
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  if (appState === 'landing') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)] font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#0f0f0f_100%)] opacity-50"></div>
        
        {/* Grid Background */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6"
        >
          <div className="w-16 h-16 rounded-full bg-[rgba(249,115,22,0.1)] flex items-center justify-center border border-[rgba(249,115,22,0.3)] mb-6 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <Activity className="w-8 h-8 text-[var(--accent)]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[var(--ink)]">
            ARC-LIGHT <span className="text-[var(--accent)]">//</span> SC RESILIENCE
          </h1>
          
          <p className="text-[var(--ink-dim)] text-sm md:text-base mb-10 max-w-lg leading-relaxed">
            Agentic Supply Chain Disruption Simulator. Initialize the engine to model cascading failures, evaluate risk exposure, and deploy AI-driven mitigation strategies in real-time.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAppState('auth')}
            className="group relative px-8 py-4 bg-[var(--bg)] border border-[var(--accent)] text-[var(--accent)] font-mono font-bold tracking-[0.2em] uppercase overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow"
          >
            <div className="absolute inset-0 bg-[var(--accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 group-hover:text-[var(--bg)] transition-colors duration-300">Initialize System</span>
          </motion.button>
          
          <div className="mt-16 flex gap-8 text-[10px] font-mono text-[var(--ink-dim)] uppercase tracking-widest opacity-50">
            <span>SYS.VER 2.4.1</span>
            <span>SEC.LEVEL ALPHA</span>
            <span>NODE.STATUS ONLINE</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsAuthenticating(true);
    // Mock network delay for realistic feel
    setTimeout(() => {
      setIsAuthenticating(false);
      setAppState('dashboard');
    }, 1500);
  };

  if (appState === 'auth') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)] font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#0f0f0f_100%)] opacity-50"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
            
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded bg-[rgba(249,115,22,0.1)] flex items-center justify-center border border-[rgba(249,115,22,0.3)]">
                <Activity className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight text-[var(--ink)]">
              {authMode === 'login' ? 'SYSTEM LOGIN' : 'REQUEST ACCESS'}
            </h2>
            <p className="text-[var(--ink-dim)] text-center text-sm mb-8">
              {authMode === 'login' ? 'Authenticate to access ARC-LIGHT' : 'Register for clearance level ALPHA'}
            </p>
            
            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase text-[var(--ink-dim)] tracking-widest mb-2">Email Designation</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] rounded p-3 text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
                  placeholder="operator@arc-light.sys"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--ink-dim)] tracking-widest mb-2">Passcode</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] rounded p-3 text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-6 py-3 bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.3)] text-[var(--accent)] font-bold uppercase tracking-widest text-sm rounded hover:bg-[rgba(249,115,22,0.2)] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isAuthenticating ? <Activity className="w-4 h-4 animate-spin" /> : null}
                {isAuthenticating ? 'AUTHENTICATING...' : (authMode === 'login' ? 'ACCESS SYSTEM' : 'REGISTER')}
              </button>
            </form>
            
            <div className="mt-6 text-center border-t border-[var(--border)] pt-4">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[10px] text-[var(--ink-dim)] hover:text-[var(--accent)] uppercase tracking-widest transition-colors"
              >
                {authMode === 'login' ? 'No clearance? Request access' : 'Already registered? Login'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans overflow-hidden"
    >
      <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[rgba(26,26,26,0.8)] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-[18px] text-[var(--accent)]">
          <Activity className="w-6 h-6" />
          ARC-LIGHT // SC RESILIENCE
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-[var(--ink-dim)] tracking-wider">Total Cost Impact</span>
            <span className="font-mono text-base font-semibold text-[var(--danger)]">{formatCurrency(metrics.financialImpact)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-[var(--ink-dim)] tracking-wider">Recovery Time</span>
            <span className="font-mono text-base font-semibold text-[var(--accent)]">{metrics.daysToRecovery} DAYS</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-[var(--ink-dim)] tracking-wider">Service Level</span>
            <span className={`font-mono text-base font-semibold ${metrics.serviceLevel < 90 ? 'text-[var(--danger)]' : metrics.serviceLevel < 95 ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
              {metrics.serviceLevel.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-[var(--ink-dim)] tracking-wider">Budget Used</span>
            <span className="font-mono text-base font-semibold text-[var(--ink)]">
              {((metrics.budgetUsed / budget) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-[1fr_300px_320px] gap-[1px] bg-[var(--border)] overflow-hidden">
        
        {/* Panel 1: Graph & Metrics */}
        <div className="bg-[var(--bg)] p-5 flex flex-col overflow-hidden">
          <h2 className="text-[12px] uppercase mb-4 tracking-[0.1em] text-[var(--ink-dim)]">Network Topology: Real-Time Status</h2>
          
          <div className="flex-1 relative bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#0f0f0f_100%)] rounded-lg border border-[var(--border)] overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
              {/* Edges */}
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;
                
                const isDisrupted = sourceNode.status === 'disrupted' || targetNode.status === 'disrupted';
                const isRisk = sourceNode.status === 'at-risk' || targetNode.status === 'at-risk';
                
                // Calculate curve
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                
                return (
                  <g key={edge.id}>
                    <motion.path
                      d={`M ${sourceNode.x} ${sourceNode.y} Q ${sourceNode.x + dx/2} ${sourceNode.y + dy/2 - (dx*0.1)} ${targetNode.x} ${targetNode.y}`}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth={isDisrupted ? 2 : 1}
                      strokeDasharray={isRisk ? "5,5" : "none"}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Nodes */}
            {nodes.map(node => {
              const colors = {
                'healthy': 'var(--success)',
                'at-risk': '#eab308',
                'disrupted': 'var(--danger)'
              };
              
              return (
                <motion.div
                  key={node.id}
                  className="absolute rounded-full z-10"
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    width: 12,
                    height: 12,
                    marginLeft: -6,
                    marginTop: -6,
                    background: colors[node.status],
                    boxShadow: `0 0 10px ${colors[node.status]}`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.5, zIndex: 20 }}
                >
                  <div className="absolute text-[10px] text-[var(--ink-dim)] mt-4 -translate-x-[40%] whitespace-nowrap font-sans tracking-wide">
                    {node.label.toUpperCase()}
                  </div>
                  
                  {/* Ping animation for disrupted */}
                  {node.status === 'disrupted' && (
                    <span className="absolute flex h-full w-full rounded-full -z-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-40"></span>
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-5 gap-4 mt-5 shrink-0">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-lg">
              <div className="text-[10px] text-[var(--ink-dim)] uppercase mb-1">Nodes Affected</div>
              <div className="text-[20px] font-mono font-bold text-[var(--danger)]">{metrics.nodesAffected}</div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-lg">
              <div className="text-[10px] text-[var(--ink-dim)] uppercase mb-1">Critical Edges</div>
              <div className="text-[20px] font-mono font-bold text-[var(--ink)]">
                {edges.filter(e => {
                  const s = nodes.find(n => n.id === e.source);
                  const t = nodes.find(n => n.id === e.target);
                  return s?.status === 'disrupted' || t?.status === 'disrupted';
                }).length}
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-lg">
              <div className="text-[10px] text-[var(--ink-dim)] uppercase mb-1">Lead Time Avg</div>
              <div className="text-[20px] font-mono font-bold text-[var(--ink)]">
                {(edges.reduce((acc, e) => acc + e.leadTime, 0) / edges.length).toFixed(1)}d
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-lg">
              <div className="text-[10px] text-[var(--ink-dim)] uppercase mb-1">Inventory Days</div>
              <div className="text-[20px] font-mono font-bold text-[var(--ink)]">
                {Math.max(0, 45 - metrics.daysToRecovery)}
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-lg">
              <div className="text-[10px] text-[var(--ink-dim)] uppercase mb-1">Risk Index</div>
              <div className="text-[20px] font-mono font-bold text-[var(--accent)]">
                {((metrics.nodesAffected / nodes.length) * 10).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Controls & Scenario Library */}
        <div className="bg-[var(--bg)] p-5 flex flex-col overflow-y-auto custom-scrollbar">
          <h2 className="text-[12px] uppercase mb-4 tracking-[0.1em] text-[var(--ink-dim)]">Disruption Engine</h2>
          
          <div className="mb-6">
            <label className="block text-[11px] uppercase text-[var(--ink-dim)] mb-2 tracking-[0.05em]">Scenario Type</label>
            <select 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--ink)] p-2 rounded text-[13px] mb-3 outline-none"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              disabled={isSimulating}
            >
              {SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            
            <label className="block text-[11px] uppercase text-[var(--ink-dim)] mb-2 tracking-[0.05em]">Event Severity (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={severity} onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] p-2 rounded mb-3 accent-[var(--accent)]"
              disabled={isSimulating}
            />
            <div className="flex justify-between font-mono text-[10px] -mt-2 mb-3 text-[var(--ink-dim)]">
              <span>LOW</span><span>HIGH ({severity})</span>
            </div>

            <label className="block text-[11px] uppercase text-[var(--ink-dim)] mb-2 tracking-[0.05em]">Duration (Days)</label>
            <input 
              type="range" min="1" max="90" 
              value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] p-2 rounded mb-3 accent-[var(--accent)]"
              disabled={isSimulating}
            />
            <div className="flex justify-between font-mono text-[10px] -mt-2 mb-3 text-[var(--ink-dim)]">
              <span>1D</span><span>{duration} DAYS</span>
            </div>

            <button 
              onClick={triggerDisruption}
              disabled={isSimulating}
              className="w-full bg-[var(--danger)] text-white border-none p-3 rounded font-bold cursor-pointer uppercase tracking-[0.05em] mt-2.5 shadow-[0_4px_12px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? 'Simulating...' : 'Initiate Cascade'}
            </button>
          </div>

          <div className="mt-10">
            <label className="block text-[11px] uppercase text-[var(--ink-dim)] mb-2 tracking-[0.05em]">Scenario Library</label>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                placeholder="Scenario name..." 
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="flex-1 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--ink)] p-2 rounded text-[13px] outline-none"
              />
              <button 
                onClick={saveScenario}
                disabled={!scenarioName || isSimulating || metrics.financialImpact === 0}
                className="px-3 py-2 bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed rounded text-[13px] flex items-center gap-1 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[var(--card-bg)] rounded text-[12px]">
              {savedScenarios.length === 0 ? (
                <div className="p-3 text-[var(--ink-dim)] text-center">No scenarios saved.</div>
              ) : (
                savedScenarios.map(s => (
                  <div key={s.id} className="p-2.5 border-b border-[var(--border)] flex justify-between last:border-0">
                    <span>{s.name}</span>
                    <span className="text-[var(--danger)] font-mono">{formatCurrency(s.financialImpact)}</span>
                  </div>
                ))
              )}
            </div>
            
            {/* Recharts Chart */}
            {savedScenarios.length > 0 && (
              <div className="h-40 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savedScenarios} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--ink-dim)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ink-dim)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '4px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--danger)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="financialImpact" fill="var(--danger)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Strategies */}
        <div className="bg-[var(--bg)] p-5 flex flex-col overflow-hidden">
          <h2 className="text-[12px] uppercase mb-4 tracking-[0.1em] text-[var(--ink-dim)]">Resilience Optimizer</h2>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence>
              {activeStrategies.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-[var(--ink-dim)] text-center p-6 border border-dashed border-[var(--border)] rounded-lg"
                >
                  <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[13px]">Run a simulation to generate mitigation strategies.</p>
                </motion.div>
              ) : (
                activeStrategies.map((strategy, idx) => {
                  const isImplemented = implementedStrategies.has(strategy.id);
                  const canAfford = (budget - metrics.budgetUsed) >= strategy.cost;
                  
                  return (
                    <motion.div 
                      key={strategy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-3 mb-3 border-l-4 ${
                        isImplemented ? 'border-l-[var(--success)] opacity-70' : 'border-l-[var(--accent)]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[14px] font-semibold">{strategy.title}</span>
                        <span className="font-mono text-[10px] bg-[rgba(34,197,94,0.15)] text-[var(--success)] px-1.5 py-0.5 rounded border border-[rgba(34,197,94,0.3)]">
                          ROI {strategy.roi}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--ink-dim)] mb-3">
                        <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] py-1">
                          <span>Cost</span>
                          <span className="text-[var(--ink)] font-mono">{formatCurrency(strategy.cost)}</span>
                        </div>
                        <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] py-1">
                          <span>Timeline</span>
                          <span className="text-[var(--ink)] font-mono">{strategy.timeline}</span>
                        </div>
                        <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] py-1">
                          <span>Risk Red.</span>
                          <span className="text-[var(--ink)] font-mono">{strategy.riskReduction}%</span>
                        </div>
                        <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] py-1">
                          <span>Complexity</span>
                          <span className="text-[var(--ink)] font-mono">L{Math.ceil(Math.random() * 5)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => implementStrategy(strategy)}
                        disabled={isImplemented || !canAfford || isSimulating}
                        className={`w-full py-1.5 rounded text-[11px] font-bold uppercase tracking-[0.05em] transition-colors ${
                          isImplemented 
                            ? 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] cursor-default border border-[rgba(34,197,94,0.3)]'
                            : !canAfford
                              ? 'bg-[var(--border)] text-[var(--ink-dim)] cursor-not-allowed'
                              : 'bg-[rgba(249,115,22,0.1)] hover:bg-[rgba(249,115,22,0.2)] text-[var(--accent)] border border-[rgba(249,115,22,0.3)]'
                        }`}
                      >
                        {isImplemented ? 'Implemented' : !canAfford ? 'Insufficient Budget' : 'Implement Strategy'}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
