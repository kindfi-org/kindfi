"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown, Shield, ShieldPlus, LockKeyhole } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/base/sidebar"
import { Button } from "~/components/base/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/base/collapsible"
import { cn } from "~/lib/utils"
import { learningPaths, navigationRoutes } from "~/lib/constants/sidebar"

export function AppSidebar() {
  const pathname = usePathname()

  // Check if a route is active
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }

    const normalizedHref = href.endsWith("/") ? href.slice(0, -1) : href
    const normalizedPathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname

    return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`)
  }

  // Check if a learning path is active
  const isLearningPathActive = (path: (typeof learningPaths)[0]) => {
    return isActive(path.href) || path.subItems.some((item) => isActive(item.href))
  }

  return (
    <Sidebar className="border-r font-semibold p-2">
      <SidebarContent className="bg-card">
        {/* Logo Section */}
        <SidebarGroup className="pb-4 border-b">
          <div className="flex items-center">
            <Image
              src="/images/kindfi-org.png"
              alt="KindFi Academy Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <span className="ml-1 text-sm font-medium">Academy</span>
          </div>
        </SidebarGroup>

        {/* Navigation Section */}
        <SidebarGroup className="-mx-2 pb-4 border-b">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationRoutes.map((route) => (
                <SidebarMenuItem key={route.name}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-green-100 hover:text-green-600",
                      isActive(route.href, true) && "bg-green-100 text-green-600"
                    )}
                  >
                    <Link href={route.href}>
                      <route.icon className="h-5 w-5" />
                      <span>{route.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="pt-4">
          {/* Learning Paths Section */}
          <div className="flex h-8 shrink-0 items-center px-4 text-xs font-medium text-sidebar-foreground/70 -mb-2">Learning Paths</div>

          {/* Use Collapsible SidebarGroup for each learning path */}
          {learningPaths.map((path) => (
            <Collapsible key={path.name} defaultOpen={isLearningPathActive(path)} className="group/collapsible">
              <SidebarGroup className="-mx-2">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center rounded-md hover:bg-green-100 hover:text-green-600",
                      isActive(path.href) && "text-green-600",
                    )}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-sm gradient-btn text-white mr-2">
                      <span className="text-sm font-medium">{path.icon}</span>
                    </div>
                    <span className="flex-1 text-left text-sm text-gray-700">{path.name}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={cn("hover:bg-green-100 hover:text-green-600", isActive(path.href, true) && "bg-green-100 text-green-600")}
                        >
                          <Link href={path.href}>
                            <span>Overview</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {path.subItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.name}>
                          <SidebarMenuButton
                            asChild
                            className={cn("hover:bg-green-100 hover:text-green-600", isActive(subItem.href) && "bg-green-100 text-green-600")}
                          >
                            <Link href={subItem.href}>
                              <span>{subItem.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </div>

        {/* Passkey Authentication Section */}
        <SidebarGroup className="-mx-2 pt-4">
          <SidebarGroupLabel className="pb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-btn text-white mr-2">
              <Shield className="h-4 w-4" />
            </div>
            Passkey Authentication
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 space-y-2">
            <Button variant="outline" className="w-full gradient-border-btn">
              <LockKeyhole className="h-4 w-4 text-green-600" />
              Sign in with Passkey
            </Button>
            <Button className="w-full gradient-btn">
              <ShieldPlus className="h-4 w-4" />
              Create Passkey
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <p className="text-xs font-normal text-gray-500 py-4 px-2">
          Passkeys are more secure than passwords and easier to use. No more remembering complex passwords!
        </p>

        {/* Footer Section */}
        <div className="mt-auto p-4 text-xs font-normal text-gray-500 border-t">
          <p className="mb-2">© 2025 KindFi Academy</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-700">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy
            </Link>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
