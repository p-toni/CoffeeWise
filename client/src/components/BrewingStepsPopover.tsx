"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

interface BrewingStepSettings {
  step: string;
  amount: string;
  time: string;
}

interface Props {
  method: string;
  steps: BrewingStepSettings[];
  onUpdate: (index: number, field: keyof BrewingStepSettings, value: string) => void;
  queryClient?: any;
}

export function BrewingStepsPopover({ method, steps, onUpdate, queryClient }: Props) {
  const [open, setOpen] = React.useState(false);
  const [localSteps, setLocalSteps] = React.useState(steps);

  React.useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const handleValueChange = async (
    index: number,
    field: keyof BrewingStepSettings,
    value: string,
  ) => {
    const newSteps = [...localSteps];
    if (field === "amount") {
      const numericValue = value.replace(/\D/g, "");
      newSteps[index] = { ...newSteps[index], [field]: `${numericValue}ml` };
    } else {
      newSteps[index] = { ...newSteps[index], [field]: value };
    }
    setLocalSteps(newSteps);
    await onUpdate(index, field, newSteps[index][field]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Settings2 className="w-4 h-4 text-[#888888] hover:text-[#cccccc] transition-colors cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333333] text-[#cccccc]">
        <div className="grid gap-4">
          <div className="space-y-2">
            {localSteps.map((step, index) => (
              <div key={`${step.step}-${index}`} className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Label htmlFor={`amount-${index}`}>
                      {step.step} Amount
                    </Label>
                    <Input
                      id={`amount-${index}`}
                      value={step.amount.replace("ml", "")}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleValueChange(index, "amount", newValue);
                      }}
                      type="number"
                      className="h-8 bg-[#2a2a2a] border-[#333333] pr-8 mt-1"
                    />
                    <span className="absolute right-3 top-[60%] -translate-y-1/2 text-[#888888]">
                      ml
                    </span>
                  </div>
                  <div>
                    <Label htmlFor={`time-${index}`}>{step.step} Time</Label>
                    <Input
                      id={`time-${index}`}
                      value={step.time}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleValueChange(index, "time", newValue);
                      }}
                      className="h-8 bg-[#2a2a2a] border-[#333333] mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
