"use client";

import * as React from "react";
import { Shield, Zap, Settings2, Sparkles } from "lucide-react";
import { TastingForm } from "@/components/TastingForm";
import { toast } from "sonner";
import { SettingsSelector } from "@/components/SettingsSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrewing } from "@/context/BrewingContext";
import {
  useStartBrewing,
  useUpdateSettings,
  useUpdateSteps,
  useUpdateTasting,
} from "@/lib/brewing";
import { useState } from "react";
import { MethodSelector } from "@/components/MethodSelector";
import { BeanSelector } from "@/components/BeanSelector";
import { BrewingSteps } from "@/components/BrewingSteps";
import { useLocation } from "wouter";

// Types
type BrewingMethod = "V60" | "Espresso" | "French Press";

interface BrewingStep {
  step: string;
  amount: string | number;
  time: string | number;
}

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string | React.ReactNode;
  status?: React.ReactNode;
  statusColor?: string;
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

// Helper Components
const SectionHeader = ({
  icon,
  title,
  status,
  statusColor = "text-[#888888]",
}: SectionHeaderProps) => (
  <div className="flex items-center gap-2 text-[#bbbbbb] py-1">
    {icon && (
      <span className="relative bottom-[1px] text-[0.75rem]">{icon}</span>
    )}
    <span className="text-sm font-normal">{title}</span>
    {status && (
      <span className={`ml-auto text-[0.7rem] ${statusColor}`}>{status}</span>
    )}
  </div>
);

const DetailRow = ({
  label,
  value,
  valueClass = "text-[#cccccc]",
}: DetailRowProps) => (
  <div className="grid grid-cols-[95px_1fr] gap-y-0.5 py-0.5">
    <div className="text-[#888888] text-sm">{label}</div>
    <div className={`text-sm text-right ${valueClass}`}>{value}</div>
  </div>
);

