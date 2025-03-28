import Link from "next/link"
import Image from "next/image"
import { Bot } from "lucide-react"

import { Button } from "~/components/base/button"
import { footerRoutes } from "~/lib/constants/footer"

export function Footer() {
  return (
    <footer className="border-t py-8 md:py-12 px-4 -mx-4">
      <div className="grid gap-8 md:grid-cols-12 border-b pb-8">
        {/* Logo and Description */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center">
            <Image
              src="/images/kindfi-org.png"
              alt="KindFi Academy Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <span className="ml-1 text-sm font-medium text-gray-700">Academy</span>
          </div>
          <p className="text-gray-600 max-w-md">
            The first Web3 platform connecting supporters to impactful causes while driving blockchain adoption for
            social and environmental change.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid gap-8 md:col-span-8 sm:grid-cols-3">
          {/* Projects Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Projects</h3>
            <ul className="space-y-2">
              {footerRoutes.projects.map((route) => (
                <li key={route.name}>
                  <Link href={route.href} className="text-gray-600 hover:text-green-600">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Resources</h3>
            <ul className="space-y-2">
              {footerRoutes.resources.map((route) => (
                <li key={route.name}>
                  <Link href={route.href} className="text-gray-600 hover:text-green-600">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Legal</h3>
            <ul className="space-y-2">
              {footerRoutes.legal.map((route) => (
                <li key={route.name}>
                  <Link href={route.href} className="text-gray-600 hover:text-green-600">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright and Extra Links */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 text-sm text-gray-500">
        <p>© 2025 KindFi. All rights reserved.</p>
        <Link href="/documentation" className="hover:text-green-600 md:pr-16 mt-2 md:mt-0">
          Documentation
        </Link>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full text-white shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Get help"
        >
          <Bot className="!w-6 !h-6" />
        </Button>
      </div>
    </footer>
  )
}
