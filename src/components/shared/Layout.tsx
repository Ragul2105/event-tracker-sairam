"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  FolderOpen,
  Wallet,
  CreditCard,
  BarChart3,
  User
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: string[];
  submenu?: { href: string; label: string; }[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["ADMIN", "MASTER", "UNIT_USER"] },
  { 
    href: "/events", 
    label: "Events", 
    icon: FolderOpen, 
    roles: ["ADMIN", "MASTER", "UNIT_USER"],
    submenu: [
      { href: "/events", label: "All Events" },
      { href: "/events/innovation-ecosystem", label: "Innovation Ecosystem" },
      { href: "/events/nss", label: "NSS" },
      { href: "/events/uba", label: "UBA" },
      { href: "/events/household-survey", label: "House Hold Survey & SIRD" },
      { href: "/events/scouts-guides", label: "Scouts & Guides" },
      { href: "/events/blood-donation", label: "Blood Donation" },
    ]
  },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/masters", label: "Masters", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Events"]); // Events expanded by default
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    // Dispatch event for MainLayout to sync
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const toggleSubmenu = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/events") {
      return pathname === "/events" || pathname === "/events/create";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gray-50 border-r border-gray-200 transform transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-52'}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-14 bg-gray-800 flex items-center px-4">
            {!isCollapsed ? (
              <div>
                <h1 className="text-white text-sm font-semibold">Sairam Event Tracker</h1>
                <p className="text-gray-400 text-xs">Sri Sairam Institutions</p>
              </div>
            ) : (
              <div className="text-white text-center w-full">
                <h1 className="text-xs font-bold">SET</h1>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.includes(item.label);
              const itemActive = isActive(item.href);
              
              return (
                <div key={item.href}>
                  {/* Main Nav Item */}
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => !isCollapsed && toggleSubmenu(item.label)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2.5 px-3 py-2 rounded-lg transition-all text-sm
                          ${itemActive 
                            ? 'bg-blue-500 text-white shadow-sm font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                          <Icon size={18} strokeWidth={1.5} />
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                      </button>
                      
                      {/* Submenu */}
                      {isExpanded && !isCollapsed && (
                        <div className="ml-3 mt-0.5 space-y-0.5">
                          {item.submenu.map((subItem) => {
                            const subActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-1.5 rounded-lg text-xs transition-all
                                  ${subActive 
                                    ? 'bg-blue-500 text-white shadow-sm font-medium' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-2.5 px-3 py-2 rounded-lg transition-all text-sm
                        ${itemActive 
                          ? 'bg-blue-500 text-white shadow-sm font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-2 space-y-2 border-t border-gray-200">
            {/* User Info & Collapse Toggle */}
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="px-2 py-1">
                  <p className="text-xs font-semibold text-gray-800 truncate">{user?.role.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              )}
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} className="text-gray-600" /> : <ChevronLeft size={16} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync with sidebar collapse state
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    };
    
    handleStorage();
    window.addEventListener('storage', handleStorage);
    
    // Custom event for same-tab updates
    const handleCollapse = () => handleStorage();
    window.addEventListener('sidebarToggle', handleCollapse);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebarToggle', handleCollapse);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`transition-all duration-300 px-6 pt-6 pb-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-52'}`}>
        {children}
      </main>
    </div>
  );
}
