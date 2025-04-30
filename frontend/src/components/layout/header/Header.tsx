'use client';

import * as React from 'react';
import { ArrowRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductMenu } from './ProductMenu';
import { productItems, resources, solutions } from '@/utils/constants';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../ui/navigation-menu';
import Logo from '../logo';
import { logout } from '../../../app/api/auth';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '../../ui/menubar';
import { getUserData } from '../../../lib/cookies';

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
  const [userData, setUserData] = React.useState({
    email: '',
    avatar: '',
  });

  const session = async () => {
    // Check if user is authenticated
    const user = await getUserData();
    if (user) {
      console.log('User data:', user);
      setUserData(user);
    }
  };

  React.useLayoutEffect(() => {
    session();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Update client-side state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      setUserData({
        email: '',
        avatar: '',
      });
      // Redirect to home page
      redirect('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Auth navigation items
  const authItems = userData?.email ? (
    <div className="hidden md:flex md:items-center md:space-x-4">
      <Menubar className="border-0 hover:bg-orange-50">
        <MenubarMenu>
          <MenubarTrigger>
            <span className="text-sm font-medium text-muted-foreground pr-2">
              {userData?.email.split('@')[0] || 'User'}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium overflow-hidden">
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{userData?.email?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
          </MenubarTrigger>
          <MenubarContent align="end" alignOffset={-5}>
            <MenubarItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/profile">Profile</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/settings">Settings</Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleLogout}>Logout</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  ) : (
    <div className="hidden md:flex md:items-center md:space-x-4">
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Get started
      </Link>
    </div>
  );

  // Update the mobile drawer menu
  const mobileAuthItems = userData?.email ? (
    <>
      <Link
        href="/dashboard"
        className="flex items-center justify-between py-2 text-sm font-medium"
      >
        Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-between py-2 text-sm font-medium cursor-pointer"
      >
        Logout
        <ArrowRight className="h-4 w-4" />
      </button>
    </>
  ) : (
    <>
      <Link
        href="/signup"
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
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center m-auto">
        <div className="flex flex-1 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-end">
              <Logo />
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
          {authItems}
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
                <div className="space-y-2 flex-1">
                  {menuItems.map((item) => (
                    <div key={item.title}>
                      {item.children ? (
                        <Sheet>
                          <SheetTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
                            {item.title}
                            <ArrowRight className="h-4 w-4" />
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="w-full overflow-auto p-2 pb-8 md:pb-2"
                          >
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
                <div className="border-t pt-3">{mobileAuthItems}</div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
