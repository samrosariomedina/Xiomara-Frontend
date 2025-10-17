"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

interface SummarySelectionDialogProps {
  onGenerateNewSummary: () => void
}

export default function SummarySelectionDialog({ onGenerateNewSummary }: SummarySelectionDialogProps) {
  const handleGenerateNewSummary = () => {
    onGenerateNewSummary()
  }

  return (
    <>
      {/* Trigger Button */}
      <Button 
        onClick={handleGenerateNewSummary}
        variant="outline"
        size="sm"
        className="text-[#31499f] border-[#31499f] hover:bg-[#f7f9ff]"
      >
        Generate New Summary
      </Button>
    </>
  )
}