// Main Component
export default function BrewingPage() {
  const { brewingId, setBrewingId, currentStep, setCurrentStep } = useBrewing();
  const startBrewing = useStartBrewing();
  const updateSettings = useUpdateSettings(brewingId || "");
  const updateSteps = useUpdateSteps(brewingId || "");
  const updateTasting = useUpdateTasting(brewingId || "");
  const [, setLocation] = useLocation();

  // State
  const [isMethodSelectorOpen, setMethodSelectorOpen] = useState(false);
  const [isBeanSelectorOpen, setIsBeanSelectorOpen] = useState(false);
  const [isSettingsSelectorOpen, setSettingsSelectorOpen] = useState(false);
  const [isBrewingStepsOpen, setBrewingStepsOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>("");
  const [stepErrors, setStepErrors] = useState<Record<string, boolean>>({});
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    bean: "/ethiopian/washed/natural/coffee-zen",
    method: "V60",
    settings: {
      coffee: 18,
      water_ratio: 16,
      grind_size: "medium",
      water_temp: 92,
    },
    brewingMethods: {
      V60: {
        coffee: 18,
        water_ratio: 16,
        grind_size: "medium",
        water_temp: 92,
      },
      Espresso: {
        coffee: 18,
        water_ratio: 2,
        grind_size: "fine",
        water_temp: 92,
      },
      "French Press": {
        coffee: 30,
        water_ratio: 15,
        grind_size: "coarse",
        water_temp: 95,
      },
    },
  });

  // Handlers
  const handleStart = async () => {
    try {
      const result = await startBrewing.mutateAsync();
      setBrewingId(result.brewingId);
      setStartTime(new Date().toLocaleString());
      setCurrentStep(1);

      toast.success("Brewing started successfully", {
        duration: 2000,
        className: "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
      });
    } catch (error) {
      toast.error("Failed to start brewing", {
        duration: 4000,
        className: "bg-[#1e1e1e] border-[#333333] text-red-500",
      });
    }
  };

  const formatBrewingSteps = (
    method: BrewingMethod,
    steps: any,
  ): BrewingStep[] => {
    if (method === "Espresso") {
      return [
        {
          step: "Shot",
          amount: steps?.shot
            ? steps.shot.split(" / ")[0].replace("ml", "")
            : "0",
          time: steps?.shot ? steps.shot.split(" / ")[1].replace("s", "") : "0",
        },
      ];
    }
    return steps?.brewing || [];
  };

  const handleBrewingStepUpdate = async (
    index: number,
    field: keyof BrewingStep,
    value: string | number,
    method: BrewingMethod,
  ) => {
    try {
      await updateSettings.mutateAsync({ 
        bean: settings.bean,
        method: settings.method,
        settings: settings.settings
      });

      if (method === "Espresso") {
        const currentShot = updateSteps.data?.steps?.shot || "0ml / 0s";
        const [currentAmount, currentTime] = currentShot.split(" / ");

        const newShot =
          field === "amount"
            ? `${value}ml / ${currentTime}`
            : `${currentAmount} / ${value}s`;

        await updateSteps.mutateAsync({
          ...updateSteps.data,
          steps: {
            ...updateSteps.data?.steps,
            shot: newShot,
          },
        });
      } else {
        const newSteps = [...(updateSteps.data?.steps?.brewing || [])];
        newSteps[index] = {
          ...newSteps[index],
          [field]: value,
        };

        await updateSteps.mutateAsync({
          ...updateSteps.data,
          steps: {
            ...updateSteps.data?.steps,
            brewing: newSteps,
          },
        });
      }

      setStepErrors((prev) => ({
        ...prev,
        [`${index}-${field}`]: false,
      }));

      toast.success("Step updated successfully", {
        duration: 2000,
        className: "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
      });
    } catch (error) {
      setStepErrors((prev) => ({
        ...prev,
        [`${index}-${field}`]: true,
      }));

      toast.error("Failed to update step", {
        duration: 4000,
        className: "bg-[#1e1e1e] border-[#333333] text-red-500",
      });
    }
  };

  const renderBrewingSteps = () => {
    const formattedSteps = formatBrewingSteps(
      settings.method as BrewingMethod,
      updateSteps.data?.steps,
    );

    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {formattedSteps.map((step, index) => (
            <div
              key={`${step.step}-${index}`}
              className="flex items-center gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
              <span className="text-[#cccccc]">
                {step.step} | {step.amount}/{step.time}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setBrewingStepsOpen(true)}
          className="text-[#cccccc] hover:text-white focus:outline-none"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <BrewingSteps
          isOpen={isBrewingStepsOpen}
          onClose={() => setBrewingStepsOpen(false)}
          method={settings.method as BrewingMethod}
          steps={formattedSteps}
          onUpdate={(index, field, value) =>
            handleBrewingStepUpdate(
              index,
              field,
              value,
              settings.method as BrewingMethod,
            )
          }
        />
      </div>
    );
  };

  // Render initial step
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#f0f0f0] p-4 font-mono text-sm">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleStart}
            className="w-full text-left hover:bg-[#1e1e1e] rounded transition-colors duration-200 px-2"
          >
            <SectionHeader
              title="Start Brewing"
              icon={
                <div className="w-1.5 h-1.5 rounded-full bg-[#888888] transition-colors duration-300" />
              }
            />
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-[#121212] text-[#f0f0f0] p-4 font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Brewing Started Section */}
        <SectionHeader
          title="Brewing started"
          status={startTime}
          icon={
            <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635] transition-colors duration-300" />
          }
        />

        {/* Settings Card */}
        <Card className="bg-[#1e1e1e] rounded-md p-3">
          <DetailRow label="Brewing ID" value={brewingId} />
          <DetailRow
            label="Bean"
            value={
              <>
                <button
                  onClick={() => setIsBeanSelectorOpen(true)}
                  className="text-[#cccccc] hover:text-white focus:outline-none break-all text-right"
                >
                  {settings.bean}
                </button>
                <BeanSelector
                  isOpen={isBeanSelectorOpen}
                  onClose={() => setIsBeanSelectorOpen(false)}
                  onSelect={async (path) => {
                    setSettings((prev) => ({ ...prev, bean: path }));
                    await updateSettings.mutateAsync({
                      ...settings,
                      bean: path,
                    });
                  }}
                />
              </>
            }
          />
          <DetailRow
            label="Method"
            value={
              <>
                <button
                  onClick={() => setMethodSelectorOpen(true)}
                  className="text-[#cccccc] hover:text-white focus:outline-none"
                >
                  {settings.method}
                </button>
                <MethodSelector
                  isOpen={isMethodSelectorOpen}
                  onClose={() => setMethodSelectorOpen(false)}
                  onSelect={(method) => {
                    setSettings((prev) => ({
                      ...prev,
                      method,
                      settings: {
                        coffee: prev.brewingMethods[method].coffee,
                        water_ratio: prev.brewingMethods[method].water_ratio,
                        grind_size: prev.brewingMethods[method].grind_size,
                        water_temp: prev.brewingMethods[method].water_temp,
                      },
                    }));
                    setMethodSelectorOpen(false);
                  }}
                />
              </>
            }
          />
          <DetailRow
            label="Settings"
            value={
              <div className="flex items-center gap-4">
                <span className="truncate text-[#cccccc]">
                  {`[coffee, ${settings.settings.coffee}], [water_ratio, ${settings.settings.water_ratio}], [grind_size, ${settings.settings.grind_size}], [water_temp, ${settings.settings.water_temp}]`}
                </span>
                <button
                  onClick={() => setSettingsSelectorOpen(true)}
                  className="text-[#cccccc] hover:text-white focus:outline-none"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <SettingsSelector
                  isOpen={isSettingsSelectorOpen}
                  onClose={() => setSettingsSelectorOpen(false)}
                  settings={settings.settings}
                  onUpdate={(newSettings) => {
                    setSettings((prev) => ({ ...prev, settings: newSettings }));
                  }}
                />
              </div>
            }
            valueClass="truncate text-[#cccccc]"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={async () => {
                try {
                  await updateSettings.mutateAsync(settings);
                  await updateSteps.mutateAsync();
                  setCurrentStep(2);
                  toast.success("Settings updated successfully", {
                    duration: 2000,
                    className: "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
                  });
                } catch (error) {
                  toast.error("Failed to update settings", {
                    duration: 4000,
                    className: "bg-[#1e1e1e] border-[#333333] text-red-500",
                  });
                }
              }}
              variant="outline"
              className="text-xs"
            >
              Update Settings
            </Button>
          </div>
        </Card>

        {currentStep >= 2 && (
          <>
            <SectionHeader
              icon={<Shield className="w-3 h-3 text-[#888888]" />}
              title="Recommendation"
              status={
                <button
                  onClick={() => {
                    if (updateSettings.data?.recommendation?.message) {
                      toast(updateSettings.data.recommendation.message, {
                        duration: 4000,
                        className:
                          "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
                      });
                    }
                  }}
                  className={`bg-[#333333] px-1 rounded ${
                    updateSettings.data?.recommendation?.status === "Allowed"
                      ? "text-[#A3E635] hover:text-[#bef264]"
                      : "text-red-500 hover:text-red-400"
                  } hover:bg-[#444444] transition-colors cursor-pointer`}
                  title="Click to see recommendation details"
                >
                  {updateSettings.data?.recommendation?.status || "Pending"}
                </button>
              }
            />

            <Card className="bg-[#1e1e1e] rounded-md p-3">
              <SectionHeader
                icon={<Zap className="w-3 h-3 text-[#888888]" />}
                title="Brewing steps"
                status={
                  <span className="bg-[#333333] px-1 rounded text-[#A3E635]">
                    200
                  </span>
                }
              />

              {updateSteps.data?.steps && (
                <>
                  {settings.method === "V60" && (
                    <>
                      <DetailRow
                        label="Rinse"
                        value={updateSteps.data.steps.rinse}
                      />
                      <DetailRow
                        label="Add Coffee"
                        value={updateSteps.data.steps.addCoffee}
                      />
                      <DetailRow label="Brewing" value={renderBrewingSteps()} />
                      <DetailRow
                        label="Dripping"
                        value={updateSteps.data.steps.dripping}
                      />
                      <DetailRow
                        label="Final Brew"
                        value={updateSteps.data.steps.finalBrew}
                      />
                    </>
                  )}

                  {settings.method === "French Press" && (
                    <>
                      <DetailRow
                        label="Add Coffee"
                        value={updateSteps.data.steps.addCoffee}
                      />
                      <DetailRow label="Brewing" value={renderBrewingSteps()} />
                      <DetailRow
                        label="Plunge"
                        value={updateSteps.data.steps.plunge}
                      />
                      <DetailRow
                        label="Final Brew"
                        value={updateSteps.data.steps.finalBrew}
                      />
                    </>
                  )}

                  {settings.method === "Espresso" && (
                    <>
                      <DetailRow
                        label="Prep"
                        value={updateSteps.data.steps.prep}
                      />
                      <DetailRow
                        label="Grind"
                        value={updateSteps.data.steps.grind}
                      />
                      <DetailRow
                        label="Tamp"
                        value={updateSteps.data.steps.tamp}
                      />
                      <DetailRow label="Shot" value={renderBrewingSteps()} />
                      <DetailRow
                        label="Final Brew"
                        value={updateSteps.data.steps.finalBrew}
                      />
                    </>
                  )}
                </>
              )}

              <div className="mt-2">
                <div className="text-[#888888] text-sm mb-1">
                  Share your Brew
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 hover:bg-[#2a2a2a] rounded px-2 py-1 transition-colors"
                >
                  <div className="text-[0.6rem] bg-[#333333] text-[#bbbbbb] px-1.5 py-0.5 rounded">
                    BEAN IT
                  </div>
                  <div className="text-[#cccccc] break-all">
                    brewise.coffee.com/ptoni
                  </div>
                  <div className="flex items-center gap-1 sm:ml-auto mt-2 sm:mt-0">
                    <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                    <span className="text-[#888888] text-[0.7rem]">68ms</span>
                    <div className="w-6 h-[0.2rem] bg-[#A3E635]/50 rounded-full" />
                  </div>
                </button>
              </div>
            </Card>
          </>
        )}

        {currentStep >= 3 && (
          <>
            <SectionHeader
              title="Tasting"
              icon={<div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />}
            />

            <TastingForm
              settings={{
                method: settings.method,
                coffee: settings.settings.coffee,
                water_ratio: settings.settings.water_ratio,
              }}
              onSubmit={async (scores) => {
                try {
                  await updateTasting.mutateAsync(scores);
                  toast("Tasting notes saved successfully", {
                    duration: 4000,
                    className: "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
                  });
                  setCurrentStep(4);
                  setLocation("/history");
                } catch (error) {
                  toast.error("Failed to save tasting notes", {
                    duration: 4000,
                    className: "bg-[#1e1e1e] border-[#333333] text-red-500",
                  });
                }
              }}
            />
          </>
        )}

        {currentStep >= 4 && (
          <SectionHeader
            title="Brewing finished"
            icon={<div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />}
          />
        )}
      </div>
    </div>
  );
}