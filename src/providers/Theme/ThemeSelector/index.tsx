'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Palette, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: string) => {
    if (themeToSet === 'dark') {
      setTheme(null)
      setValue('dark')
    } else {
      setTheme(themeToSet as Theme)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'dark')
  }, [])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-auto bg-background text-foreground gap-2 border border-input"
        >
          <Palette className="h-4 w-4" />
          Theme
          <ChevronUp className="h-4 w-4 opacity-50 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        className="bg-card text-card-foreground border border-border rounded-lg"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onThemeChange}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="interstellar">Interstellar</DropdownMenuRadioItem>
          {/* <DropdownMenuRadioItem value="kelly_come_home">Kelly Come Home</DropdownMenuRadioItem> */}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
