import React from 'react'
import { Button } from './ui/button';

interface GameStartedDialogProps {
    show: boolean;
    onClose: () => void;
    
}

export const GameStartedDialog = ({ show, onClose }: GameStartedDialogProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow">
        <p>Game has already started!</p>
        <Button className="mt-4" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
