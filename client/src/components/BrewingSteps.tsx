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

// Define strict types for step values
type StepValue = string | number;

// Define allowed brewing methods
type BrewingMethod = "Espresso" | "Pour Over" | "French Press";

interface BrewingStep {
  step: string;
  amount: StepValue;
  time: StepValue;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  method: BrewingMethod;
  steps: BrewingStep[];
  onUpdate: (index: number, field: keyof BrewingStep, value: StepValue) => void;
}

// Input validation functions
const validateAmount = (
  value: string,
  method: BrewingMethod,
  step: string,
): boolean => {
  if (step === "Steep") return true;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return false;

  if (method === "Espresso") {
    return numValue >= 0 && numValue <= 100; // Reasonable ml range for espresso
  }
  return numValue >= 0 && numValue <= 1000; // Reasonable ml range for other methods
};

const validateTime = (value: string): boolean => {
  // Accept formats like "30s", "4min", "2:30"
  const timePattern = /^(\d+)(:\d{1,2})?(?:s|min)?$/;
  return timePattern.test(value);
};

const StepInput: React.FC<{
  value: StepValue;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
  type?: "amount" | "time";
}> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  type,
}) => (
  <Input
    type="text"
    value={value.toString()}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className={cn(
      "bg-[#2a2a2a] border-[#333333] text-[#f0f0f0]",
      "focus:border-[#444444] focus:ring-[#444444]",
      "placeholder:text-[#666666]",
      error && "border-red-500",
    )}
    aria-invalid={error}
    aria-label={`${type} input`}
  />
);

export function BrewingSteps({
  isOpen,
  onClose,
  method,
  steps,
  onUpdate,
}: Props) {
  const [localSteps, setLocalSteps] = React.useState<BrewingStep[]>(steps);
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});

  // Reset local state when props change
  React.useEffect(() => {
    setLocalSteps(steps);
    setErrors({});
  }, [steps, method]);

  const handleValueChange = (
    index: number,
    field: keyof BrewingStep,
    value: string,
  ) => {
    // Validate input before updating
    const isValid =
      field === "amount"
        ? validateAmount(value, method, localSteps[index].step)
        : field === "time"
          ? validateTime(value)
          : true;

    setErrors((prev) => ({
      ...prev,
      [`${index}-${field}`]: !isValid,
    }));

    if (isValid) {
      const newSteps = [...localSteps];
      newSteps[index] = {
        ...newSteps[index],
        [field]: field === "amount" && value !== "" ? parseFloat(value) : value,
      };
      setLocalSteps(newSteps);
      onUpdate(index, field, newSteps[index][field]);
    }
  };

  const getFieldPlaceholder = (
    field: keyof BrewingStep,
    stepName: string,
  ): string => {
    if (method === "Espresso" && stepName === "Shot") {
      return field === "amount" ? "Amount (ml)" : "Time (s)";
    }

    const placeholders: Record<keyof BrewingStep, Record<string, string>> = {
      amount: {
        Steep: "Wait",
        default: "Amount (ml)",
      },
      time: {
        default: "Time (e.g. 30s, 4min)",
      },
      step: {
        default: "",
      },
    };

    return placeholders[field][stepName] || placeholders[field].default || "";
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
              <h3 className="text-sm font-medium text-[#f0f0f0]">
                {step.step}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <StepInput
                  value={step.amount}
                  onChange={(value) =>
                    handleValueChange(index, "amount", value)
                  }
                  placeholder={getFieldPlaceholder("amount", step.step)}
                  error={errors[`${index}-amount`]}
                  type="amount"
                />
                <StepInput
                  value={step.time}
                  onChange={(value) => handleValueChange(index, "time", value)}
                  placeholder={getFieldPlaceholder("time", step.step)}
                  error={errors[`${index}-time`]}
                  type="time"
                />
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
