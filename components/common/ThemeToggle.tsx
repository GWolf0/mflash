"use client"

import React from 'react'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import ThemeService from '@/services/systems/themeService'

function ThemeToggle() {

    function onToggleTheme(value: boolean) {
        ThemeService.toggleTheme(value ? "dark" : "light");
    }

    return (
        <div className="flex items-center gap-2">
            <Switch id="theme-toggle" onCheckedChange={onToggleTheme} />
            <Label htmlFor="theme-toggle" className='text-xs md:dark-sm'>Dark Theme</Label>
        </div>
    )

}

export default ThemeToggle