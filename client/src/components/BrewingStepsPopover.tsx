
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
import { cn } from "@/lib/utils"

interface BrewingStep {
  step: string
  amount: string
  time: string
}

interface Props {
  method: string
  steps: BrewingStep[]
  onUpdate: (index: number, field: keyof BrewingStep, value: string) => void
  queryClient?: any
}

const StepInput = ({ 
  label, 
  value, 
  onChange,
  placeholder
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-[#bbbbbb]">
      {label}
    </Label>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "bg-[#2a2a2a] border-[#333333] text-[#f0f0f0]",
        "focus:border-[#444444] focus:ring-[#444444]"
      )}
    />
  </div>
);

export function BrewingStepsPopover({ method, steps, onUpdate }: Props) {
  const [localSteps, setLocalSteps] = React.useState(steps)

  React.useEffect(() => {
    setLocalSteps(steps)
  }, [steps])

  const handleValueChange = (index: number, field: keyof BrewingStep, value: string) => {
    const newSteps = [...localSteps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setLocalSteps(newSteps)
    onUpdate(index, field, value)
  }

  const getFieldPlaceholder = (field: keyof BrewingStep, stepName: string) => {
    switch (field) {
      case 'amount':
        return stepName === 'Steep' ? 'Wait' : 'Enter amount (ml)'
      case 'time':
        return 'Enter time (e.g. 30s, 4min)'
      default:
        return ''
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-[#cccccc] hover:text-white focus:outline-none">
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333333] text-[#f0f0f0] p-4">
        <div className="space-y-4">
          {localSteps.map((step, index) => (
            <div key={`${step.step}-${index}`} className="space-y-4 pb-4 border-b border-[#333333]">
              <h3 className="text-sm font-medium text-[#f0f0f0]">{step.step}</h3>
              <StepInput
                label="Amount"
                value={step.amount}
                onChange={(value) => handleValueChange(index, 'amount', value)}
                placeholder={getFieldPlaceholder('amount', step.step)}
              />
              <StepInput
                label="Time"
                value={step.time}
                onChange={(value) => handleValueChange(index, 'time', value)}
                placeholder={getFieldPlaceholder('time', step.step)}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
