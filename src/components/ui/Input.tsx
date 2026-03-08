import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
}

export function Input({ 
  label, 
  error = false, 
  className, 
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={cn(
          'form-input w-full',
          error && 'error',
          className
        )}
        {...props}
      />
    </div>
  )
}
