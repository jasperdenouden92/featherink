import React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: boolean
}

export function Textarea({ 
  label, 
  error = false, 
  className, 
  ...props 
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'form-input w-full min-h-[120px] resize-vertical',
          error && 'error',
          className
        )}
        {...props}
      />
    </div>
  )
}
