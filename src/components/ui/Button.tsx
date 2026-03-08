import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'small'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-yantramanav font-medium text-base border-none cursor-pointer transition-all duration-200 rounded-lg'
  
  const variants = {
    primary: 'bg-magical-blue text-white px-6 py-3 hover:bg-blue-800 active:bg-blue-900',
    secondary: 'bg-white text-ink-black border border-iron-grey px-6 py-3 hover:bg-marble-grey active:bg-pencils-grey active:text-white',
    ghost: 'bg-transparent text-magical-blue border-2 border-magical-blue px-5 py-2 hover:bg-lavender active:bg-magical-blue active:text-white',
    small: 'bg-magical-blue text-white px-4 py-2 text-sm hover:bg-blue-800 active:bg-blue-900'
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
