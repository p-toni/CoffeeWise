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

interface BrewingSettings {
  coffee: number;
  water_ratio: number;
  grind_size: string;
  water_temp: number;
}

interface SettingsPopoverProps {
  settings: BrewingSettings;
  onUpdate: (settings: BrewingSettings) => void;
}

const InputWithAffix = ({
  id,
  value,
  min,
  max,
  onChange,
  unit = "",
  prefix = "",
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  prefix?: string;
}) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
        {prefix}
      </span>
    )}
    <Input
      id={id}
      type="number"
      value={value}
      onChange={(e) => {
        const newValue = Number(e.target.value);
        if (!isNaN(newValue) && newValue >= 0) {
          onChange(newValue);
        }
      }}
      className={cn(
        "bg-transparent border-zinc-600 text-zinc-200 placeholder:text-zinc-400",
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-500",
        "text-right pr-8",
        prefix && "pl-7",
      )}
    />
    {unit && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
        {unit}
      </span>
    )}
  </div>
);

export function SettingsPopover({ settings, onUpdate }: SettingsPopoverProps) {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSettingChange = (
    key: keyof BrewingSettings,
    value: number | string,
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-zinc-400 hover:text-zinc-200 focus:outline-none">
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        className="w-64 bg-zinc-800 border-zinc-700 text-zinc-200 p-3 rounded-md shadow-lg"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Coffee Amount
            </div>
            <InputWithAffix
              id="coffee"
              value={localSettings.coffee}
              onChange={(value) => handleSettingChange("coffee", value)}
              unit="g"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Water Ratio
            </div>
            <InputWithAffix
              id="ratio"
              value={localSettings.water_ratio}
              onChange={(value) => handleSettingChange("water_ratio", value)}
              prefix="1:"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Water Temperature
            </div>
            <InputWithAffix
              id="temp"
              value={localSettings.water_temp}
              onChange={(value) => handleSettingChange("water_temp", value)}
              unit="°C"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Grind Size
            </div>
            <div className="flex items-center gap-2">
              {["fine", "medium", "coarse"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSettingChange("grind_size", size)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    localSettings.grind_size === size
                      ? "bg-zinc-600 text-zinc-200"
                      : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
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
  );
}
