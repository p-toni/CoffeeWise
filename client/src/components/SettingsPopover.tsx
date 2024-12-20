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

interface BrewingSettings {
  coffee: number
  water_ratio: number
  grind_size: string
  water_temp: number
}

interface SettingsPopoverProps {
  settings: BrewingSettings
  onUpdate: (settings: BrewingSettings) => void
}

const InputWithLabel = ({ 
  label, 
  id, 
  value, 
  min, 
  max, 
  onChange,
  unit = "",
  prefix = ""
}: { 
  label: string
  id: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  unit?: string
  prefix?: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm text-[#bbbbbb]">
      {label}
    </Label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value)
          if (!isNaN(newValue) && newValue > 0) {
            onChange(newValue)
          }
        }}
        className={cn(
          "bg-[#2a2a2a] border-[#333333] text-[#f0f0f0]",
          "focus:border-[#444444] focus:ring-[#444444]",
          "text-right pr-8",
          prefix && "pl-7"
        )}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">
          {unit}
        </span>
      )}
    </div>
  </div>
);

export function SettingsPopover({ settings, onUpdate }: SettingsPopoverProps) {
  const [localSettings, setLocalSettings] = React.useState(settings)

  const handleSettingChange = (key: keyof BrewingSettings, value: number | string) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onUpdate(newSettings)
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
          <InputWithLabel
            label="Coffee Amount"
            id="coffee"
            value={localSettings.coffee}
            onChange={(value) => handleSettingChange('coffee', value)}
            unit="g"
          />

          <InputWithLabel
            label="Water Ratio"
            id="ratio"
            value={localSettings.water_ratio}
            onChange={(value) => handleSettingChange('water_ratio', value)}
            prefix="1:"
          />

          <InputWithLabel
            label="Water Temperature"
            id="temp"
            value={localSettings.water_temp}
            onChange={(value) => handleSettingChange('water_temp', value)}
            unit="°C"
          />

          <div className="space-y-2">
            <Label htmlFor="grind" className="text-sm text-[#bbbbbb]">
              Grind Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {['fine', 'medium', 'coarse'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSettingChange('grind_size', size)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded transition-colors",
                    localSettings.grind_size === size
                      ? "bg-[#333333] text-white"
                      : "text-[#888888] hover:bg-[#2a2a2a] hover:text-[#f0f0f0]"
                  )}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
