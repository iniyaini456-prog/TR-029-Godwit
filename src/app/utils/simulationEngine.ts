// Supply Chain Simulation Engine

import {
  SupplyChainNode,
  SupplyChainEdge,
  DisruptionEvent,
  ResilienceStrategy,
} from '../data/mockData';

import mlData from '../data/ml_predictions.json';
import logisticsData from '../data/ml_logistics_predictions.json';
import climateData from '../data/ml_climate_predictions.json';
import geopoliticsData from '../data/ml_geopolitics_predictions.json';

export interface NetworkMetrics {
  totalNodes: number;
  totalEdges: number;
  avgLeadTime: number;
  networkReliability: number;
  totalCapacity: number;
  criticalPathLength: number;
}

export interface DisruptionImpact {
  disruptionId: string;
  disruptionName: string;
  recoveryTime: number;
  financialImpact: number;
  operationalImpact: number;
  serviceLevelDegradation: number;
  affectedProducts: number;
  cascadeEffects: string[];
}

export function getDynamicEdgeReliability(edge: SupplyChainEdge, nodes: SupplyChainNode[]): number {
  const sourceNode = nodes.find(n => n.id === edge.source);
  if (!sourceNode) return edge.reliability;
  
  // Throttle base reliability using the Phase 1 Macro-Logistics Anomaly AI Model
  const logisticsScore = (logisticsData as any)?.country_reliability?.[sourceNode.country]?.reliability_multiplier;
  if (logisticsScore) {
    return edge.reliability * logisticsScore;
  }
  return edge.reliability;
}

export function calculateNetworkMetrics(
  nodes: SupplyChainNode[],
  edges: SupplyChainEdge[]
): NetworkMetrics {
  const avgLeadTime = edges.reduce((sum, e) => sum + e.leadTime, 0) / edges.length;
  // Use ML-driven Edge Reliability instead of static
  const avgReliability = edges.reduce((sum, e) => sum + getDynamicEdgeReliability(e, nodes), 0) / edges.length;
  const totalCapacity = nodes.reduce((sum, n) => sum + n.capacity, 0);
  
  // Calculate critical path (simplified - longest path through network)
  const criticalPathLength = Math.max(...edges.map(e => e.leadTime)) * 4; // Approximate across tiers
  
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    avgLeadTime: Math.round(avgLeadTime),
    networkReliability: Math.round(avgReliability * 100) / 100,
    totalCapacity,
    criticalPathLength,
  };
}

// Helper: Calculate varied lead time using ML Variance
function getVariedLeadTime(baseTime: number): number {
  // Pull historical variance from ML model, fallback to 30% bounds
  const mlVariance = mlData?.historical_variance || 0.3;
  const variation = (Math.random() - 0.5) * mlVariance; 
  return Math.round(baseTime * (1 + variation));
}

// Helper: Get full cascade impact using BFS (multi-hop tracking)
function getFullCascadeImpact(
  initialNodeIds: string[],
  allEdges: SupplyChainEdge[]
): { cascadeNodes: string[]; cascadeLevels: Map<string, number> } {
  const affected = new Set(initialNodeIds);
  const cascadeLevels = new Map<string, number>();
  initialNodeIds.forEach(id => cascadeLevels.set(id, 0));
  
  const queue: { nodeId: string; level: number }[] = initialNodeIds.map(id => ({ nodeId: id, level: 0 }));
  
  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    
    allEdges.forEach(edge => {
      if (edge.source === nodeId && !affected.has(edge.target)) {
        affected.add(edge.target);
        cascadeLevels.set(edge.target, level + 1);
        queue.push({ nodeId: edge.target, level: level + 1 });
      }
    });
  }
  
  return {
    cascadeNodes: Array.from(affected),
    cascadeLevels,
  };
}

// Helper: Calculate revenue loss by node type (tiered approach)
function calculateRevenuePerUnit(nodeType: string, baseRevenuePerUnit: number = 150): number {
  const tierMultiplier: Record<string, number> = {
    supplier: 0.8,
    factory: 1.5,
    dc: 1.2,
    retailer: 2.5,
  };
  return baseRevenuePerUnit * (tierMultiplier[nodeType] || 1);
}

