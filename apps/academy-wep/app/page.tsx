'use client'
import CredentialCard from '@/components/credential-card'
import HeroSection from '@/components/hero-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ArrowRight, DiscIcon as Discord, Github, Twitter } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
	const [email, setEmail] = useState('')

	// Calculate time until launch
	const launchDate = new Date('2025-06-01').getTime()
	const now = new Date().getTime()
	const distance = launchDate - now
	const days = Math.floor(distance / (1000 * 60 * 60 * 24))

	return (
		<main className="min-h-screen relative overflow-hidden text-foreground">
			{/* Background gradient */}
			{/* Floating elements */}
			<HeroSection />
			<CredentialCard />
		</main>
	)
}
