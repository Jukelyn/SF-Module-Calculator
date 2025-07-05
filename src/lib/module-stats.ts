import {
  SpeedProductivityStats,
  EfficiencyStats,
  ModuleStats,
} from "@/lib/types";

// Tiers should be handled by reducing them to the Tier 1 parts using
// # of Tier 1s = 2^(tier - 1)

const generateSpeedProductivityStats = (): SpeedProductivityStats[] => {
  return Array.from({ length: 40 }, () => ({
    processingSpeed: 0.0,
    energyConsumption: 0.0,
    energyProduction: 0.0,
    productWaste: 0.0,
  }));
};

const generateEfficiencyStats = (): EfficiencyStats[] => {
  return Array.from({ length: 40 }, () => ({
    energyConsumption: 0.0,
    energyProduction: 0.0,
  }));
};

export const moduleStats: ModuleStats = {
  speed: generateSpeedProductivityStats(),
  efficiency: generateEfficiencyStats(),
  productivity: generateSpeedProductivityStats(),
};
