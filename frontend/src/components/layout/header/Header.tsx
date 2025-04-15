'use client';

import * as React from 'react';
import { ArrowRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
// Add this import at the top
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductMenu } from './ProductMenu';
import { productItems, resources, solutions } from '../../../utils/constants';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../ui/navigation-menu';

const menuItems = [
  {
    title: 'Product',
    href: '#',
    children: <ProductMenu items={productItems} />,
  },
  {
    title: 'Solutions',
    href: '#',
    children: <ProductMenu items={solutions} />,
  },
  // {
  //   title: 'Developers',
  //   href: '#',
  //   children: <ProductMenu items={productItems} />,
  // },
  {
    title: 'Resources',
    href: '#',
    children: <ProductMenu items={resources} />,
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'Contact sales',
    href: 'contact-sales',
  },
];
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center m-auto">
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">TONFY</span>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          {item.children}
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                ) : (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          {/* auth */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/singup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </div>
        <div className="lg:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle Menu"
              >
                <Menu className="h-7 w-7" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[calc(100vh-56px)] -top-12">
              <div className="flex flex-col space-y-3 p-4 h-full">
                <div className="space-y-3 flex-1">
                  {menuItems.map((item) => (
                    <div key={item.title}>
                      {item.children ? (
                        <Sheet>
                          <SheetTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
                            {item.title}
                            <ArrowRight className="h-4 w-4" />
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full p-2">
                            <SheetTitle>{item.title}</SheetTitle>
                            {item.children}
                          </SheetContent>
                        </Sheet>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between py-2 text-sm font-medium"
                        >
                          {item.title}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <Link
                    href="/singup"
                    className="mb-2 block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full rounded-md border px-4 py-2 text-center text-sm font-medium"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
