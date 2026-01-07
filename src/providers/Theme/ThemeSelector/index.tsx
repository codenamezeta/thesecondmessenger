'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Palette } from 'lucide-react'
import React, { useState } from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: Theme & 'system') => {
    if (themeToSet === 'system') {
      setTheme(null)
      setValue('system')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'system')
  }, [])

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label="Select a theme"
        className="w-auto bg-surface text-body gap-2 border border-body"
      >
        <Palette />
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent className="bg-card">
        <SelectItem value="system">Auto</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="interstellar">Interstellar</SelectItem>
        <SelectItem value="kelly_come_home">Kelly Come Home</SelectItem>
      </SelectContent>
    </Select>
  )
}
