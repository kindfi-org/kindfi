'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'

const ThemeSwitcher = () => {
	const [mounted, setMounted] = useState(false)
	const { theme, setTheme } = useTheme()

	// useEffect only runs on the client, so now we can safely show the UI
	// Use startTransition to avoid React Compiler warning about setState in effect
	useEffect(() => {
		// Schedule state update in next tick to avoid synchronous setState in effect
		const timer = setTimeout(() => {
			setMounted(true)
		}, 0)
		return () => clearTimeout(timer)
	}, [])

	if (!mounted) {
		return null
	}

	const iconSize = 16

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size={'sm'}>
					{theme === 'light' ? (
						<Sun
							key="light"
							size={iconSize}
							className={'text-muted-foreground'}
						/>
					) : theme === 'dark' ? (
						<Moon
							key="dark"
							size={iconSize}
							className={'text-muted-foreground'}
						/>
					) : (
						<Laptop
							key="system"
							size={iconSize}
							className={'text-muted-foreground'}
						/>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-content" align="start">
				<DropdownMenuRadioGroup
					value={theme}
					onValueChange={(e) => setTheme(e)}
				>
					<DropdownMenuRadioItem className="flex gap-2" value="light">
						<Sun size={iconSize} className="text-muted-foreground" />{' '}
						<span>Light</span>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem className="flex gap-2" value="dark">
						<Moon size={iconSize} className="text-muted-foreground" />{' '}
						<span>Dark</span>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem className="flex gap-2" value="system">
						<Laptop size={iconSize} className="text-muted-foreground" />{' '}
						<span>System</span>
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export { ThemeSwitcher }
