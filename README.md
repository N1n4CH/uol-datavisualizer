# Data Visualization Dashboard

An interactive data visualization dashboard built with p5.js featuring multiple chart types and real-time controls.

## Features

-   **Tech Diversity Gender**: Stacked bar chart showing gender distribution across tech companies
-   **Tech Diversity Race**: Interactive pie chart with dropdown company selection
-   **Pay Gap 1997-2017**: Line chart showing historical pay gap trends
-   **Pay Gap by Job**: Scatter plot with bubble sizes representing job volume
-   **Climate Change**: Animated line chart with gradient background and slider controls

## Setup Instructions

### 1. Download All Files

Download each file from the artifacts and organize them in this folder structure:

```
project-folder/
├── index.html
├── style.css
├── sketch.js
├── gallery.js
├── helper-functions.js
├── pie-chart.js
├── tech-diversity-gender.js
├── tech-diversity-race.js
├── pay-gap-1997-2017.js
├── pay-gap-by-job-2017.js
├── climate-change.js
└── data/
    ├── tech-diversity/
    │   ├── gender-2018.csv
    │   └── race-2018.csv
    ├── pay-gap/
    │   ├── all-employees-hourly-pay-by-gender-1997-2017.csv
    │   └── occupation-hourly-pay-by-gender-2017.csv
    └── surface-temperature/
        └── surface-temperature.csv
```

### 2. Create Data Folders

Create the following folder structure in your project directory:

-   `data/tech-diversity/`
-   `data/pay-gap/`
-   `data/surface-temperature/`

### 3. Add CSV Files

Place each CSV file in its corresponding folder as shown in the structure above.

### 4. Run the Project

#### Option A: VS Code Live Server

1. Open the project folder in VS Code
2. Install the "Live Server" extension
3. Right-click on `index.html` and select "Open with Live Server"

#### Option B: Python Server

1. Open terminal in the project folder
2. Run: `python -m http.server 8000`
3. Open browser to `http://localhost:8000`

#### Option C: Node.js Server

1. Install: `npm install -g http-server`
2. Run: `http-server`
3. Open browser to the provided URL

## Completed Extensions

All `???` sections have been completed with:

✅ **Tech Diversity Gender**:

-   Data extraction using `getString()` and `getNum()`
-   Male employee rectangle positioning

✅ **Tech Diversity Race**:

-   Dynamic dropdown creation and population
-   Company selection integration

✅ **Pay Gap Time Series**:

-   `mapPayGapToHeight()` function implementation
-   Line drawing between data points

✅ **Pay Gap by Job Scatter Plot**:

-   Three-dimensional data mapping (x, y, size)
-   Bubble chart with proper scaling

✅ **Climate Change**:

-   Temperature-to-color mapping
-   Gradient background rectangles
-   Interactive slider controls

## Usage

1. Click on any visualization name in the left menu
2. Use interactive controls:
    - **Climate Change**: Adjust start/end year sliders
    - **Tech Diversity Race**: Select companies from dropdown
3. All visualizations update in real-time

## Technical Features

-   Modular object-oriented design
-   Interactive UI components with p5.js
-   Real-time data filtering and updates
-   Responsive canvas sizing
-   Professional data visualization techniques

## Browser Compatibility

Tested on:

-   Chrome (recommended)
-   Firefox
-   Safari
-   Edge

## Troubleshooting

**Data not loading?**

-   Ensure CSV files are in correct folders
-   Check browser console for path errors
-   Verify server is running properly

**Visualizations not switching?**

-   Check browser console for JavaScript errors
-   Ensure all .js files are in the project root
-   Refresh the page and try again
