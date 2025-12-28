import React from 'react'

interface StandbyTabProps {
  onRestore: () => void
}

export const StandbyTab = ({ onRestore }: StandbyTabProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 group -translate-x-1/2">
      <button
        onClick={onRestore}
        className="bg-black/80 border border-primary/30 border-b-0 rounded-t-lg px-6 py-1 text-xs uppercase tracking-widest text-primary hover:bg-black hover:text-white transition-all"
      >
        Player Standby
      </button>
      {/* Invisible trigger area to help with mouse interaction */}
      <div className="h-4 w-40 bg-transparent absolute bottom-0 left-1/2 -translate-x-1/2"></div>
    </div>
  )
}
