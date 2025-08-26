import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, AlertCircle, Clock } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  period?: 'night' | 'week' | 'month';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  variant?: 'default' | 'sale' | 'premium' | 'budget';
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = '£',
  period = 'night',
  size = 'md',
  showDiscount = true,
  variant = 'default',
}) => {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const variantClasses = {
    default: 'text-gray-900',
    sale: 'text-red-600',
    premium: 'text-purple-600',
    budget: 'text-green-600',
  };

  return (
    <div className="inline-flex flex-col">
      {showDiscount && discount > 0 && (
        <Badge className="bg-red-500 text-white mb-1 self-start">
          <TrendingDown className="h-3 w-3 mr-1" />
          {discount}% OFF
        </Badge>
      )}
      
      <div className="flex items-baseline gap-2">
        <span className={`font-bold ${sizeClasses[size]} ${variantClasses[variant]}`}>
          {currency}{price}
        </span>
        {originalPrice && originalPrice > price && (
          <span className="text-sm text-gray-400 line-through">
            {currency}{originalPrice}
          </span>
        )}
      </div>
      
      <span className="text-xs text-gray-600 mt-0.5">
        per {period}
      </span>
    </div>
  );
};

const meta: Meta<typeof PriceDisplay> = {
  tags: ["autodocs"],
  title: 'Atoms/PriceDisplay',
  component: PriceDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Price Display Component

A flexible price display atom that handles various pricing scenarios including discounts, different currencies, and time periods.

## Purpose
The PriceDisplay component is a fundamental atom for showing pricing information consistently across the application. It handles:
- Current and original prices
- Discount calculations and badges
- Different size variations
- Multiple visual variants for different contexts

## Usage

\`\`\`tsx
import { PriceDisplay } from '@/components/atoms/PriceDisplay';

// Basic usage
<PriceDisplay price={89} period="night" />

// With discount
<PriceDisplay 
  price={65} 
  originalPrice={99} 
  showDiscount={true}
/>

// Premium variant
<PriceDisplay 
  price={250} 
  variant="premium"
  size="lg"
/>
\`\`\`

## Design Principles
- **Clarity**: Price is always the most prominent element
- **Context**: Period (night/week) provides essential context
- **Hierarchy**: Discount badges draw attention without overwhelming
- **Consistency**: Same format across all touchpoints
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-gray-50">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    price: { control: { type: 'range', min: 10, max: 500, step: 5 } },
    originalPrice: { control: { type: 'range', min: 10, max: 600, step: 5 } },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'sale', 'premium', 'budget'],
    },
    period: {
      control: { type: 'select' },
      options: ['night', 'week', 'month'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: 89,
    period: 'night',
  },
};

export const WithDiscount: Story = {
  args: {
    price: 65,
    originalPrice: 99,
    showDiscount: true,
  },
};

export const LargeSize: Story = {
  args: {
    price: 125,
    size: 'lg',
  },
};

export const SaleVariant: Story = {
  args: {
    price: 45,
    originalPrice: 89,
    variant: 'sale',
    showDiscount: true,
  },
};

export const PremiumVariant: Story = {
  args: {
    price: 250,
    variant: 'premium',
    size: 'lg',
  },
};

export const BudgetVariant: Story = {
  args: {
    price: 35,
    variant: 'budget',
  },
};

export const WeeklyPricing: Story = {
  args: {
    price: 450,
    period: 'week',
    size: 'lg',
  },
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <PriceDisplay price={89} size="sm" />
      <PriceDisplay price={89} size="md" />
      <PriceDisplay price={89} size="lg" />
      <PriceDisplay price={89} size="xl" />
    </div>
  ),
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Default</p>
        <PriceDisplay price={89} variant="default" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Sale</p>
        <PriceDisplay price={65} originalPrice={99} variant="sale" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Premium</p>
        <PriceDisplay price={250} variant="premium" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Budget</p>
        <PriceDisplay price={35} variant="budget" />
      </div>
    </div>
  ),
};