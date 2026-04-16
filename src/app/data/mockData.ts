// Supply Chain Data Models and Mock Data

export interface SupplyChainNode {
  id: string;
  name: string;
  type: 'supplier' | 'factory' | 'dc' | 'retailer';
  location: string;
  country: string;
  capacity: number;
  cost: number;
  tier: number;
}

export interface SupplyChainEdge {
  source: string;
  target: string;
  leadTime: number; // days
  capacity: number;
  cost: number;
  reliability: number; // 0-1
}

export interface BOMItem {
  id: string;
  name: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  supplier: string;
  quantity: number;
  unitCost: number;
}

export interface DisruptionEvent {
  id: string;
  name: string;
  type: 'port_closure' | 'material_shortage' | 'geopolitical' | 'natural_disaster' | 'pandemic' | 'cyber_attack';
  probability: number; // 0-1
  impactScore: number; // 0-100
  duration: number; // days
  affectedNodes: string[];
  affectedRegions: string[];
  historicalOccurrences: number;
  date?: string;
}

export interface ResilienceStrategy {
  id: string;
  name: string;
  type: 'buffer_stock' | 'diversification' | 'nearshoring' | 'dual_sourcing' | 'vertical_integration';
  cost: number;
  serviceLevelImprovement: number; // percentage
  recoveryTimeReduction: number; // days
  roi: number;
  implementation: string;
}

export interface SimulationResult {
  scenario: string;
  recoveryTime: number;
  financialImpact: number;
  operationalImpact: number;
  serviceLevelDegradation: number;
  affectedProducts: number;
}

// Mock Supply Chain Network
export const supplyChainNodes: SupplyChainNode[] = [
  // Tier 3 - Raw Material Suppliers
  { id: 'S1', name: 'Lithium Mining Co.', type: 'supplier', location: 'Santiago', country: 'Chile', capacity: 10000, cost: 50000, tier: 3 },
  { id: 'S2', name: 'Rare Earth Materials Ltd.', type: 'supplier', location: 'Shenzhen', country: 'China', capacity: 8000, cost: 45000, tier: 3 },
  { id: 'S3', name: 'Steel Works AG', type: 'supplier', location: 'Dortmund', country: 'Germany', capacity: 15000, cost: 40000, tier: 3 },
  { id: 'S4', name: 'Polymer Solutions Inc.', type: 'supplier', location: 'Houston', country: 'USA', capacity: 12000, cost: 38000, tier: 3 },
  
  // Tier 2 - Component Manufacturers
  { id: 'C1', name: 'Battery Tech Corp', type: 'supplier', location: 'Seoul', country: 'South Korea', capacity: 5000, cost: 80000, tier: 2 },
  { id: 'C2', name: 'Electronics Assembly Co.', type: 'supplier', location: 'Taipei', country: 'Taiwan', capacity: 6000, cost: 75000, tier: 2 },
  { id: 'C3', name: 'Precision Parts GmbH', type: 'supplier', location: 'Munich', country: 'Germany', capacity: 4500, cost: 70000, tier: 2 },
  { id: 'C4', name: 'Component Systems Ltd.', type: 'supplier', location: 'Bangalore', country: 'India', capacity: 5500, cost: 65000, tier: 2 },
  
  // Tier 1 - Assembly Factories
  { id: 'F1', name: 'Main Assembly Plant', type: 'factory', location: 'Shanghai', country: 'China', capacity: 2000, cost: 200000, tier: 1 },
  { id: 'F2', name: 'Secondary Assembly', type: 'factory', location: 'Monterrey', country: 'Mexico', capacity: 1500, cost: 180000, tier: 1 },
  { id: 'F3', name: 'EU Manufacturing Hub', type: 'factory', location: 'Prague', country: 'Czech Republic', capacity: 1200, cost: 190000, tier: 1 },
  
  // Distribution Centers
  { id: 'D1', name: 'Asia Pacific DC', type: 'dc', location: 'Singapore', country: 'Singapore', capacity: 8000, cost: 120000, tier: 0 },
  { id: 'D2', name: 'North America DC', type: 'dc', location: 'Memphis', country: 'USA', capacity: 10000, cost: 130000, tier: 0 },
  { id: 'D3', name: 'Europe DC', type: 'dc', location: 'Rotterdam', country: 'Netherlands', capacity: 7000, cost: 125000, tier: 0 },
  
  // Retailers
  { id: 'R1', name: 'US Retail Network', type: 'retailer', location: 'Various', country: 'USA', capacity: 15000, cost: 0, tier: 0 },
  { id: 'R2', name: 'EU Retail Network', type: 'retailer', location: 'Various', country: 'EU', capacity: 12000, cost: 0, tier: 0 },
  { id: 'R3', name: 'APAC Retail Network', type: 'retailer', location: 'Various', country: 'APAC', capacity: 18000, cost: 0, tier: 0 },
];

