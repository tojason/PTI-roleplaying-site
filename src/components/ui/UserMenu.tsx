'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { user, logout } = useAppStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        menuRef.current && 
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus management and positioning
  useEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      // Position the dropdown properly
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdown = menuRef.current;
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 320; // 320px as defined in styles
      const padding = 16; // 1rem padding from viewport edge
      
      // Reset positioning styles first
      dropdown.style.left = 'auto';
      dropdown.style.right = 'auto';
      dropdown.style.transform = 'none';
      
      // Calculate available space on both sides
      const spaceOnRight = viewportWidth - rect.right;
      const spaceOnLeft = rect.left;
      
      // Determine best positioning strategy
      if (spaceOnRight >= dropdownWidth + padding) {
        // Enough space on the right - align dropdown's left edge with button's right edge
        dropdown.style.left = '0';
      } else if (spaceOnLeft >= dropdownWidth + padding) {
        // Not enough space on right, but enough on left - align dropdown's right edge with button's left edge
        dropdown.style.right = '100%';
        dropdown.style.left = 'auto';
      } else {
        // Limited space on both sides - position to fit within viewport
        const availableWidth = Math.min(dropdownWidth, viewportWidth - (2 * padding));
        dropdown.style.maxWidth = `${availableWidth}px`;
        
        if (rect.right + availableWidth > viewportWidth - padding) {
          // Position from the right edge to stay within viewport
          const rightOffset = Math.max(0, (rect.right + availableWidth) - (viewportWidth - padding));
          dropdown.style.right = `${rightOffset}px`;
          dropdown.style.left = 'auto';
        } else {
          // Position from the left
          dropdown.style.left = '0';
          dropdown.style.right = 'auto';
        }
      }
      
      // Focus first menu item when menu opens
      const firstMenuItem = dropdown.querySelector('button[role="menuitem"]') as HTMLElement;
      firstMenuItem?.focus();
    }
  }, [isOpen]);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    // For now, we'll navigate to profile as settings might be part of it
    router.push('/profile');
  };



  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Profile & Account',
      action: handleProfile,
      description: 'View and edit your profile'
    },
    {
      icon: CogIcon,
      label: 'Settings',
      action: handleSettings,
      description: 'App preferences and settings'
    },
    {
      icon: ShieldCheckIcon,
      label: 'Training Records',
      action: () => router.push('/progress'),
      description: 'View your training history'
    },

    {
      icon: ArrowRightOnRectangleIcon,
      label: 'Logout',
      action: handleLogout,
      description: 'Sign out of your account',
      isDanger: true
    }
  ];

  return (
    <div className={cn('relative menu-container', className)}>
      {/* Menu Toggle Button */}
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 relative',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'border-2 border-white shadow-sm', // White border for better contrast
          isOpen 
            ? 'bg-primary-700 text-white shadow-lg scale-105' 
            : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md hover:scale-105'
        )}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center">
          {user?.avatar ? (
            <>
              <img 
                src={user.avatar} 
                alt="Profile photo" 
                className="w-6 h-6 rounded-full object-cover"
              />
              <ChevronDownIcon 
                className={cn(
                  'w-3 h-3 transition-transform duration-200 -ml-1',
                  isOpen && 'rotate-180'
                )} 
              />
            </>
          ) : (
            <>
              <UserIcon className="w-6 h-6" />
              <ChevronDownIcon 
                className={cn(
                  'w-3 h-3 transition-transform duration-200 -ml-1',
                  isOpen && 'rotate-180'
                )} 
              />
            </>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Higher z-index backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 md:hidden" 
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 9998 }}
          />
          
          <div
            ref={menuRef}
            className={cn(
              'absolute top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5',
              'transform transition-all duration-200 ease-out dropdown-menu',
              'origin-top-right',
              'border border-gray-200', // Add border for better definition
              isOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2'
            )}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            style={{
              // Ensure the dropdown is always visible and positioned correctly
              position: 'absolute',
              zIndex: 9999,
              minWidth: '320px',
              maxWidth: 'calc(100vw - 1rem)',
              // Positioning is handled dynamically in useEffect
              // Add background color as failsafe
              backgroundColor: 'white',
              // Ensure it's above everything
              isolation: 'isolate',
              // Force visibility
              visibility: 'visible',
              display: 'block'
            }}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile photo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Officer'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    PID: {user?.pid || 'N/A'} • {user?.department || 'Police Department'}
                  </p>
                  <p className="text-xs text-primary-600 font-medium">
                    Level {user?.level || 1} • {user?.experienceLevel || 'rookie'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item.action)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const nextButton = e.currentTarget.nextElementSibling as HTMLElement;
                      nextButton?.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prevButton = e.currentTarget.previousElementSibling as HTMLElement;
                      prevButton?.focus();
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      const firstButton = menuRef.current?.querySelector('button[role="menuitem"]') as HTMLElement;
                      firstButton?.focus();
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      const buttons = menuRef.current?.querySelectorAll('button[role="menuitem"]');
                      const lastButton = buttons?.[buttons.length - 1] as HTMLElement;
                      lastButton?.focus();
                    }
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left flex items-start space-x-3 transition-colors duration-150',
                    'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                    item.isDanger 
                      ? 'text-red-700 hover:bg-red-50 focus:bg-red-50' 
                      : 'text-gray-700'
                  )}
                  role="menuitem"
                  tabIndex={-1}
                >
                  <item.icon 
                    className={cn(
                      'w-5 h-5 mt-0.5 flex-shrink-0',
                      item.isDanger ? 'text-red-500' : 'text-gray-500'
                    )} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      item.isDanger ? 'text-red-700' : 'text-gray-900'
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* App Info Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Police Training Interface v1.0
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { UserMenu };