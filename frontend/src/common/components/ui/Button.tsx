import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-apple transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'apple-button-primary focus:ring-blue-500',
      secondary: 'apple-button-secondary focus:ring-gray-500',
      tertiary: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  }

  return (
    <button
      className={getButtonClasses()}
      {...props}
    >
      {children}
    </button>
  )
}
