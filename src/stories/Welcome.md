import { Meta } from '@storybook/blocks';

<Meta title="Welcome" />

# 🚇 London Underground Hotel Finder

Welcome to the **London Underground Hotel Finder** project! This application helps users find the perfect Premier Inn hotel based on their commute needs using the London Underground network.

## 🎯 Project Overview

This React-based web application combines:
- **Real-time route planning** using the London Underground network
- **Premier Inn hotel locations** across London
- **Interactive mapping** with detailed journey information
- **Smart pricing** calculations based on dates and location

## 🏗️ Architecture

The project is organized using **Atomic Design** principles:

### Atoms 🔵
Basic building blocks like buttons, inputs, and labels.

### Molecules 🟢
Simple combinations of atoms that form functional units (e.g., search bars, price displays).

### Organisms 🟡
Complex components made from molecules and atoms (e.g., hotel cards, route displays).

### Templates 🟠
Page-level layouts that structure organisms.

### Pages 🔴
Complete, functional pages with real data.

## 🚀 Key Features

### 1. **Postcode/Destination Search**
- Search by UK postcode
- Find locations by landmark names
- Popular destination suggestions

### 2. **Smart Route Finding**
- Calculates optimal Underground routes
- Shows journey times and changes
- Displays walking distances

### 3. **Interactive Map**
- Visual route display on map
- Color-coded tube lines
- Hotel markers with prices
- Zoom and pan controls

### 4. **Hotel Information**
- Real-time pricing (when available)
- Distance from stations
- Total journey time
- Direct booking links

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Leaflet** for mapping
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Storybook** for component documentation

## 📊 Data Sources

### Underground Data
- Station locations and connections
- Line information and colors
- Real-world coordinates

### Hotel Data
- 80+ Premier Inn locations in London
- Accurate GPS coordinates
- Pricing algorithms
- Booking URL generation

## 🎨 Design System

The application uses:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistency
- **Custom CSS** for specialized components
- **Responsive design** for all screen sizes

## 🔍 How It Works

1. **Enter Destination**: User inputs their workplace postcode or destination
2. **Set Preferences**: Choose dates and commute requirements
3. **View Results**: See hotels sorted by commute time
4. **Explore Routes**: Click hotels to see detailed journey information
5. **Book**: Direct links to Premier Inn booking

## 📈 Future Enhancements

- [ ] More hotel chains
- [ ] Bus route integration
- [ ] Accessibility features
- [ ] Journey planner with times
- [ ] Favorite hotels
- [ ] Price alerts
- [ ] Mobile app version

## 👥 Contributing

This is an open-source project. Contributions are welcome!

---

*Built with ❤️ for London commuters*