import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Import the main CSS file directly
import '../index.css';

const TestCSS = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Testing Tailwind CSS</h1>
      <div className="space-y-4">
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-900">If you can see this with a blue background, Tailwind is working!</p>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Green Button
        </button>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-red-500 rounded"></div>
          <div className="w-20 h-20 bg-yellow-500 rounded"></div>
          <div className="w-20 h-20 bg-purple-500 rounded"></div>
        </div>
      </div>
      
      {/* Inline styles as fallback to show something is rendering */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #ccc' }}>
        <p>This has inline styles as a fallback - if you see a border, React is working but Tailwind isn't.</p>
      </div>
    </div>
  );
};

const meta = {
  title: 'Test/CSS',
  component: TestCSS,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TestCSS>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};