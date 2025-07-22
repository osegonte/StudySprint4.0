// frontend/src/common/components/ui/Progress.tsx
import React from 'react'
import { clsx } from 'clsx'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div
        className={clsx(
          'bg-gray-200 rounded-full overflow-hidden',
          {
            'h-2': size === 'sm',
            'h-3': size === 'md',
            'h-4': size === 'lg',
          }
        )}
      >
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out',
            {
              'bg-primary-500': color === 'primary',
              'bg-green-500': color === 'green',
              'bg-yellow-500': color === 'yellow',
              'bg-red-500': color === 'red',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
