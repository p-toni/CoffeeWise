"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrewingStep {
  step: string;
  amount: string;
  time: string;
}

interface Props {
  method: string;
  steps: BrewingStep[];
  onUpdate: (index: number, field: keyof BrewingStep, value: string) => void;
}

const StepInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) => (
  <Input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className={cn(
      "bg-transparent border-zinc-600 text-zinc-200 placeholder:text-zinc-400",
      "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-500",
    )}
  />
);

export function BrewingStepsPopover({ method, steps, onUpdate }: Props) {
  const [localSteps, setLocalSteps] = React.useState(steps);

  React.useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const handleValueChange = (
    index: number,
    field: keyof BrewingStep,
    value: string,
  ) => {
    const newSteps = [...localSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setLocalSteps(newSteps);
    onUpdate(index, field, value);
  };

  const getFieldPlaceholder = (field: keyof BrewingStep, stepName: string) => {
    if (method === 'Espresso' && stepName === 'Shot') {
      return field === 'amount' ? 'Amount (ml)' : 'Time (s)';
    }
    switch (field) {
      case "amount":
        return stepName === "Steep" ? "Wait" : "Amount (ml)";
      case "time":
        return "Time (e.g. 30s, 4min)";
      default:
        return "";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-zinc-400 hover:text-zinc-200 focus:outline-none">
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 bg-zinc-800 border-zinc-700 text-zinc-200 p-3 rounded-md shadow-lg"
      >
        <div className="space-y-3">
          {localSteps.map((step, index) => (
            <div
              key={`${step.step}-${index}`}
              className="space-y-2 pb-3 border-b border-zinc-700 last:border-0 last:pb-0"
            >
              <h3 className="text-sm font-medium text-zinc-200">{step.step}</h3>
              <div className="grid grid-cols-2 gap-2">
                <StepInput
                  value={step.amount}
                  onChange={(value) =>
                    handleValueChange(index, "amount", value)
                  }
                  placeholder={getFieldPlaceholder("amount", step.step)}
                />
                <StepInput
                  value={step.time}
                  onChange={(value) => handleValueChange(index, "time", value)}
                  placeholder={getFieldPlaceholder("time", step.step)}
                />
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
