import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Train, 
  Hotel, 
  MapPin, 
  Navigation,
  Clock,
  Wallet,
  Search,
  Star,
  TrendingUp,
  Users,
  Building,
  ArrowRight,
  CheckCircle,
  Info
} from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <Train className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Component Design System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to the London Underground Hotel Finder Storybook - a single source of truth for all UI components and design patterns.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Atomic Design</CardTitle>
              <CardDescription>
                Components organized from atoms to pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Atoms - Basic building blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Molecules - Component groups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Organisms - Complex sections</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Navigation className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Modern Stack</CardTitle>
              <CardDescription>
                Built with cutting-edge technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Tailwind CSS for styling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>shadcn/ui components</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>TypeScript for type safety</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Live Development</CardTitle>
              <CardDescription>
                Interactive component playground
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Live component preview</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Interactive controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Documentation & usage</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How to Use Storybook */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-2xl">How to Use This Storybook</CardTitle>
            <CardDescription className="text-indigo-100">
              Design, develop, and test components in isolation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="font-semibold text-lg">Browse Components</h3>
                <p className="text-sm text-gray-600">
                  Navigate through atoms, molecules, organisms, and pages in the sidebar
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold text-lg">Test Variations</h3>
                <p className="text-sm text-gray-600">
                  Use the controls panel to test different states and configurations
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold text-lg">Integrate</h3>
                <p className="text-sm text-gray-600">
                  Copy component code directly into the main application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stations</p>
                  <p className="text-3xl font-bold">270</p>
                </div>
                <Train className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tube Lines</p>
                  <p className="text-3xl font-bold">11</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Premier Inns</p>
                  <p className="text-3xl font-bold">30+</p>
                </div>
                <Hotel className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Journey</p>
                  <p className="text-3xl font-bold">15m</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          <div className="flex justify-center gap-4">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
              Explore Components
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg">
              View Live Site
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Design System for London Underground Hotel Finder
          </p>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Welcome',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Welcome Page
The main introduction page for the London Underground Hotel Finder Storybook.

### Purpose
- Introduces the component design system
- Explains how to use Storybook for component development
- Showcases the tech stack (Tailwind, shadcn/ui, TypeScript)
- Provides navigation to explore components

### Usage
This page should be the first thing developers see when opening Storybook.
It serves as a guide for using the design system effectively.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Introduction: Story = {
  render: () => <Welcome />,
};