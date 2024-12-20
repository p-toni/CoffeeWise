'use client'

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ChevronRight, Folder, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeanSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

const BEAN_TREE = {
  ethiopian: {
    washed: {
      natural: {
        'coffee-zen': null,
        'morning-dew': null
      },
      'honey-process': {
        'sweet-harmony': null
      }
    },
    natural: {
      'berry-blast': null,
      'fruit-fusion': null
    }
  },
  colombian: {
    arabica: {
      'mountain-reserve': null,
      'valley-gold': null
    }
  },
  brazilian: {
    'santos-special': null,
    'minas-finest': null
  }
}

export function BeanSelector({ isOpen, onClose, onSelect }: BeanSelectorProps) {
  const [path, setPath] = React.useState<string[]>([])

  const getCurrentLevel = () => {
    let current: any = BEAN_TREE
    for (const segment of path) {
      current = current[segment]
    }
    return current
  }

  const handleSelect = (item: string) => {
    const current = getCurrentLevel()
    if (current[item] === null) {
      onSelect('/' + [...path, item].join('/'))
      onClose()
    } else {
      setPath([...path, item])
    }
  }

  const handleBack = () => {
    setPath(path.slice(0, -1))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-[#1e1e1e] text-[#f0f0f0] border-[#333333]">
        <SheetHeader>
          <SheetTitle className="text-[#f0f0f0]">Select Coffee Bean</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {path.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[#888888] hover:text-[#f0f0f0] mb-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
          )}
          <div className="space-y-1">
            {Object.entries(getCurrentLevel()).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded",
                  "text-sm text-left",
                  "hover:bg-[#2a2a2a]"
                )}
              >
                {value === null ? (
                  <Coffee className="w-4 h-4 text-[#888888]" />
                ) : (
                  <Folder className="w-4 h-4 text-[#888888]" />
                )}
                {key.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