export const supplyChainEdges: SupplyChainEdge[] = [
  // Raw materials to components
  { source: 'S1', target: 'C1', leadTime: 14, capacity: 5000, cost: 2000, reliability: 0.85 },
  { source: 'S2', target: 'C1', leadTime: 10, capacity: 3000, cost: 1800, reliability: 0.90 },
  { source: 'S2', target: 'C2', leadTime: 7, capacity: 4000, cost: 1500, reliability: 0.92 },
  { source: 'S3', target: 'C3', leadTime: 5, capacity: 4500, cost: 1200, reliability: 0.95 },
  { source: 'S4', target: 'C4', leadTime: 12, capacity: 5000, cost: 1600, reliability: 0.88 },
  
  // Components to factories
  { source: 'C1', target: 'F1', leadTime: 21, capacity: 2000, cost: 3500, reliability: 0.87 },
  { source: 'C2', target: 'F1', leadTime: 18, capacity: 2000, cost: 3200, reliability: 0.89 },
  { source: 'C3', target: 'F3', leadTime: 8, capacity: 1200, cost: 2800, reliability: 0.93 },
  { source: 'C4', target: 'F2', leadTime: 28, capacity: 1500, cost: 3800, reliability: 0.82 },
  { source: 'C1', target: 'F2', leadTime: 35, capacity: 1000, cost: 4200, reliability: 0.80 },
  
  // Factories to DCs
  { source: 'F1', target: 'D1', leadTime: 14, capacity: 2000, cost: 2500, reliability: 0.91 },
  { source: 'F1', target: 'D2', leadTime: 28, capacity: 1500, cost: 4500, reliability: 0.85 },
  { source: 'F2', target: 'D2', leadTime: 7, capacity: 1500, cost: 1800, reliability: 0.94 },
  { source: 'F3', target: 'D3', leadTime: 10, capacity: 1200, cost: 2200, reliability: 0.92 },
  
  // DCs to retailers
  { source: 'D1', target: 'R3', leadTime: 7, capacity: 8000, cost: 1200, reliability: 0.96 },
  { source: 'D2', target: 'R1', leadTime: 5, capacity: 10000, cost: 1000, reliability: 0.97 },
  { source: 'D3', target: 'R2', leadTime: 6, capacity: 7000, cost: 1100, reliability: 0.96 },
];

export const billOfMaterials: BOMItem[] = [
  { id: 'BOM1', name: 'Lithium-Ion Battery Pack', criticality: 'critical', supplier: 'C1', quantity: 1, unitCost: 450 },
  { id: 'BOM2', name: 'Main Control Board', criticality: 'critical', supplier: 'C2', quantity: 1, unitCost: 280 },
  { id: 'BOM3', name: 'Display Module', criticality: 'high', supplier: 'C2', quantity: 1, unitCost: 120 },
  { id: 'BOM4', name: 'Aluminum Chassis', criticality: 'high', supplier: 'C3', quantity: 1, unitCost: 85 },
  { id: 'BOM5', name: 'Polymer Casing', criticality: 'medium', supplier: 'C4', quantity: 2, unitCost: 35 },
  { id: 'BOM6', name: 'Connector Assembly', criticality: 'medium', supplier: 'C4', quantity: 8, unitCost: 12 },
  { id: 'BOM7', name: 'Cooling System', criticality: 'high', supplier: 'C3', quantity: 1, unitCost: 95 },
  { id: 'BOM8', name: 'Power Management IC', criticality: 'critical', supplier: 'C2', quantity: 1, unitCost: 65 },
];

