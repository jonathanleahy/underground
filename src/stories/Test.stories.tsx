import type { Meta, StoryObj } from '@storybook/react';

const TestComponent = ({ text }: { text: string }) => {
  return (
    <div style={{ padding: '20px', border: '2px solid blue', borderRadius: '8px' }}>
      <h1>Test Component</h1>
      <p>{text}</p>
    </div>
  );
};

const meta: Meta<typeof TestComponent> = {
  tags: ["autodocs"],
  title: 'Test/TestComponent',
  component: TestComponent,
  tags: ['autodocs'], // This generates a docs page
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'This is a test component to verify Storybook is working.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This is a test story. If you can see this, Storybook is working!',
  },
  parameters: {
    docs: {
      source: {
        code: `<TestComponent text="This is a test story. If you can see this, Storybook is working!" />`,
        language: 'tsx',
      },
    },
  },
};