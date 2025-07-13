// Demo data for public charts without requiring login
export const salesData = [
  { Month: 'January', Sales: 65, Expenses: 40, Profit: 25 },
  { Month: 'February', Sales: 59, Expenses: 38, Profit: 21 },
  { Month: 'March', Sales: 80, Expenses: 43, Profit: 37 },
  { Month: 'April', Sales: 81, Expenses: 45, Profit: 36 },
  { Month: 'May', Sales: 56, Expenses: 39, Profit: 17 },
  { Month: 'June', Sales: 55, Expenses: 37, Profit: 18 },
  { Month: 'July', Sales: 40, Expenses: 30, Profit: 10 },
  { Month: 'August', Sales: 70, Expenses: 40, Profit: 30 },
  { Month: 'September', Sales: 90, Expenses: 50, Profit: 40 },
  { Month: 'October', Sales: 85, Expenses: 45, Profit: 40 },
  { Month: 'November', Sales: 95, Expenses: 55, Profit: 40 },
  { Month: 'December', Sales: 100, Expenses: 60, Profit: 40 }
];

export const productData = [
  { Product: 'Product A', Revenue: 4200, Units: 150, Cost: 3000 },
  { Product: 'Product B', Revenue: 3800, Units: 120, Cost: 2500 },
  { Product: 'Product C', Revenue: 5100, Units: 180, Cost: 3500 },
  { Product: 'Product D', Revenue: 2900, Units: 90, Cost: 2000 },
  { Product: 'Product E', Revenue: 6300, Units: 210, Cost: 4500 },
  { Product: 'Product F', Revenue: 3500, Units: 110, Cost: 2400 }
];

export const regionData = [
  { Region: 'North', Q1: 10500, Q2: 12800, Q3: 11200, Q4: 13900 },
  { Region: 'South', Q1: 9800, Q2: 11300, Q3: 10500, Q4: 12100 },
  { Region: 'East', Q1: 12300, Q2: 14100, Q3: 13200, Q4: 15400 },
  { Region: 'West', Q1: 11200, Q2: 12900, Q3: 12100, Q4: 14300 },
  { Region: 'Central', Q1: 8900, Q2: 9800, Q3: 9200, Q4: 10700 }
];

// 3D data sample
export const performanceData = [];
for (let x = 0; x < 10; x++) {
  for (let z = 0; z < 10; z++) {
    performanceData.push({
      X: x,
      Y: Math.sin(x/3) * Math.cos(z/3) * 10 + 20,
      Z: z
    });
  }
}

// Generate chart colors
export const chartColors = [
  '#60A5FA', // Blue
  '#34D399', // Green
  '#F97316', // Orange
  '#A78BFA', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#FBBF24', // Yellow
  '#EF4444'  // Red
];

// Helper function to get color with opacity
export const getColorWithOpacity = (color, opacity = 0.7) => {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}; 