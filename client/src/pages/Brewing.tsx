'use client'

import { Shield, Box, Zap } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBrewing } from "@/context/BrewingContext"
import { useStartBrewing, useUpdateSettings, useUpdateSteps, useUpdateTasting } from "@/lib/brewing"
import { useState } from "react"
import { MethodSelector } from "@/components/MethodSelector"
import { BeanSelector } from "@/components/BeanSelector"

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
    setCurrentStep(1);
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#f0f0f0] p-4 font-mono text-sm">
        <div className="max-w-3xl mx-auto">
          <Button onClick={handleStart}>Start Brewing</Button>
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
          status={new Date().toLocaleString()}
          icon={<div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />}
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
                onSelect={(path) => {
                  setSettings(prev => ({ ...prev, bean: path }));
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
            value={`[coffee, ${settings.settings.coffee}] / [water_ratio, ${settings.settings.water_ratio}] / [grind_size, ${settings.settings.grind_size}] / [water_temp, ${settings.settings.water_temp}]`} 
            valueClass="truncate text-[#cccccc]" 
          />
          <div className="mt-3 flex justify-end">
            <Button 
              onClick={async () => {
                await updateSettings.mutateAsync(settings);
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
                <span 
                  className={`bg-[#333333] px-1 rounded ${
                    updateSettings.data?.recommendation?.status === "Allowed" 
                      ? "text-[#A3E635]" 
                      : "text-red-500"
                  }`}
                >
                  {updateSettings.data?.recommendation?.status || "Pending"}
                </span>
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

              <DetailRow label="Rinse" value="/Pour hot water through the filter. /Discard the rinse water." />
              <DetailRow label="Add Coffee" value="/Place the coffee into the filter. /Gently shake the dripper to level." />
              <DetailRow
                label="Brewing"
                value={
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                    <span className="text-[#cccccc]">Bloom | 45ml/30s</span>
                    <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                    <span className="text-[#cccccc]">First Pour | 105ml/120s</span>
                    <div className="w-1 h-1 rounded-full bg-[#A3E635]" />
                    <span className="text-[#cccccc]">Second Pour | 100ml/80s</span>
                  </div>
                }
              />
              <DetailRow label="Dripping" value="30s" />
              <DetailRow label="Final Brew" value="240ml / 180s" />
            </Card>
          </>
        )}

        {currentStep >= 3 && (
          <>
            <SectionHeader
              title="Tasting"
              icon={<div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />}
            />

            <Card className="bg-[#1e1e1e] rounded-md p-3">
              <SectionHeader
                icon={<Box className="w-3 h-3 text-[#888888]" />}
                title={
                  <div className="flex items-center gap-1">
                    <span>Summary</span>
                    <span className="text-[#888888] text-[0.7rem]">V60 | 18g | 200ml</span>
                  </div>
                }
                status={<span className="text-[#A3E635]">6/10</span>}
              />
              <DetailRow label="Aroma" value="5/10" />
              <DetailRow label="Body" value="7/10" />
              <DetailRow label="Aftertaste" value="9/10" />
            </Card>
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
