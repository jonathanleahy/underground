import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  Train, 
  Hotel, 
  Map,
  Search,
  Menu,
  X,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

const NavigationHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                <Train className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Underground Hotels</h1>
                <p className="text-xs text-gray-500 hidden sm:block">London's Premier Inn Finder</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </button>
            <button className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels
            </button>
            <button className="text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setHasNotifications(false)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <Button className="bg-indigo-600 hover:bg-indigo-700 hidden sm:flex">
              <Search className="h-4 w-4 mr-2" />
              Quick Search
            </Button>

            <div className="relative">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="px-4 py-3 space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
              <Map className="h-4 w-4" />
              Map View
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
              <Hotel className="h-4 w-4" />
              Hotels
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
              <Search className="h-4 w-4" />
              Search
            </button>
            <div className="border-t pt-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                <HelpCircle className="h-4 w-4" />
                Help
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3 text-red-600">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Organisms/NavigationHeader',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <NavigationHeader />,
};