export function simulateDisruption(
  disruption: DisruptionEvent,
  nodes: SupplyChainNode[],
  edges: SupplyChainEdge[]
): DisruptionImpact {
  // Calculate affected capacity and nodes
  const affectedNodes = nodes.filter(n => disruption.affectedNodes.includes(n.id));
  const lostCapacity = affectedNodes.reduce((sum, n) => sum + n.capacity, 0);
  
  // Calculate cascade effects using BFS (multi-hop tracking)
  const { cascadeNodes, cascadeLevels } = getFullCascadeImpact(disruption.affectedNodes, edges);
  const cascadeEffects = cascadeNodes.filter(id => !disruption.affectedNodes.includes(id));
  
  // Calculate recovery time based on disruption duration and network complexity
  const networkComplexity = cascadeNodes.length / nodes.length;
  const recoveryTime = Math.round(
    disruption.duration * (1 + networkComplexity * 0.5)
  );
  
  // Calculate financial impact using tiered revenue loss
  const dailyRevenueLoss = affectedNodes.reduce((sum, node) => {
    const revenuePerUnit = calculateRevenuePerUnit(node.type);
    return sum + node.capacity * revenuePerUnit;
  }, 0);
  const financialImpact = dailyRevenueLoss * recoveryTime;
  
  // Calculate operational impact (0-100 scale)
  const operationalImpact = Math.min(
    100,
    (disruption.impactScore * (lostCapacity / 10000)) * 0.8
  );
  
  // Service level degradation
  const serviceLevelDegradation = Math.min(
    100,
    disruption.impactScore * (affectedNodes.length / nodes.length) * 100
  );
  
  // Affected products estimation
  const affectedProducts = Math.round(lostCapacity * disruption.probability);
  
  return {
    disruptionId: disruption.id,
    disruptionName: disruption.name,
    recoveryTime,
    financialImpact,
    operationalImpact: Math.round(operationalImpact),
    serviceLevelDegradation: Math.round(serviceLevelDegradation),
    affectedProducts,
    cascadeEffects,
  };
}

export function evaluateStrategy(
  strategy: ResilienceStrategy,
  baselineImpact: DisruptionImpact,
  budget: number
): {
  feasible: boolean;
  newRecoveryTime: number;
  newFinancialImpact: number;
  netBenefit: number;
  roi: number;
  serviceLevelGain: number;
} {
  const feasible = strategy.cost <= budget;
  
  // Apply strategy benefits
  const newRecoveryTime = Math.max(
    0,
    baselineImpact.recoveryTime - strategy.recoveryTimeReduction
  );
  
  const recoveryImprovement = 
    (baselineImpact.recoveryTime - newRecoveryTime) / baselineImpact.recoveryTime;
  
  const newFinancialImpact = 
    baselineImpact.financialImpact * (1 - recoveryImprovement * 0.7);
  
  const savings = baselineImpact.financialImpact - newFinancialImpact;
  const netBenefit = savings - strategy.cost;
  const roi = (savings / strategy.cost) * 100;
  
  return {
    feasible,
    newRecoveryTime: Math.round(newRecoveryTime),
    newFinancialImpact: Math.round(newFinancialImpact),
    netBenefit: Math.round(netBenefit),
    roi: Math.round(roi * 10) / 10,
    serviceLevelGain: strategy.serviceLevelImprovement,
  };
}

