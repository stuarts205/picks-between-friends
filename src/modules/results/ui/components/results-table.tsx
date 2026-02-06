import React from 'react'

interface ResultsTableProps {
    // Define any props if needed
    updatedResults?: unknown;
    isUpdated?: boolean;
}

export const ResultsTable = ({ updatedResults, isUpdated }: ResultsTableProps) => {
  return (
    <div>{JSON.stringify(updatedResults)}</div>
  )
}
