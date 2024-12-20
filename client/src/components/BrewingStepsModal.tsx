"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  onUpdate: (steps: BrewingStep[]) => Promise<void>;
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

export function BrewingStepsModal({ method, steps, onUpdate }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localSteps, setLocalSteps] = React.useState<BrewingStep[]>(steps);
  const [isSaving, setIsSaving] = React.useState(false);

  // Update local steps when props change and modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setLocalSteps(steps);
    }
  }, [steps, isOpen]);

  const handleValueChange = (
    index: number,
    field: keyof BrewingStep,
    value: string,
  ) => {
    const newSteps = [...localSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setLocalSteps(newSteps);
  };

  const handleSave = async () => {
    if (JSON.stringify(localSteps) === JSON.stringify(steps)) {
      setIsOpen(false);
      return; // No changes were made
    }

    try {
      setIsSaving(true);
      await onUpdate(localSteps);
      // Only close if the update was successful
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save brewing steps:', error);
      // Keep the modal open if there was an error
    } finally {
      setIsSaving(false);
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-zinc-400 hover:text-zinc-200 focus:outline-none">
          <Settings2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-800 border-zinc-700 text-zinc-200">
        <DialogHeader>
          <DialogTitle>Brewing Steps Configuration</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adjust the brewing steps parameters below. Changes will be saved when you click Save.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-zinc-600 hover:bg-zinc-500 text-zinc-200"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
