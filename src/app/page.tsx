"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  ApplicationType,
  ModuleType,
  ModuleTierEntry,
  CalculatedStats,
} from "@/lib/types";

export default function ModuleCalculator() {
  // State for modules, grouped by module type
  const [modules, setModules] = useState<Record<ModuleType, ModuleTierEntry[]>>(
    {
      speed: [{ id: "speed", amount: 0, tier: 1 }],
      efficiency: [{ id: "efficiency", amount: 0, tier: 1 }],
      productivity: [{ id: "productivity", amount: 0, tier: 1 }],
    }
  );

  // State for application type (machines or generators)
  const [application, setApplication] = useState<ApplicationType>("machines");

  // State for results
  const [results, setResults] = useState<CalculatedStats | null>(null);

  // To add a new module for a given type
  const addTierEntry = (modType: ModuleType) => {
    const newId = `${modType}-${Date.now()}`;
    setModules((prev) => ({
      ...prev,
      [modType]: [...prev[modType], { id: newId, amount: 0, tier: 1 }],
    }));
  };

  // Remove a module by type and id
  const removeTierEntry = (type: ModuleType, id: string) => {
    setModules((prev) => ({
      ...prev,
      [type]: prev[type].filter((entry) => entry.id !== id),
    }));
  };

  // Handle changes to module amounts or tiers
  const handleModuleChange = (
    modType: ModuleType,
    id: string,
    field: "amount" | "tier",
    value: string
  ) => {
    const numValue = Math.max(0, Number.parseInt(value) || 0);
    const maxTier = field === "tier" ? 40 : Number.POSITIVE_INFINITY;

    setModules((prev) => ({
      ...prev,
      [modType]: prev[modType].map((entry) =>
        entry.id === id
          ? { ...entry, [field]: Math.min(numValue, maxTier) }
          : entry
      ),
    }));
  };

  const calculateStats = useCallback(() => {
    let totalStats: CalculatedStats = {
      energyConsumption: 0,
      processingSpeed: 0,
      energyProduction: 0,
      productWaste: 0,
    };
    // TODO: Implement

    // Get all modules and conert them to tier 1 equivs
    const convertModules = () => {
      //  # of tier 1 = amount * 2^(tier - 1)
      const tier1Counts: Record<ModuleType, number> = {
        speed: 0,
        efficiency: 0,
        productivity: 0,
      };

      Object.entries(modules).forEach(([moduleType, moduleEntries]) => {
        moduleEntries.forEach((entry) => {
          const tier1Equivalent = entry.amount * entry.tier;
          tier1Counts[moduleType as ModuleType] += tier1Equivalent;
        });
      });

      return tier1Counts;
    };

    const numModTier1 = convertModules();

    // Formulas:
    //
    // Processing Speed: 1 + S - 0.25P
    // Energy Consumption (Machines):  (1 + 2\*S + 0.5\*P) \* (0.85^E)
    // Energy Production (Generator) : (1 + 0.5E) \* (0.9^S) \* (0.8^P)
    // Product Waste: (0.1S)\*(0.75^P)

    totalStats = {
      processingSpeed: Math.max(
        0,
        1 + numModTier1["speed"] - 0.25 * numModTier1["productivity"]
      ),
      energyConsumption:
        application === "machines"
          ? Math.max(
              0,
              (1 +
                2 * numModTier1["speed"] +
                0.5 * numModTier1["productivity"]) *
                Math.pow(0.85, numModTier1["efficiency"])
            )
          : 0,
      energyProduction:
        application === "generators"
          ? Math.max(
              0,
              (1 + 0.5 * numModTier1["efficiency"]) *
                (Math.round(Math.pow(0.9, numModTier1["speed"]) * 1000) /
                  1000) *
                Math.pow(0.8, numModTier1["productivity"])
            )
          : 0,
      productWaste: Math.max(
        0,
        100 -
          Math.round(
            10 *
              numModTier1["speed"] *
              ((Math.pow(0.75, numModTier1["productivity"]) * 1000) / 1000)
          )
      ),
    };

    setResults(totalStats);
  }, [modules, application]);

  useEffect(() => {
    // Only recalculate if results have been calculated before
    if (
      Object.values(modules)
        .flat()
        .some((entry) => entry.amount > 0)
    ) {
      calculateStats();
    }
  }, [application, modules, calculateStats]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold mb-2 text-white">
            Module Upgrade Calculator
          </h1>
          <p className="text-center text-gray-400">
            Calculate the combined effects of your upgrade modules
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Selection */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Application Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="[&_[role=radiogroup]]:text-white">
                  <RadioGroup
                    value={application}
                    onValueChange={(value) => {
                      setApplication(value as ApplicationType);
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="machines" id="machines" />
                      <Label htmlFor="machines" className="text-gray-200">
                        Machines
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="generators" id="generators" />
                      <Label htmlFor="generators" className="text-gray-200">
                        Generators
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
            <p className="flex justify-center text-gray-600">
              A maximum of 9 modules are allowed at a time.
            </p>
            {/* Module Inputs for each type */}
            {Object.entries(modules).map(([type, entries]) => (
              <Card key={type} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="capitalize">{type} Modules</CardTitle>
                  {/* New module entry button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTierEntry(type as ModuleType)}
                    className="flex items-center gap-2"
                    disabled={
                      Object.values(modules)
                        .flat()
                        .reduce((sum, entry) => sum + entry.amount, 0) >= 9
                    }
                    title={
                      Object.values(modules)
                        .flat()
                        .reduce((sum, entry) => sum + entry.amount, 0) >= 9
                        ? "Maximum of 9 modules allowed"
                        : undefined
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Inputs for each module */}
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 border border-gray-600 rounded-lg bg-gray-750"
                    >
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        {/* Amount input */}
                        <div className="space-y-2">
                          <Label
                            htmlFor={`${entry.id}-amount`}
                            className="text-gray-200"
                          >
                            Amount
                          </Label>
                          <Input
                            id={`${entry.id}-amount`}
                            type="integer"
                            min="0"
                            max={
                              entry.amount +
                              Math.max(
                                0,
                                9 -
                                  Object.values(modules)
                                    .flat()
                                    .reduce(
                                      (sum, e) =>
                                        sum +
                                        (e.id === entry.id ? 0 : e.amount),
                                      0
                                    )
                              )
                            }
                            value={entry.amount}
                            onChange={(e) => {
                              // Ensure total modules do not exceed 9
                              const totalOther = Object.values(modules)
                                .flat()
                                .reduce(
                                  (sum, e) =>
                                    sum + (e.id === entry.id ? 0 : e.amount),
                                  0
                                );

                              const val = Math.max(
                                0,
                                Math.min(
                                  Number(e.target.value) || 0,
                                  9 - totalOther
                                )
                              );

                              handleModuleChange(
                                type as ModuleType,
                                entry.id,
                                "amount",
                                String(val)
                              );
                            }}
                            placeholder="0"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                          />
                        </div>

                        {/* Tier input */}
                        <div className="space-y-2">
                          <Label
                            htmlFor={`${entry.id}-tier`}
                            className="text-gray-200"
                          >
                            Tier (1-40)
                          </Label>
                          <Input
                            id={`${entry.id}-tier`}
                            type="integer"
                            min="1"
                            max="40"
                            value={entry.tier}
                            onChange={(e) =>
                              handleModuleChange(
                                type as ModuleType,
                                entry.id,
                                "tier",
                                e.target.value
                              )
                            }
                            placeholder="1"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                          />
                        </div>
                      </div>

                      {/* Remove entry button (if more than one entry) */}
                      {entries.length > 1 && (
                        <div className="h-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeTierEntry(type as ModuleType, entry.id)
                            }
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Calculated Results Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Calculated Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Application: {application}
                </p>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-3">
                    {/* Show each stat if defined */}
                    {results.processingSpeed !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Processing Speed:</span>
                        <span className="font-mono text-white">
                          {Math.round(results.processingSpeed * 100)}%
                        </span>
                      </div>
                    )}

                    {application === "machines" &&
                      results.energyConsumption !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">
                            Energy Consumption:
                          </span>
                          <span className="font-mono text-white">
                            {Math.round(results.energyConsumption * 100)}%
                          </span>
                        </div>
                      )}

                    {application === "generators" &&
                      results.energyProduction !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">
                            Energy Production:
                          </span>
                          <span className="font-mono text-white">
                            {Math.round(results.energyProduction * 100)}%
                          </span>
                        </div>
                      )}

                    {application === "machines" &&
                      results.productWaste !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Productivity:</span>
                          <span className="font-mono text-white">
                            {results.productWaste}%
                          </span>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Populate the modules to see this update.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Modules Summary Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Module Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary for each module type */}
                  {Object.entries(modules).map(([type, entries]) => (
                    <div key={type}>
                      <h4 className="font-medium capitalize mb-2">{type}:</h4>
                      <div className="space-y-1 ml-2">
                        {/* List tiers and total amount for each */}
                        {Object.entries(
                          entries
                            .filter((entry) => entry.amount > 0)
                            .reduce<Record<number, number>>((acc, entry) => {
                              acc[entry.tier] =
                                (acc[entry.tier] || 0) + entry.amount;
                              return acc;
                            }, {})
                        )
                          .sort(
                            ([tierA], [tierB]) => Number(tierA) - Number(tierB)
                          )
                          .map(([tier, totalAmount]) => (
                            <div
                              key={tier}
                              className="flex justify-between text-sm"
                            >
                              <span>Tier {tier}:</span>
                              <span>{totalAmount}x</span>
                            </div>
                          ))}

                        {/* Show "No modules" if none */}
                        {entries.filter((entry) => entry.amount > 0).length ===
                          0 && (
                          <div className="text-sm text-gray-500">
                            No modules
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