export function findParetoOptimalStrategies(
  strategies: ResilienceStrategy[],
  disruptions: DisruptionEvent[],
  nodes: SupplyChainNode[],
  edges: SupplyChainEdge[],
  budget: number
): ResilienceStrategy[] {
  // Calculate average impact across all disruptions
  const impacts = disruptions.map(d => simulateDisruption(d, nodes, edges));
  
  const avgImpact: DisruptionImpact = {
    disruptionId: 'avg',
    disruptionName: 'Average Scenario',
    recoveryTime: Math.round(
      impacts.reduce((sum, i) => sum + i.recoveryTime, 0) / impacts.length
    ),
    financialImpact: Math.round(
      impacts.reduce((sum, i) => sum + i.financialImpact, 0) / impacts.length
    ),
    operationalImpact: Math.round(
      impacts.reduce((sum, i) => sum + i.operationalImpact, 0) / impacts.length
    ),
    serviceLevelDegradation: Math.round(
      impacts.reduce((sum, i) => sum + i.serviceLevelDegradation, 0) / impacts.length
    ),
    affectedProducts: Math.round(
      impacts.reduce((sum, i) => sum + i.affectedProducts, 0) / impacts.length
    ),
    cascadeEffects: [],
  };
  
  // Evaluate all strategies
  const evaluatedStrategies = strategies.map(strategy => ({
    strategy,
    evaluation: evaluateStrategy(strategy, avgImpact, budget),
  }));
  
  // Filter feasible and sort by ROI
  const paretoStrategies = evaluatedStrategies
    .filter(s => s.evaluation.feasible && s.evaluation.roi > 100)
    .sort((a, b) => b.evaluation.roi - a.evaluation.roi)
    .slice(0, 5)
    .map(s => s.strategy);
  
  return paretoStrategies;
}

export function runMonteCarlo(
  disruptions: DisruptionEvent[],
  nodes: SupplyChainNode[],
  edges: SupplyChainEdge[],
  iterations: number = 1000
): {
  expectedRecoveryTime: number;
  expectedFinancialImpact: number;
  confidenceInterval95: { min: number; max: number };
  riskDistribution: { range: string; probability: number }[];
} {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Randomly select disruption based on dynamically altered ML probability
    const random = Math.random();
    let cumulativeProb = 0;
    let selectedDisruption = disruptions[0];
    
    for (const disruption of disruptions) {
      // Modulate base probability by the real-time ML forecasts (Climate + Geopolitics)
      let combinedMultiplier = 1.0;
      
      if (disruption.affectedRegions && disruption.affectedRegions.length > 0) {
        let maxClimateRisk = 1.0;
        let maxGeoRisk = 1.0;
        
        disruption.affectedRegions.forEach(region => {
           const climate = (climateData as any)?.climate_predictions?.[region];
           if (climate) maxClimateRisk = Math.max(maxClimateRisk, climate.disruption_probability_multiplier);
           
           const geo = (geopoliticsData as any)?.geopolitical_predictions?.[region];
           if (geo) maxGeoRisk = Math.max(maxGeoRisk, geo.disruption_probability_multiplier);
        });
        combinedMultiplier = maxClimateRisk * maxGeoRisk;
      }

      // Add baseline XGBoost variance shifts 
      const xgbShift = mlData?.mean_delay_probability ? (mlData.mean_delay_probability) : 0;
      
      // Final compounded probability shift
      const mlProbabilityShift = (disruption.probability * combinedMultiplier) + (disruption.probability * xgbShift);
      cumulativeProb += mlProbabilityShift;

      if (random <= cumulativeProb) {
        selectedDisruption = disruption;
        break;
      }
    }
    
    // Apply lead time variability to edges for this iteration
    const variedEdges = edges.map(edge => ({
      ...edge,
      leadTime: getVariedLeadTime(edge.leadTime),
    }));
    
    const impact = simulateDisruption(selectedDisruption, nodes, variedEdges);
    results.push(impact.financialImpact);
  }
  
  results.sort((a, b) => a - b);
  
  const avg = results.reduce((sum, r) => sum + r, 0) / results.length;
  const min95 = results[Math.floor(iterations * 0.025)];
  const max95 = results[Math.floor(iterations * 0.975)];
  
  // Create risk distribution
  const buckets = 5;
  const maxImpact = Math.max(...results);
  const bucketSize = maxImpact / buckets;
  const distribution = Array(buckets).fill(0);
  
  results.forEach(r => {
    const bucketIndex = Math.min(buckets - 1, Math.floor(r / bucketSize));
    distribution[bucketIndex]++;
  });
  
  const riskDistribution = distribution.map((count, i) => ({
    range: `$${((i * bucketSize) / 1000000).toFixed(1)}M - $${(((i + 1) * bucketSize) / 1000000).toFixed(1)}M`,
    probability: Math.round((count / iterations) * 100),
  }));
  
  return {
    expectedRecoveryTime: 0,
    expectedFinancialImpact: Math.round(avg),
    confidenceInterval95: { min: Math.round(min95), max: Math.round(max95) },
    riskDistribution,
  };
}
