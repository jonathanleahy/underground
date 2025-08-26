import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock, TrendingUp } from 'lucide-react';

// Udemy-style course card
const CourseCard = ({
  title,
  instructor,
  rating,
  reviewCount,
  price,
  originalPrice,
  image,
  duration,
  level,
  isBestseller = false,
}) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl cursor-pointer border-0">
      <div className="relative aspect-video bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <TrendingUp className="h-16 w-16 opacity-50" />
          </div>
        )}
        {isBestseller && (
          <Badge className="absolute top-2 left-2 bg-yellow-400 text-black hover:bg-yellow-500">
            Bestseller
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-base line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{instructor}</p>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-orange-400">{rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({reviewCount.toLocaleString()})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration} hours</span>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0">
            {level}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">£{price}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">£{originalPrice}</span>
          )}
          {originalPrice && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% off
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Atoms/CourseCard (Udemy Style)',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4 bg-gray-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <CourseCard
      title="Complete London Underground Navigation Guide"
      instructor="Transport Expert"
      rating={4.7}
      reviewCount={12543}
      price={19.99}
      originalPrice={89.99}
      duration={10.5}
      level="Beginner"
      isBestseller={true}
    />
  ),
};

export const CourseGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50">
      <CourseCard
        title="Master the Tube: Complete Navigation Course"
        instructor="London Transport Pro"
        rating={4.8}
        reviewCount={8234}
        price={24.99}
        originalPrice={119.99}
        duration={15}
        level="All Levels"
        isBestseller={true}
      />
      <CourseCard
        title="Budget Travel: Finding Cheap Hotels in London"
        instructor="Travel Expert"
        rating={4.5}
        reviewCount={5432}
        price={14.99}
        originalPrice={59.99}
        duration={8}
        level="Beginner"
      />
      <CourseCard
        title="Advanced Route Planning Strategies"
        instructor="Transport Planner"
        rating={4.9}
        reviewCount={2156}
        price={34.99}
        originalPrice={149.99}
        duration={20}
        level="Advanced"
      />
    </div>
  ),
};