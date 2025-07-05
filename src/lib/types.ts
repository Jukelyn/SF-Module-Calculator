export type ModuleType = "speed" | "efficiency" | "productivity";
export type ApplicationType = "machines" | "generators";

export interface ModuleTierEntry {
  id: string;
  amount: number;
  tier: number;
}

export interface CalculatedStats {
  processingSpeed?: number;
  energyProduction?: number;
  energyConsumption?: number;
  productWaste?: number;
}

export interface SpeedProductivityStats {
  processingSpeed: number;
  energyConsumption: number;
  energyProduction: number;
  productWaste: number;
}

export interface EfficiencyStats {
  energyConsumption: number;
  energyProduction: number;
}

export type ModuleStats = {
  speed: SpeedProductivityStats[];
  efficiency: EfficiencyStats[];
  productivity: SpeedProductivityStats[];
};
