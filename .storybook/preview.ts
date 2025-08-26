import type { Preview } from '@storybook/react-vite'
// Import Tailwind v4 CSS with CSS variables
import './preview.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    docs: {
      toc: true, // Enable table of contents
      source: {
        type: 'code', // Show actual code instead of dynamic
      },
    },
    viewMode: 'story', // Default view mode
  },
};

export default preview;