'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { LogoOrg } from '~/components/base/logo-org'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/base/sheet'
import { useAuth } from '~/hooks/use-auth'
import { useI18n } from '~/lib/i18n/context'
import { LanguageSelector } from './language-selector'
import {
	MobileAuthButtons,
	MobileNavigation,
	MobileUserMenu,
} from './mobile-navigation'
import { Navigation } from './navigation'
import { UserMenu } from './user-menu'

const AuthButtons = () => {
	const { t } = useI18n()
	return (
		<div className="flex items-center gap-2">
			<Link href="/sign-in" passHref>
				<Button variant="ghost" size="sm" className="hidden sm:inline-flex">
					{t('nav.signIn')}
				</Button>
			</Link>
			<Link href="/sign-up" passHref>
				<Button variant="default" size="sm" className="hidden sm:inline-flex">
					{t('nav.signUp')}
				</Button>
			</Link>
		</div>
	)
}

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { user } = useAuth()
	const { t } = useI18n()
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container max-w-screen-xl mx-auto">
				<div className="flex h-16 items-center justify-between px-4">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<LogoOrg width={120} height={33} className="h-auto w-auto" />
					</Link>

					{/* Navigation - Hidden on mobile */}
					<div className="hidden md:block">
						<Navigation />
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-4">
						<LanguageSelector />
						{user ? <UserMenu user={user} /> : <AuthButtons />}

						{/* Mobile menu */}
						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									aria-label={t('aria.openMobileMenu')}
									aria-expanded={mobileMenuOpen}
									className="md:hidden"
								>
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-80">
								<SheetHeader>
									<SheetTitle>{t('nav.menu')}</SheetTitle>
								</SheetHeader>
								<div className="mt-8 flex flex-col gap-4">
									<div className="pb-4 border-b">
										<LanguageSelector />
									</div>
									<MobileNavigation />
									{user ? (
										<MobileUserMenu user={user} />
									) : (
										<MobileAuthButtons />
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	)
}
