/**
 * PRAGATI AI — Monsoon Signal design reminder
 * This data adapter keeps the dashboard calibrated for observed prices, weather,
 * moving averages, and risk signals, so a CSV/API can replace the profiles without UI redesign.
 */

export type RiskLevel = "Low" | "Stable" | "Moderate" | "High" | "Critical";

export type CommodityProfile = {
  id: string;
  name: string;
  category: "Vegetables" | "Pulses" | "Edible Oils";
  unit: string;
  icon: string;
  colour: string;
  state: string;
  centre: string;
  retailPrice: number;
  wholesalePrice: number;
  roll7: number;
  roll30: number;
  forecast: number;
  change: number;
  risk: RiskLevel;
  confidence: number;
  rainfall: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  crudeOil: number;
  monsoon: boolean;
  buffer: number;
  history: number[];
  rainfallSeries: number[];
  centres: { state: string; centre: string; price: number; rainfall: number; risk: RiskLevel; x: number; y: number }[];
};

export const timeline = ["01 Jul", "08 Jul", "15 Jul", "22 Jul", "29 Jul", "05 Aug", "12 Aug", "19 Aug", "26 Aug", "02 Sep", "09 Sep", "16 Sep"];

export const commodities: CommodityProfile[] = [
  {
    id: "onion",
    name: "Onion",
    category: "Vegetables",
    unit: "kg",
    icon: "◉",
    colour: "#ea8a22",
    state: "Maharashtra",
    centre: "Nashik",
    retailPrice: 39.8,
    wholesalePrice: 29.4,
    roll7: 36.2,
    roll30: 33.8,
    forecast: 44.7,
    change: 12.3,
    risk: "High",
    confidence: 91,
    rainfall: 18.6,
    tempMax: 28.8,
    tempMin: 21.4,
    humidity: 78,
    crudeOil: 82.6,
    monsoon: true,
    buffer: 18400,
    history: [28.6, 29.4, 30.2, 31.8, 32.6, 33.1, 34.9, 35.4, 36.2, 37.6, 38.4, 39.8],
    rainfallSeries: [5, 12, 9, 18, 14, 21, 25, 17, 19, 23, 21, 18.6],
    centres: [
      { state: "Maharashtra", centre: "Nashik", price: 39.8, rainfall: 18.6, risk: "High", x: 38, y: 56 },
      { state: "Karnataka", centre: "Bengaluru", price: 35.2, rainfall: 22.1, risk: "Moderate", x: 38, y: 75 },
      { state: "Delhi", centre: "Azadpur", price: 43.6, rainfall: 4.2, risk: "High", x: 48, y: 31 },
      { state: "West Bengal", centre: "Kolkata", price: 41.5, rainfall: 14.4, risk: "Moderate", x: 69, y: 48 },
      { state: "Tamil Nadu", centre: "Chennai", price: 37.4, rainfall: 28.7, risk: "Stable", x: 53, y: 84 },
    ],
  },
  {
    id: "potato",
    name: "Potato",
    category: "Vegetables",
    unit: "kg",
    icon: "●",
    colour: "#8a5f3b",
    state: "West Bengal",
    centre: "Kolkata",
    retailPrice: 31.6,
    wholesalePrice: 22.8,
    roll7: 30.4,
    roll30: 29.7,
    forecast: 33.8,
    change: 6.9,
    risk: "Moderate",
    confidence: 89,
    rainfall: 14.4,
    tempMax: 30.1,
    tempMin: 24.3,
    humidity: 81,
    crudeOil: 82.6,
    monsoon: true,
    buffer: 12200,
    history: [26.2, 26.8, 27.3, 27.5, 28.1, 28.7, 29.4, 29.8, 30.2, 30.4, 31.2, 31.6],
    rainfallSeries: [9, 18, 13, 16, 19, 23, 21, 19, 15, 18, 16, 14.4],
    centres: [
      { state: "West Bengal", centre: "Kolkata", price: 31.6, rainfall: 14.4, risk: "Moderate", x: 69, y: 48 },
      { state: "Uttar Pradesh", centre: "Lucknow", price: 29.3, rainfall: 6.7, risk: "Stable", x: 52, y: 38 },
      { state: "Punjab", centre: "Ludhiana", price: 28.9, rainfall: 5.8, risk: "Stable", x: 43, y: 25 },
      { state: "Bihar", centre: "Patna", price: 30.6, rainfall: 12.9, risk: "Moderate", x: 59, y: 43 },
      { state: "Karnataka", centre: "Bengaluru", price: 33.2, rainfall: 22.1, risk: "Moderate", x: 38, y: 75 },
    ],
  },
  {
    id: "gram-dal",
    name: "Gram Dal",
    category: "Pulses",
    unit: "kg",
    icon: "◒",
    colour: "#b78a26",
    state: "Madhya Pradesh",
    centre: "Indore",
    retailPrice: 87.4,
    wholesalePrice: 76.8,
    roll7: 86.6,
    roll30: 85.9,
    forecast: 90.1,
    change: 3.1,
    risk: "Stable",
    confidence: 94,
    rainfall: 10.2,
    tempMax: 29.3,
    tempMin: 20.1,
    humidity: 68,
    crudeOil: 82.6,
    monsoon: true,
    buffer: 39600,
    history: [82.9, 83.4, 84.0, 84.2, 85.1, 85.4, 85.8, 86.1, 86.4, 86.6, 86.9, 87.4],
    rainfallSeries: [3, 7, 6, 12, 9, 10, 14, 11, 8, 12, 13, 10.2],
    centres: [
      { state: "Madhya Pradesh", centre: "Indore", price: 87.4, rainfall: 10.2, risk: "Stable", x: 46, y: 49 },
      { state: "Rajasthan", centre: "Jaipur", price: 85.2, rainfall: 2.8, risk: "Low", x: 40, y: 40 },
      { state: "Maharashtra", centre: "Nagpur", price: 88.5, rainfall: 13.5, risk: "Stable", x: 48, y: 59 },
      { state: "Delhi", centre: "Azadpur", price: 90.7, rainfall: 4.2, risk: "Moderate", x: 48, y: 31 },
      { state: "Gujarat", centre: "Ahmedabad", price: 86.0, rainfall: 5.4, risk: "Stable", x: 34, y: 54 },
    ],
  },
  {
    id: "tur-dal",
    name: "Tur Dal",
    category: "Pulses",
    unit: "kg",
    icon: "◐",
    colour: "#4e9f5a",
    state: "Karnataka",
    centre: "Kalaburagi",
    retailPrice: 154.2,
    wholesalePrice: 139.4,
    roll7: 148.7,
    roll30: 144.2,
    forecast: 167.6,
    change: 8.7,
    risk: "High",
    confidence: 92,
    rainfall: 21.3,
    tempMax: 27.6,
    tempMin: 20.3,
    humidity: 76,
    crudeOil: 82.6,
    monsoon: true,
    buffer: 8300,
    history: [132.4, 134.7, 136.5, 138.1, 139.6, 141.1, 142.8, 144.2, 145.9, 148.7, 151.4, 154.2],
    rainfallSeries: [8, 11, 14, 17, 19, 22, 25, 24, 23, 20, 22, 21.3],
    centres: [
      { state: "Karnataka", centre: "Kalaburagi", price: 154.2, rainfall: 21.3, risk: "High", x: 40, y: 69 },
      { state: "Maharashtra", centre: "Latur", price: 150.6, rainfall: 16.3, risk: "High", x: 43, y: 61 },
      { state: "Telangana", centre: "Hyderabad", price: 156.4, rainfall: 19.4, risk: "High", x: 50, y: 69 },
      { state: "Gujarat", centre: "Rajkot", price: 146.8, rainfall: 7.4, risk: "Moderate", x: 30, y: 55 },
      { state: "Delhi", centre: "Azadpur", price: 160.3, rainfall: 4.2, risk: "High", x: 48, y: 31 },
    ],
  },
  {
    id: "groundnut-oil",
    name: "Groundnut Oil",
    category: "Edible Oils",
    unit: "litre",
    icon: "◌",
    colour: "#417b6d",
    state: "Gujarat",
    centre: "Rajkot",
    retailPrice: 184.5,
    wholesalePrice: 163.7,
    roll7: 181.4,
    roll30: 177.8,
    forecast: 192.6,
    change: 4.4,
    risk: "Moderate",
    confidence: 88,
    rainfall: 7.4,
    tempMax: 31.2,
    tempMin: 23.4,
    humidity: 64,
    crudeOil: 82.6,
    monsoon: false,
    buffer: 6400,
    history: [171.8, 172.3, 173.5, 174.1, 175.0, 176.8, 177.8, 178.6, 179.8, 181.4, 182.7, 184.5],
    rainfallSeries: [2, 4, 6, 5, 7, 4, 8, 9, 6, 5, 7, 7.4],
    centres: [
      { state: "Gujarat", centre: "Rajkot", price: 184.5, rainfall: 7.4, risk: "Moderate", x: 30, y: 55 },
      { state: "Rajasthan", centre: "Jaipur", price: 180.7, rainfall: 2.8, risk: "Stable", x: 40, y: 40 },
      { state: "Maharashtra", centre: "Mumbai", price: 188.2, rainfall: 18.2, risk: "Moderate", x: 37, y: 64 },
      { state: "Delhi", centre: "Azadpur", price: 191.1, rainfall: 4.2, risk: "High", x: 48, y: 31 },
      { state: "Tamil Nadu", centre: "Chennai", price: 186.6, rainfall: 28.7, risk: "Moderate", x: 53, y: 84 },
    ],
  },
  {
    id: "mustard-oil",
    name: "Mustard Oil",
    category: "Edible Oils",
    unit: "litre",
    icon: "◍",
    colour: "#9d8b28",
    state: "Rajasthan",
    centre: "Jaipur",
    retailPrice: 172.8,
    wholesalePrice: 151.2,
    roll7: 169.5,
    roll30: 165.8,
    forecast: 181.7,
    change: 5.1,
    risk: "Moderate",
    confidence: 90,
    rainfall: 2.8,
    tempMax: 32.1,
    tempMin: 23.2,
    humidity: 57,
    crudeOil: 82.6,
    monsoon: false,
    buffer: 7100,
    history: [159.2, 160.3, 161.7, 162.4, 163.8, 164.7, 165.8, 166.4, 168.2, 169.5, 171.1, 172.8],
    rainfallSeries: [1, 2, 2, 4, 3, 4, 2, 3, 5, 3, 2, 2.8],
    centres: [
      { state: "Rajasthan", centre: "Jaipur", price: 172.8, rainfall: 2.8, risk: "Moderate", x: 40, y: 40 },
      { state: "Haryana", centre: "Karnal", price: 169.2, rainfall: 3.1, risk: "Stable", x: 45, y: 30 },
      { state: "Uttar Pradesh", centre: "Lucknow", price: 174.6, rainfall: 6.7, risk: "Moderate", x: 52, y: 38 },
      { state: "Delhi", centre: "Azadpur", price: 177.2, rainfall: 4.2, risk: "Moderate", x: 48, y: 31 },
      { state: "Madhya Pradesh", centre: "Indore", price: 170.4, rainfall: 10.2, risk: "Stable", x: 46, y: 49 },
    ],
  },
];

