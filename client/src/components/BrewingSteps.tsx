
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BrewingStep {
  step: string;
  amount: string;
  time: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
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
      "bg-[#2a2a2a] border-[#333333] text-[#f0f0f0]",
      "focus:border-[#444444] focus:ring-[#444444]",
      "placeholder:text-[#666666]"
    )}
  />
);

export function BrewingSteps({ isOpen, onClose, method, steps, onUpdate }: Props) {
  const [localSteps, setLocalSteps] = React.useState<BrewingStep[]>([]);
  const stepsRef = React.useRef(steps);

  React.useEffect(() => {
    if (stepsRef.current !== steps) {
      setLocalSteps(steps);
      stepsRef.current = steps;
    }
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-[#1e1e1e] text-[#f0f0f0] border-[#333333]">
        <SheetHeader>
          <SheetTitle className="text-[#f0f0f0]">Brewing Steps</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {localSteps.map((step, index) => (
            <div
              key={`${step.step}-${index}`}
              className="space-y-2 pb-4 border-b border-[#333333] last:border-0 last:pb-0"
            >
              <h3 className="text-sm font-medium text-[#f0f0f0]">{step.step}</h3>
              <div className="grid grid-cols-2 gap-2">
                <StepInput
                  value={step.amount}
                  onChange={(value) => handleValueChange(index, "amount", value)}
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
      </SheetContent>
    </Sheet>
  );
}
