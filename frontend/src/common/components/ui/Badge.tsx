// frontend/src/common/components/ui/Badge.tsx
import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-primary-100 text-primary-800': variant === 'primary',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}