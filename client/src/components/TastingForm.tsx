'use client'

import * as React from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Box } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TastingFormProps {
  onSubmit: (scores: { aroma: number; body: number; aftertaste: number }) => void
  settings: {
    method: string;
    coffee: number;
    water_ratio: number;
  }
}

const ScoreButton = ({ 
  score, 
  selected, 
  onClick 
}: { 
  score: number; 
  selected: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-8 h-8 rounded flex items-center justify-center text-sm transition-colors",
      selected
        ? "bg-[#333333] text-white"
        : "text-[#888888] hover:bg-[#2a2a2a] hover:text-[#f0f0f0]"
    )}
  >
    {score}
  </button>
);

export function TastingForm({ onSubmit, settings }: TastingFormProps) {
  const [scores, setScores] = React.useState({
    aroma: 0,
    body: 0,
    aftertaste: 0
  });

  const handleScore = (type: keyof typeof scores, score: number) => {
    setScores(prev => ({ ...prev, [type]: score }));
  };

  const getAverageScore = () => {
    const total = scores.aroma + scores.body + scores.aftertaste;
    return Math.round((total / 3) * 10) / 10;
  };

  const ScoreRow = ({ label, type }: { label: string; type: keyof typeof scores }) => (
    <div className="grid grid-cols-[95px_1fr] gap-y-0.5 py-0.5">
      <div className="text-[#888888] text-sm">{label}</div>
      <div className="flex justify-end gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <ScoreButton
            key={score}
            score={score}
            selected={scores[type] === score}
            onClick={() => handleScore(type, score)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Card className="bg-[#1e1e1e] rounded-md p-3">
      <div className="flex items-center gap-2 text-[#bbbbbb] py-1 mb-2">
        <Box className="w-3 h-3 text-[#888888]" />
        <span className="text-sm font-normal">Summary</span>
        <span className="text-[#888888] text-[0.7rem] ml-1">
          {settings.method} | {settings.coffee}g | {settings.coffee * settings.water_ratio}ml
        </span>
        <span className="ml-auto text-[0.7rem] text-[#A3E635]">{getAverageScore()}/10</span>
      </div>

      <ScoreRow label="Aroma" type="aroma" />
      <ScoreRow label="Body" type="body" />
      <ScoreRow label="Aftertaste" type="aftertaste" />

      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => onSubmit(scores)}
          variant="outline"
          className="text-xs"
          disabled={!scores.aroma || !scores.body || !scores.aftertaste}
        >
          Save Tasting Notes
        </Button>
      </div>
    </Card>
  );
}