export const priceRows = commodities.flatMap((commodity, commodityIndex) =>
  Array.from({ length: 5 }, (_, index) => {
    const place = commodity.centres[index];
    const wholesale = Math.max(commodity.wholesalePrice - index * 0.8, 1);
    return {
      id: `${commodity.id}-${index}`,
      commodity: commodity.name,
      date: `2026-08-${String(14 - index).padStart(2, "0")}`,
      state: place.state,
      centre: place.centre,
      retail: Number((place.price - commodityIndex * 0.2).toFixed(1)),
      wholesale: Number(wholesale.toFixed(1)),
      rainfall: place.rainfall,
      temperature: Number((commodity.tempMax - index * 0.3).toFixed(1)),
      humidity: commodity.humidity - index,
      crudeOil: Number((commodity.crudeOil + index * 0.2).toFixed(1)),
      risk: place.risk,
    };
  }),
);

export function getCommodity(id: string) {
  return commodities.find((commodity) => commodity.id === id) ?? commodities[0];
}

export function riskClass(risk: RiskLevel) {
  return {
    Low: "risk-low",
    Stable: "risk-stable",
    Moderate: "risk-moderate",
    High: "risk-high",
    Critical: "risk-critical",
  }[risk];
}

export function csvRowToObservation(row: Record<string, string>) {
  return {
    date: row.date,
    state: row.state,
    centre: row.centre,
    commodity: row.commodity,
    retail: Number(row.retail_price),
    wholesale: Number(row.wholesale_price),
    rainfall: Number(row.rainfall_mm),
    temperature: Number(row.temp_max_c),
    humidity: Number(row.humidity_pct),
    crudeOil: Number(row.crude_oil_usd),
    roll7: Number(row.wholesale_price_roll7_mean),
    roll30: Number(row.wholesale_price_roll30_mean),
  };
}
