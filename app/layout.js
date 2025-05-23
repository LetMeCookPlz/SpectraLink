import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth].js'
import React from 'react';
import localFont from "next/font/local";
import "./globals.css";
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { UserMenu } from "@/app/components/user-menu"
import { Providers } from "@/app/components/providers"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "SpectraLink",
  description: "Internet Service Provider",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  const isPrivileged = session?.user?.user_role === 'Admin'

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header style={{ backgroundColor: '#0a0a0a' }} className="border-b fixed top-0 left-0 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-3xl font-bold text-primary">
                  SpectraLink
                </Link>
              </div>

              <div className="fixed left-1/2 transform -translate-x-1/2">
                <NavigationMenu>
                  <NavigationMenuList className="flex space-x-8">
                    <NavigationMenuItem>
                      <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl`}>
                          Головна
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/plans" legacyBehavior passHref>
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl`}>
                          Тарифні плани
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="flex items-center">
                {session ? (
									<Providers session={session}>
                  <UserMenu email={session.user?.email} isPrivileged={isPrivileged} />
									</Providers>
								) : (
                  <>
                    <Button variant="outline" className="mr-2">
                      <Link href="/login">Увійти</Link>
                    </Button>
                    <Button>
                      <Link href="/signup">Реєстрація</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}