export const disruptionScenarios: DisruptionEvent[] = [
  {
    id: 'D1',
    name: 'Shanghai Port Closure',
    type: 'port_closure',
    probability: 0.15,
    impactScore: 85,
    duration: 21,
    affectedNodes: ['F1', 'D1'],
    affectedRegions: ['China', 'Singapore'],
    historicalOccurrences: 3,
    date: '2024-08-15'
  },
  {
    id: 'D2',
    name: 'Chile Lithium Export Restriction',
    type: 'geopolitical',
    probability: 0.22,
    impactScore: 92,
    duration: 180,
    affectedNodes: ['S1', 'C1'],
    affectedRegions: ['Chile', 'South Korea'],
    historicalOccurrences: 2,
    date: '2023-11-20'
  },
  {
    id: 'D3',
    name: 'Taiwan Semiconductor Shortage',
    type: 'material_shortage',
    probability: 0.35,
    impactScore: 95,
    duration: 120,
    affectedNodes: ['C2', 'F1'],
    affectedRegions: ['Taiwan'],
    historicalOccurrences: 5,
    date: '2024-02-10'
  },
  {
    id: 'D4',
    name: 'European Energy Crisis',
    type: 'natural_disaster',
    probability: 0.28,
    impactScore: 78,
    duration: 90,
    affectedNodes: ['S3', 'C3', 'F3', 'D3'],
    affectedRegions: ['Germany', 'Czech Republic', 'Netherlands'],
    historicalOccurrences: 4,
    date: '2024-01-05'
  },
  {
    id: 'D5',
    name: 'US-China Trade Tariffs',
    type: 'geopolitical',
    probability: 0.45,
    impactScore: 82,
    duration: 365,
    affectedNodes: ['F1', 'S2', 'C1', 'C2'],
    affectedRegions: ['China', 'USA'],
    historicalOccurrences: 8,
    date: '2023-06-01'
  },
  {
    id: 'D6',
    name: 'Mumbai Port Congestion',
    type: 'port_closure',
    probability: 0.38,
    impactScore: 65,
    duration: 45,
    affectedNodes: ['C4'],
    affectedRegions: ['India'],
    historicalOccurrences: 12,
    date: '2024-03-22'
  },
  {
    id: 'D7',
    name: 'Global Pandemic Wave',
    type: 'pandemic',
    probability: 0.12,
    impactScore: 98,
    duration: 180,
    affectedNodes: ['F1', 'F2', 'F3', 'D1', 'D2', 'D3'],
    affectedRegions: ['Global'],
    historicalOccurrences: 1,
    date: '2020-03-15'
  },
  {
    id: 'D8',
    name: 'Rotterdam Cyber Attack',
    type: 'cyber_attack',
    probability: 0.20,
    impactScore: 72,
    duration: 14,
    affectedNodes: ['D3'],
    affectedRegions: ['Netherlands'],
    historicalOccurrences: 2,
    date: '2024-05-08'
  },
  {
    id: 'D9',
    name: 'Mexico Cartel Violence',
    type: 'geopolitical',
    probability: 0.25,
    impactScore: 68,
    duration: 60,
    affectedNodes: ['F2'],
    affectedRegions: ['Mexico'],
    historicalOccurrences: 6,
    date: '2023-09-12'
  },
  {
    id: 'D10',
    name: 'South Korea Rare Earth Shortage',
    type: 'material_shortage',
    probability: 0.30,
    impactScore: 88,
    duration: 90,
    affectedNodes: ['C1'],
    affectedRegions: ['South Korea'],
    historicalOccurrences: 4,
    date: '2024-04-18'
  },
];

export const resilienceStrategies: ResilienceStrategy[] = [
  {
    id: 'RS1',
    name: 'Strategic Buffer Stock Program',
    type: 'buffer_stock',
    cost: 2500000,
    serviceLevelImprovement: 18,
    recoveryTimeReduction: 35,
    roi: 3.2,
    implementation: 'Maintain 90-day safety stock for critical components (batteries, control boards). Requires additional warehouse capacity of 15,000 sq ft.'
  },
  {
    id: 'RS2',
    name: 'Dual Sourcing for Critical Components',
    type: 'dual_sourcing',
    cost: 1800000,
    serviceLevelImprovement: 22,
    recoveryTimeReduction: 42,
    roi: 4.1,
    implementation: 'Establish secondary suppliers for BOM items with criticality ≥ high. Split orders 70/30 between primary and secondary.'
  },
  {
    id: 'RS3',
    name: 'Nearshore Manufacturing to Mexico',
    type: 'nearshoring',
    cost: 8500000,
    serviceLevelImprovement: 28,
    recoveryTimeReduction: 28,
    roi: 2.8,
    implementation: 'Expand Monterrey facility capacity by 50%. Reduce dependence on Shanghai plant for North American market.'
  },
  {
    id: 'RS4',
    name: 'Supplier Geographic Diversification',
    type: 'diversification',
    cost: 3200000,
    serviceLevelImprovement: 25,
    recoveryTimeReduction: 38,
    roi: 3.7,
    implementation: 'Add suppliers in Vietnam, Thailand, and Poland. Reduce single-country concentration from 45% to <25%.'
  },
  {
    id: 'RS5',
    name: 'Vertical Integration: Battery Production',
    type: 'vertical_integration',
    cost: 12000000,
    serviceLevelImprovement: 32,
    recoveryTimeReduction: 45,
    roi: 2.5,
    implementation: 'Acquire or build battery manufacturing capability. Eliminate dependency on external battery suppliers (C1).'
  },
  {
    id: 'RS6',
    name: 'Regional Distribution Hub Expansion',
    type: 'buffer_stock',
    cost: 4500000,
    serviceLevelImprovement: 15,
    recoveryTimeReduction: 22,
    roi: 3.0,
    implementation: 'Open additional DCs in Dallas, Frankfurt, and Tokyo. Reduce average delivery distance by 40%.'
  },
  {
    id: 'RS7',
    name: 'Multi-Modal Transport Diversification',
    type: 'diversification',
    cost: 1200000,
    serviceLevelImprovement: 12,
    recoveryTimeReduction: 18,
    roi: 3.5,
    implementation: 'Establish air freight and rail alternatives for critical shipments. Reduce single-port dependency.'
  },
];

export const budgetConstraints = {
  totalBudget: 15000000,
  serviceLevelTarget: 99.5,
  maxRecoveryTime: 30, // days
  currentServiceLevel: 96.2,
  currentAvgRecoveryTime: 62, // days
};
