import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  Train,
  Hotel,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface JourneySegment {
  type: 'walk' | 'tube' | 'change';
  from: string;
  to: string;
  duration: number;
  line?: string;
  color?: string;
  distance?: string;
}

interface JourneyTimelineProps {
  segments: JourneySegment[];
  totalTime: number;
  changes: number;
  variant?: 'vertical' | 'horizontal' | 'compact';
  showDetails?: boolean;
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  segments,
  totalTime,
  changes,
  variant = 'vertical',
  showDetails = true,
}) => {
  const getSegmentIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return <MapPin className="h-4 w-4" />;
      case 'tube':
        return <Train className="h-4 w-4" />;
      case 'change':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  const getSegmentColor = (segment: JourneySegment) => {
    if (segment.type === 'walk') return '#6b7280';
    if (segment.type === 'change') return '#f59e0b';
    return segment.color || '#3b82f6';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-medium">{totalTime} min</span>
        {changes > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{changes} change{changes > 1 ? 's' : ''}</span>
          </>
        )}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max p-4">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getSegmentColor(segment) }}
                >
                  {getSegmentIcon(segment.type)}
                </div>
                <span className="text-xs font-medium max-w-[80px] text-center line-clamp-2">
                  {segment.from}
                </span>
                <span className="text-xs text-gray-500">{segment.duration} min</span>
              </div>
              {index < segments.length - 1 && (
                <div className="flex items-center mx-2">
                  <div 
                    className="h-0.5 w-12"
                    style={{ backgroundColor: getSegmentColor(segments[index + 1]) }}
                  />
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 ml-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium max-w-[80px] text-center line-clamp-2">
              {segments[segments.length - 1]?.to || 'Destination'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant (default)
  return (
    <div className="space-y-4">
      {segments.map((segment, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline */}
          <div className="flex flex-col items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: getSegmentColor(segment) }}
            >
              {getSegmentIcon(segment.type)}
            </div>
            {index < segments.length - 1 && (
              <div 
                className="w-0.5 flex-1 min-h-[40px] mt-2"
                style={{ backgroundColor: getSegmentColor(segment) + '40' }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="font-medium text-sm">
              {segment.type === 'walk' && 'Walk'}
              {segment.type === 'tube' && segment.line}
              {segment.type === 'change' && 'Change'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {segment.from} → {segment.to}
            </div>
            {showDetails && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {segment.duration} min
                </span>
                {segment.distance && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {segment.distance}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Final destination */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">Arrival</div>
          <div className="text-sm text-gray-600 mt-1">
            {segments[segments.length - 1]?.to || 'Destination'}
          </div>
          <div className="mt-2">
            <Badge variant="secondary">
              Total: {totalTime} minutes
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof JourneyTimeline> = {
  tags: ["autodocs"],
  title: 'Molecules/JourneyTimeline',
  component: JourneyTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Journey Timeline Component
Visual representation of a multi-modal journey showing walking, tube travel, and line changes.

### Purpose
- Displays step-by-step journey instructions
- Shows duration for each segment
- Highlights line changes and walking distances
- Provides total journey time summary

### Variants
- **Vertical**: Default timeline for detailed views
- **Horizontal**: Compact timeline for cards
- **Compact**: Minimal text-only summary

### Usage
Perfect for route planning, journey details panels, and hotel cards.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <Story />
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const simpleJourney: JourneySegment[] = [
  {
    type: 'walk',
    from: 'Office',
    to: 'Victoria Station',
    duration: 5,
    distance: '0.3 miles',
  },
  {
    type: 'tube',
    from: 'Victoria',
    to: 'Oxford Circus',
    duration: 3,
    line: 'Victoria Line',
    color: '#0098D4',
  },
  {
    type: 'walk',
    from: 'Oxford Circus Station',
    to: 'Hotel',
    duration: 3,
    distance: '0.2 miles',
  },
];

const complexJourney: JourneySegment[] = [
  {
    type: 'walk',
    from: 'Workplace',
    to: 'Bank Station',
    duration: 3,
    distance: '0.2 miles',
  },
  {
    type: 'tube',
    from: 'Bank',
    to: 'Oxford Circus',
    duration: 5,
    line: 'Central Line',
    color: '#DC241F',
  },
  {
    type: 'change',
    from: 'Central Line',
    to: 'Victoria Line',
    duration: 2,
  },
  {
    type: 'tube',
    from: 'Oxford Circus',
    to: 'Kings Cross',
    duration: 4,
    line: 'Victoria Line',
    color: '#0098D4',
  },
  {
    type: 'walk',
    from: 'Kings Cross Station',
    to: 'Premier Inn',
    duration: 5,
    distance: '0.4 miles',
  },
];

export const SimpleJourney: Story = {
  args: {
    segments: simpleJourney,
    totalTime: 11,
    changes: 0,
  },
};

export const ComplexJourney: Story = {
  args: {
    segments: complexJourney,
    totalTime: 19,
    changes: 1,
  },
};

export const HorizontalTimeline: Story = {
  args: {
    segments: simpleJourney,
    totalTime: 11,
    changes: 0,
    variant: 'horizontal',
  },
};

export const CompactSummary: Story = {
  args: {
    segments: simpleJourney,
    totalTime: 11,
    changes: 0,
    variant: 'compact',
  },
};

export const LongJourney: Story = {
  args: {
    segments: [
      ...complexJourney,
      {
        type: 'change',
        from: 'Victoria Line',
        to: 'Northern Line',
        duration: 3,
      },
      {
        type: 'tube',
        from: 'Kings Cross',
        to: 'Camden Town',
        duration: 5,
        line: 'Northern Line',
        color: '#000000',
      },
    ],
    totalTime: 27,
    changes: 2,
  },
};

export const WithoutDetails: Story = {
  args: {
    segments: simpleJourney,
    totalTime: 11,
    changes: 0,
    showDetails: false,
  },
};