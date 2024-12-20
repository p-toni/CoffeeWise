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
import { cn } from "@/lib/utils";

interface BrewingStepSettings {
  step: string;
  amount: string;
  time: string;
}

interface Props {
  method: string;
  steps: BrewingStepSettings[];
  onUpdate: (
    index: number,
    field: keyof BrewingStepSettings,
    value: string,
  ) => void;
  onClose?: () => void;
}

export function BrewingStepsPopover({ method, steps, onUpdate }: Props) {
  const [open, setOpen] = React.useState(false);
  const [localSteps, setLocalSteps] = React.useState(steps);

  React.useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const handleValueChange = (
    index: number,
    field: keyof BrewingStepSettings,
    value: string,
  ) => {
    const newSteps = localSteps.map((step, i) =>
      i === index
        ? {
            ...step,
            [field]:
              field === "amount" ? `${value.replace(/\D/g, "")}ml` : value,
          }
        : step,
    );
    setLocalSteps(newSteps);
    onUpdate(index, field, newSteps[index][field]);
  };

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) {
          onClose();
        }
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button className="text-[#cccccc] hover:text-white focus:outline-none">
          <Settings2 className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333333] text-[#cccccc] p-4 focus:outline-none">
        <div className="grid gap-4">
          <div className="space-y-2">
            {localSteps.map((step, index) => (
              <div key={`${step.step}-${index}`} className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Label
                      htmlFor={`amount-${index}`}
                      className="text-sm text-[#bbbbbb]"
                    >
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
                      className="h-8 bg-[#2a2a2a] border-[#333333] text-[#f0f0f0] pr-8 mt-1 focus:border-[#444444] focus:ring-[#444444] text-right"
                    />
                    <span className="absolute right-3 top-[60%] -translate-y-1/2 text-[#888888] text-sm">
                      ml
                    </span>
                  </div>
                  <div>
                    <Label
                      htmlFor={`time-${index}`}
                      className="text-sm text-[#bbbbbb]"
                    >
                      {step.step} Time
                    </Label>
                    <Input
                      id={`time-${index}`}
                      value={step.time}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleValueChange(index, "time", newValue);
                      }}
                      className="h-8 bg-[#2a2a2a] border-[#333333] text-[#f0f0f0] mt-1 focus:border-[#444444] focus:ring-[#444444]"
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
