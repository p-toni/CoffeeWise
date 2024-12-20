'use client'

import * as React from 'react'
import { Shield, Zap, Settings2 } from 'lucide-react'
import { TastingForm } from "@/components/TastingForm"
import { toast } from "sonner"
import { SettingsPopover } from "@/components/SettingsPopover"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBrewing } from "@/context/BrewingContext"
import { useStartBrewing, useUpdateSettings, useUpdateSteps, useUpdateTasting } from "@/lib/brewing"
import { useState } from "react"
import { MethodSelector } from "@/components/MethodSelector"
import { BeanSelector } from "@/components/BeanSelector"
import { BrewingStepsPopover } from "@/components/BrewingStepsPopover"

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string | React.ReactNode;
  status?: React.ReactNode;
  statusColor?: string;
}

const SectionHeader = ({ icon, title, status, statusColor = 'text-[#888888]' }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 text-[#bbbbbb] py-1">
    {icon && <span className="relative bottom-[1px] text-[0.75rem]">{icon}</span>}
    <span className="text-sm font-normal">{title}</span>
    {status && <span className={`ml-auto text-[0.7rem] ${statusColor}`}>{status}</span>}
  </div>
);

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

const DetailRow = ({ label, value, valueClass = 'text-[#cccccc]' }: DetailRowProps) => (
  <div className="grid grid-cols-[95px_1fr] gap-y-0.5 py-0.5">
    <div className="text-[#888888] text-sm">{label}</div>
    <div className={`text-sm text-right ${valueClass}`}>{value}</div>
  </div>
);

export default function BrewingPage() {
  const { brewingId, setBrewingId, currentStep, setCurrentStep } = useBrewing();
  const startBrewing = useStartBrewing();
  const updateSettings = useUpdateSettings(brewingId || "");
  const updateSteps = useUpdateSteps(brewingId || "");
  const [isMethodSelectorOpen, setMethodSelectorOpen] = useState(false);
  const updateTasting = useUpdateTasting(brewingId || "");
  const [isBeanSelectorOpen, setIsBeanSelectorOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>("");

  const [settings, setSettings] = useState({
    bean: "/ethiopian/washed/natural/coffee-zen",
    method: "V60",
    settings: {
      coffee: 18,
      water_ratio: 16,
      grind_size: "medium",
      water_temp: 92
    }
  });

  const handleStart = async () => {
    const result = await startBrewing.mutateAsync();
    setBrewingId(result.brewingId);
    setStartTime(new Date().toLocaleString());
    setCurrentStep(1);
  };

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
              icon={<div className="w-1.5 h-1.5 rounded-full bg-[#888888] transition-colors duration-300" />}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#f0f0f0] p-4 font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Request Started Section */}
        <SectionHeader
          title="Brewing started"
          status={startTime}
          icon={<div className="w-1.5 h-1.5 rounded-full bg-[#A3E635] transition-colors duration-300" />}
        />

        {/* Settings Card */}
        <Card className="bg-[#1e1e1e] rounded-md p-3">
          <DetailRow label="Brewing ID" value={brewingId} />
          <DetailRow label="Bean" value={
            <>
              <button 
                onClick={() => setIsBeanSelectorOpen(true)}
                className="text-[#cccccc] hover:text-white focus:outline-none"
              >
                {settings.bean}
              </button>
              <BeanSelector
                isOpen={isBeanSelectorOpen}
                onClose={() => setIsBeanSelectorOpen(false)}
                onSelect={async (path) => {
                  setSettings(prev => ({ ...prev, bean: path }));
                  const result = await updateSettings.mutateAsync({ ...settings, bean: path });
                  await updateSteps.mutateAsync();
                }}
              />
            </>
          } />
          <DetailRow label="Method" value={
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
                  setSettings(prev => ({ ...prev, method }));
                }}
              />
            </>
          } />
          <DetailRow 
            label="Settings" 
            value={
              <div className="flex items-center gap-4">
                <span className="truncate text-[#cccccc]">
                  {`[coffee, ${settings.settings.coffee}] / [water_ratio, ${settings.settings.water_ratio}] / [grind_size, ${settings.settings.grind_size}] / [water_temp, ${settings.settings.water_temp}]`}
                </span>
                <SettingsPopover
                  settings={settings.settings}
                  onUpdate={(newSettings) => {
                    setSettings(prev => ({ ...prev, settings: newSettings }));
                  }}
                />
              </div>
            }
            valueClass="truncate text-[#cccccc]"
          />
          <div className="mt-3 flex justify-end">
            <Button 
              onClick={async () => {
                const result = await updateSettings.mutateAsync(settings);
                // After settings are updated, update the brewing steps
                await updateSteps.mutateAsync();
                setCurrentStep(2);
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
                        className: "bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]",
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
              {updateSettings.data?.recommendation?.message && (
                <p className="text-sm text-[#cccccc] mb-3">
                  {updateSettings.data.recommendation.message}
                </p>
              )}
              <SectionHeader
                icon={<Zap className="w-3 h-3 text-[#888888]" />}
                title="Brewing steps"
                status={<span className="bg-[#333333] px-1 rounded text-[#A3E635]">200</span>}
              />

              {updateSteps.data?.steps && (
                <>
                  {settings.method === 'V60' && (
                    <>
                      <DetailRow label="Rinse" value={updateSteps.data.steps.rinse} />
                      <DetailRow label="Add Coffee" value={updateSteps.data.steps.addCoffee} />
                      <DetailRow
                        label="Brewing"
                        value={
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex items-center gap-1">
                              {updateSteps.data?.steps?.brewing?.map((step, index) => (
                                <React.Fragment key={`${step.step}-${index}`}>
                                  <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                                  <span className="text-[#cccccc]">{step.step} | {step.amount}/{step.time}</span>
                                </React.Fragment>
                              ))}
                            </div>
                            <BrewingStepsPopover
                              method={settings.method}
                              steps={updateSteps.data?.steps?.brewing || []}
                              onUpdate={async (newSteps) => {
                                const result = await updateSteps.mutateAsync({
                                  ...updateSteps.data,
                                  steps: {
                                    ...updateSteps.data?.steps,
                                    brewing: newSteps
                                  }
                                });
                              }}
                            />
                          </div>
                        }
                      />
                      <DetailRow label="Dripping" value={updateSteps.data.steps.dripping} />
                      <DetailRow label="Final Brew" value={updateSteps.data.steps.finalBrew} />
                    </>
                  )}
                  
                  {settings.method === 'French Press' && (
                    <>
                      <DetailRow label="Add Coffee" value={updateSteps.data.steps.addCoffee} />
                      <DetailRow
                        label="Brewing"
                        value={
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex items-center gap-1">
                              {updateSteps.data?.steps?.brewing?.map((step, index) => (
                                <React.Fragment key={`${step.step}-${index}`}>
                                  <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                                  <span className="text-[#cccccc]">{step.step} | {step.amount}/{step.time}</span>
                                </React.Fragment>
                              ))}
                            </div>
                            <BrewingStepsPopover
                              method={settings.method}
                              steps={updateSteps.data?.steps?.brewing || []}
                              onUpdate={async (newSteps) => {
                                const result = await updateSteps.mutateAsync({
                                  ...updateSteps.data,
                                  steps: {
                                    ...updateSteps.data?.steps,
                                    brewing: newSteps
                                  }
                                });
                              }}
                            />
                          </div>
                        }
                      />
                      <DetailRow label="Plunge" value={updateSteps.data.steps.plunge} />
                      <DetailRow label="Final Brew" value={updateSteps.data.steps.finalBrew} />
                    </>
                  )}
                  
                  {settings.method === 'Espresso' && (
                    <>
                      <DetailRow label="Prep" value={updateSteps.data.steps.prep} />
                      <DetailRow label="Grind" value={updateSteps.data.steps.grind} />
                      <DetailRow label="Tamp" value={updateSteps.data.steps.tamp} />
                      <DetailRow label="Shot" value={updateSteps.data.steps.shot} />
                      <DetailRow label="Final Brew" value={updateSteps.data.steps.finalBrew} />
                    </>
                  )}
                </>
              )}

              <div className="mt-2">
                <div className="text-[#888888] text-sm mb-1">External APIs</div>
                <button 
                  onClick={() => setCurrentStep(3)}
                  className="w-full flex items-center gap-2 hover:bg-[#2a2a2a] rounded px-2 py-1 transition-colors"
                >
                  <div className="text-[0.6rem] bg-[#333333] text-[#bbbbbb] px-1.5 py-0.5 rounded">BEAN</div>
                  <div className="text-[#cccccc]">brewise.coffee.com/ptoni</div>
                  <div className="flex items-center gap-1 ml-auto">
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