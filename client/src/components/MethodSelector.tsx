'use client'

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface MethodSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (method: string) => void
}

const BREWING_METHODS = [
  { id: 'V60', name: 'V60' },
  { id: 'Chemex', name: 'Chemex' },
  { id: 'AeroPress', name: 'AeroPress' },
  { id: 'French Press', name: 'French Press' },
  { id: 'Moka Pot', name: 'Moka Pot' },
  { id: 'Cold Brew', name: 'Cold Brew' },
];

export function MethodSelector({ isOpen, onClose, onSelect }: MethodSelectorProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-[#1e1e1e] text-[#f0f0f0] border-[#333333]">
        <SheetHeader>
          <SheetTitle className="text-[#f0f0f0]">Select Brewing Method</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <div className="space-y-1">
            {BREWING_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  onSelect(method.id);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded",
                  "text-sm text-left",
                  "hover:bg-[#2a2a2a]"
                )}
              >
                <Coffee className="w-4 h-4 text-[#888888]" />
                {method.name}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
