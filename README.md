# Truck GPS Tracker

A comprehensive truck GPS tracking application built with Vue.js, Vuetify, and Mapbox GL JS for real-time fleet monitoring and route analytics.

![Truck GPS Tracker Application](https://github.com/user-attachments/assets/bf2b9fd5-94a5-480c-9a1d-64653ab67895)

## Features

### 🗺️ Dynamic Map Interface
- Interactive map using Mapbox GL JS
- Real-time GPS point visualization
- Route rendering for multiple trucks with different colors
- Map controls (zoom, pan, navigation)

### 📊 GPS Data Management
- Support for multiple truck units and dates
- Centralized route storage and management
- Real-time filtering and data processing
- Sample data for demonstration

### 🎛️ Advanced Filtering
- Date range picker for route filtering
- Multi-select truck unit selector
- Quick action buttons (Today, This Week, All Trucks)
- Real-time filter updates

### 📈 Statistics Dashboard
- Travel time and distance calculations
- Speed analytics (average, maximum, minimum)
- Route efficiency metrics and scoring
- Direction analysis and CO₂ estimates
- Recent activity tracking

## Technology Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vuetify 3** - Material Design component framework
- **Mapbox GL JS** - Interactive maps and routing
- **Vue Router** - Single-page application routing
- **Pinia** - State management
- **Vite** - Build tool and development server

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/datasantana/truck-gps-tracker.git
cd truck-gps-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Configure Mapbox token:
   - Get a free API token from [Mapbox](https://www.mapbox.com/)
   - Update the `.env` file:
```bash
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── MapView.vue           # Main map component with Mapbox integration
│   ├── SidePanel.vue         # Filters and controls panel
│   ├── StatisticsPanel.vue   # Analytics and metrics display
│   └── TruckMarker.vue       # Custom truck markers
├── stores/
│   ├── gpsStore.js           # GPS data management with Pinia
│   └── mapStore.js           # Map state management
├── services/
│   ├── mapboxService.js      # Mapbox API integration
│   └── gpsService.js         # GPS data processing
├── utils/
│   ├── dateUtils.js          # Date manipulation utilities
│   └── geoUtils.js           # Geographic calculations
├── views/
│   └── TrackingDashboard.vue # Main dashboard view
└── router/
    └── index.js              # Vue Router configuration
```

## Sample Data

The application includes sample GPS data for demonstration:
- **TRUCK_001**: Routes for 2025-07-28 and 2025-07-29
- **TRUCK_002**: Route for 2025-07-29
- Real GPS coordinates around New York City area
- Calculated statistics including speed, distance, and travel time

## Key Features in Detail

### Map Visualization
- Routes displayed with unique colors per truck
- Start and end markers with popup information
- Automatic map bounds fitting to show all routes
- Interactive controls and attribution

### Filtering System
- Date range selection with calendar picker
- Multi-select dropdown for truck units
- Quick filters for common date ranges
- Clear all filters functionality
- Real-time results summary

### Statistics Calculations
- **Distance**: Haversine formula for accurate GPS calculations
- **Speed**: Average and maximum speed analysis
- **Efficiency**: Custom scoring based on optimal speed metrics
- **Environmental**: Fuel consumption and CO₂ estimates
- **Direction**: Cardinal direction analysis from GPS bearings

### State Management
- Centralized GPS data store with Pinia
- Reactive filtering and updates
- Persistent map state
- Error handling and loading states

## API Integration

The application is designed to integrate with GPS tracking APIs. The `gpsService.js` includes:
- API endpoint configuration
- Data fetching and processing
- Mock data generation for development
- GPS point validation and filtering

## Performance Features

- Efficient GPS point clustering for large datasets
- Route caching to minimize API calls
- Debounced filter updates
- Virtual scrolling support
- Responsive design for desktop and mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
