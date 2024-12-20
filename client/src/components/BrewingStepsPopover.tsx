
'use client'

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings2 } from "lucide-react"

interface BrewingStepSettings {
  step: string;
  amount: string;
  time: string;
}

interface Props {
  method: string;
  steps: BrewingStepSettings[];
  onUpdate: (newSteps: BrewingStepSettings[]) => void;
}

export function BrewingStepsPopover({ method, steps, onUpdate }: Props) {
  const [open, setOpen] = React.useState(false);
  const [localSteps, setLocalSteps] = React.useState(steps);

  const handleValueChange = (index: number, field: keyof BrewingStepSettings, value: string) => {
    const newSteps = [...localSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setLocalSteps(newSteps);
    onUpdate(newSteps);
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
                <Label htmlFor={`step-${index}`}>{step.step}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id={`amount-${index}`}
                    value={step.amount}
                    onChange={(e) => handleValueChange(index, 'amount', e.target.value)}
                    className="h-8 bg-[#2a2a2a] border-[#333333]"
                  />
                  <Input
                    id={`time-${index}`}
                    value={step.time}
                    onChange={(e) => handleValueChange(index, 'time', e.target.value)}
                    className="h-8 bg-[#2a2a2a] border-[#333333]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
