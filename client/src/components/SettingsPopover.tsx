'use client'

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Settings2 } from "lucide-react"

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
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333333] text-[#f0f0f0]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coffee">Coffee (g)</Label>
            <Slider
              id="coffee"
              min={12}
              max={30}
              step={1}
              value={[localSettings.coffee]}
              onValueChange={(value) => handleSettingChange('coffee', value[0])}
              className="w-full"
            />
            <div className="text-right text-sm text-[#888888]">{localSettings.coffee}g</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratio">Water Ratio (1:{localSettings.water_ratio})</Label>
            <Slider
              id="ratio"
              min={14}
              max={18}
              step={1}
              value={[localSettings.water_ratio]}
              onValueChange={(value) => handleSettingChange('water_ratio', value[0])}
              className="w-full"
            />
            <div className="text-right text-sm text-[#888888]">1:{localSettings.water_ratio}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp">Water Temperature (°C)</Label>
            <Slider
              id="temp"
              min={85}
              max={96}
              step={1}
              value={[localSettings.water_temp]}
              onValueChange={(value) => handleSettingChange('water_temp', value[0])}
              className="w-full"
            />
            <div className="text-right text-sm text-[#888888]">{localSettings.water_temp}°C</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grind">Grind Size</Label>
            <div className="grid grid-cols-3 gap-2">
              {['fine', 'medium', 'coarse'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSettingChange('grind_size', size)}
                  className={`px-3 py-1.5 text-sm rounded ${
                    localSettings.grind_size === size
                      ? 'bg-[#333333] text-white'
                      : 'hover:bg-[#2a2a2a] text-[#888888]'
                  }`}
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
