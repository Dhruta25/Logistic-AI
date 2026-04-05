
const VEHICLE_SPEED_MAP = {
  bike: { clear: 30, rainy: 18, foggy: 22, cold: 25, hot: 28, stormy: 12 },
  'ev van': { clear: 50, rainy: 35, foggy: 40, cold: 45, hot: 48, stormy: 25 },
  truck: { clear: 55, rainy: 38, foggy: 42, cold: 50, hot: 52, stormy: 28 },
  van: { clear: 50, rainy: 35, foggy: 40, cold: 45, hot: 48, stormy: 25 },
  'three wheeler': { clear: 35, rainy: 20, foggy: 25, cold: 30, hot: 32, stormy: 15 },
};

const VEHICLE_RELIABILITY = {
  bike: 0.65,
  'three wheeler': 0.72,
  'ev van': 0.88,
  van: 0.85,
  truck: 0.90,
};

const WEATHER_RISK = {
  clear: 0.05,
  cold: 0.12,
  hot: 0.10,
  foggy: 0.25,
  rainy: 0.35,
  stormy: 0.55,
};

const MODE_URGENCY = {
  'same day': { factor: 1.4, label: 'Same Day' },
  express: { factor: 1.2, label: 'Express' },
  'next day': { factor: 1.0, label: 'Next Day' },
  'two day': { factor: 0.8, label: 'Two Day' },
  standard: { factor: 0.6, label: 'Standard' },
};

const TRAFFIC_BY_REGION = {
  north: 0.18,
  south: 0.14,
  east: 0.10,
  west: 0.22,
  central: 0.16,
  'north-east': 0.08,
};

const PARTNER_PERFORMANCE = {
  delhivery: { rating: 4.2, ontime: 0.89 },
  xpressbees: { rating: 4.0, ontime: 0.85 },
  shadowfax: { rating: 3.8, ontime: 0.82 },
  dhl: { rating: 4.5, ontime: 0.93 },
  bluedart: { rating: 4.3, ontime: 0.91 },
  ecom: { rating: 3.6, ontime: 0.78 },
  fedex: { rating: 4.4, ontime: 0.92 },
  dtdc: { rating: 3.7, ontime: 0.80 },
};

/**
 * Main analysis function — takes delivery data and returns
 * the structured copilot response.
 */
export function analyzeDelivery(data) {
  const {
    distance_km = 100,
    vehicle_type = 'truck',
    weather_condition = 'clear',
    delivery_mode = 'standard',
    region = 'north',
    package_weight_kg = 10,
    delivery_partner = 'delhivery',
    package_type = 'general',
    traffic_level = null,
  } = normalizeInput(data);

  // --- Compute delay risk factors ---
  const weatherRisk = WEATHER_RISK[weather_condition] || 0.10;
  const vehicleReliability = VEHICLE_RELIABILITY[vehicle_type] || 0.80;
  const modeUrgency = (MODE_URGENCY[delivery_mode] || MODE_URGENCY.standard).factor;
  const trafficRisk = traffic_level !== null ? traffic_level / 10 : (TRAFFIC_BY_REGION[region] || 0.15);
  const partnerOntime = (PARTNER_PERFORMANCE[delivery_partner] || { ontime: 0.85 }).ontime;

  // Distance factor (longer = higher risk)
  const distanceFactor = Math.min(distance_km / 500, 1.0);

  // Weight factor
  const weightFactor = Math.min(package_weight_kg / 50, 1.0) * 0.15;

  // Composite delay probability
  let delayProb = (
    (weatherRisk * 0.25) +
    ((1 - vehicleReliability) * 0.20) +
    (trafficRisk * 0.25) +
    (distanceFactor * 0.15) +
    ((1 - partnerOntime) * 0.10) +
    (weightFactor * 0.05)
  ) * modeUrgency;

  delayProb = Math.min(Math.max(delayProb, 0.02), 0.98);
  const delayPct = Math.round(delayProb * 100);

  // --- Compute ETA ---
  const speed = (VEHICLE_SPEED_MAP[vehicle_type] || VEHICLE_SPEED_MAP.truck)[weather_condition] || 40;
  const baseTimeHrs = distance_km / speed;
  const trafficDelay = baseTimeHrs * trafficRisk;
  const weatherDelay = baseTimeHrs * weatherRisk * 0.5;
  const estimatedHrs = baseTimeHrs + trafficDelay + weatherDelay;

  // --- Identify key issues ---
  const issues = [];
  if (weatherRisk >= 0.25) issues.push(`Adverse weather: ${weather_condition} conditions increasing risk by ${Math.round(weatherRisk * 100)}%`);
  if (trafficRisk >= 0.18) issues.push(`High traffic congestion in ${region} region (${Math.round(trafficRisk * 100)}% impact)`);
  if (vehicleReliability < 0.75) issues.push(`${vehicle_type} has low reliability score (${Math.round(vehicleReliability * 100)}%)`);
  if (distance_km > 300) issues.push(`Long-distance delivery (${distance_km} km) increases delay probability`);
  if (modeUrgency > 1.2) issues.push(`${delivery_mode} delivery mode creates tight time constraints`);
  if (partnerOntime < 0.85) issues.push(`${delivery_partner} has below-average on-time rate (${Math.round(partnerOntime * 100)}%)`);
  if (package_weight_kg > 40) issues.push(`Heavy package (${package_weight_kg} kg) may slow handling`);
  if (issues.length === 0) issues.push('No major risk factors detected');

  // --- Generate recommendations ---
  const recommendations = generateRecommendations(data, {
    weatherRisk, vehicleReliability, trafficRisk, modeUrgency, partnerOntime,
    distance_km, vehicle_type, weather_condition, delivery_mode, region, delivery_partner
  });

  // --- Generate what-if simulations ---
  const simulations = generateSimulations(data, {
    delayProb, estimatedHrs, vehicle_type, weather_condition,
    delivery_mode, region, distance_km, delivery_partner
  });

  // --- Priority level ---
  let priority;
  if (delayPct >= 65) priority = 'High';
  else if (delayPct >= 35) priority = 'Medium';
  else priority = 'Low';

  // --- Build explanation ---
  const explanation = buildExplanation({
    delayPct, issues, vehicle_type, weather_condition,
    delivery_mode, region, estimatedHrs, distance_km, delivery_partner
  });

  return {
    summary: buildSummary(delayPct, issues, priority),
    analysis: {
      delay_risk: `${delayPct}%`,
      estimated_time: `${estimatedHrs.toFixed(1)} hours`,
      key_issues: issues.slice(0, 4),
    },
    explanation,
    recommendations: recommendations.slice(0, 4),
    what_if_simulation: simulations.slice(0, 4),
    priority_level: priority,
    _meta: {
      raw_delay_prob: delayProb,
      speed_kmh: speed,
      base_time_hrs: baseTimeHrs,
      total_time_hrs: estimatedHrs,
    }
  };
}

function normalizeInput(data) {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key.toLowerCase().trim()] = typeof value === 'string' ? value.toLowerCase().trim() : value;
  }
  return result;
}

function buildSummary(delayPct, issues, priority) {
  if (delayPct >= 70) return `⚠️ Critical delay risk (${delayPct}%) — ${issues[0] || 'multiple risk factors detected'}`;
  if (delayPct >= 45) return `🟡 Moderate delay risk (${delayPct}%) — ${issues[0] || 'some concerns identified'}`;
  return `✅ Low delay risk (${delayPct}%) — delivery is likely to be on time`;
}

function buildExplanation({ delayPct, issues, vehicle_type, weather_condition, delivery_mode, region, estimatedHrs, distance_km, delivery_partner }) {
  const parts = [];
  parts.push(`This ${distance_km} km delivery via ${vehicle_type} in ${region} region has a ${delayPct}% delay probability.`);

  if (weather_condition !== 'clear') {
    parts.push(`Current ${weather_condition} weather is degrading vehicle speed and road safety.`);
  }

  if (issues.length > 1) {
    parts.push(`Key contributing factors include: ${issues.slice(0, 2).join(' and ').toLowerCase()}.`);
  }

  parts.push(`Estimated delivery time is ${estimatedHrs.toFixed(1)} hours based on current conditions.`);

  const partner = PARTNER_PERFORMANCE[delivery_partner];
  if (partner) {
    parts.push(`${delivery_partner} has a ${Math.round(partner.ontime * 100)}% historical on-time rate.`);
  }

  return parts.join(' ');
}

function generateRecommendations(data, ctx) {
  const recs = [];

  // Vehicle upgrade
  if (ctx.vehicleReliability < 0.85 || ctx.vehicle_type === 'bike') {
    const upgrade = ctx.vehicle_type === 'bike' ? 'ev van' : 'truck';
    const newReliability = VEHICLE_RELIABILITY[upgrade] || 0.90;
    const improvement = Math.round((newReliability - ctx.vehicleReliability) * 100);
    recs.push({
      action: `Switch from ${ctx.vehicle_type} to ${upgrade}`,
      impact: `Improves vehicle reliability by ${improvement}% and reduces delay risk by ~${Math.round(improvement * 0.3)}%`,
      icon: 'fa-truck-moving',
    });
  }

  // Weather mitigation
  if (ctx.weatherRisk >= 0.20) {
    recs.push({
      action: `Delay dispatch until ${ctx.weather_condition} conditions clear`,
      impact: `Could reduce weather-related delay risk by ~${Math.round(ctx.weatherRisk * 60)}%`,
      icon: 'fa-cloud-sun',
    });
  }

  // Route optimization
  if (ctx.trafficRisk >= 0.15 && ctx.distance_km > 50) {
    recs.push({
      action: `Use AI-optimized alternate route to avoid ${ctx.region} congestion`,
      impact: `Estimated ${Math.round(ctx.trafficRisk * 40)}-minute savings on travel time`,
      icon: 'fa-route',
    });
  }

  // Delivery mode change
  if (ctx.modeUrgency > 1.0) {
    const current = MODE_URGENCY[ctx.delivery_mode]?.label || ctx.delivery_mode;
    recs.push({
      action: `Consider downgrading from ${current} to Next Day delivery`,
      impact: `Reduces urgency pressure and improves success probability by ~20%`,
      icon: 'fa-clock',
    });
  }

  // Partner switch
  if (ctx.partnerOntime < 0.88) {
    const bestPartner = Object.entries(PARTNER_PERFORMANCE)
      .sort((a, b) => b[1].ontime - a[1].ontime)[0];
    recs.push({
      action: `Switch from ${ctx.delivery_partner} to ${bestPartner[0]} for this delivery`,
      impact: `${bestPartner[0]} has ${Math.round(bestPartner[1].ontime * 100)}% on-time rate vs ${Math.round(ctx.partnerOntime * 100)}%`,
      icon: 'fa-handshake',
    });
  }

  // Weight-based
  if (data.package_weight_kg > 30) {
    recs.push({
      action: `Split heavy package (${data.package_weight_kg}kg) into multiple lighter consignments`,
      impact: `Faster handling and loading, reducing warehouse dwell time by ~15 minutes`,
      icon: 'fa-boxes-stacked',
    });
  }

  // Always add at least 2
  if (recs.length < 2) {
    recs.push({
      action: 'Enable real-time GPS tracking for this consignment',
      impact: 'Provides live ETA updates and proactive delay notifications',
      icon: 'fa-satellite',
    });
    recs.push({
      action: 'Pre-notify the receiver with dynamic ETA link',
      impact: 'Reduces failed delivery attempts by ~30%',
      icon: 'fa-mobile-screen',
    });
  }

  return recs;
}

function generateSimulations(data, ctx) {
  const sims = [];
  const { delayProb, estimatedHrs, vehicle_type, weather_condition, delivery_mode, distance_km, delivery_partner } = ctx;

  // Sim 1: Vehicle upgrade
  if (vehicle_type !== 'truck') {
    const newSpeed = (VEHICLE_SPEED_MAP.truck || {})[weather_condition] || 55;
    const newTime = distance_km / newSpeed;
    const newDelay = Math.max(delayProb - 0.15, 0.02);
    sims.push({
      scenario: `Using truck instead of ${vehicle_type}`,
      result: `Delay risk reduces to ~${Math.round(newDelay * 100)}%, ETA improves to ${newTime.toFixed(1)}h`,
    });
  }

  // Sim 2: Weather improvement
  if (weather_condition !== 'clear') {
    const clearSpeed = (VEHICLE_SPEED_MAP[vehicle_type] || VEHICLE_SPEED_MAP.truck).clear;
    const clearTime = distance_km / clearSpeed;
    const weatherReduction = WEATHER_RISK[weather_condition] - WEATHER_RISK.clear;
    const newDelay = Math.max(delayProb - weatherReduction, 0.02);
    sims.push({
      scenario: `If weather clears to favorable conditions`,
      result: `Delay risk drops to ~${Math.round(newDelay * 100)}%, travel time reduces to ${clearTime.toFixed(1)}h`,
    });
  }

  // Sim 3: Mode upgrade
  if (delivery_mode !== 'same day') {
    const expressChange = delayProb * 1.15;
    sims.push({
      scenario: `Upgrading to express delivery`,
      result: `Delivery time improves by ~25% but delay risk increases to ~${Math.round(Math.min(expressChange, 0.95) * 100)}% due to tighter window`,
    });
  }

  // Sim 4: Partner switch
  const bestPartner = Object.entries(PARTNER_PERFORMANCE)
    .sort((a, b) => b[1].ontime - a[1].ontime)[0];
  if (bestPartner[0] !== delivery_partner) {
    const improvement = bestPartner[1].ontime - (PARTNER_PERFORMANCE[delivery_partner]?.ontime || 0.85);
    if (improvement > 0.02) {
      sims.push({
        scenario: `Switching to ${bestPartner[0]} as delivery partner`,
        result: `On-time probability improves by ${Math.round(improvement * 100)}%, delay risk drops to ~${Math.round(Math.max(delayProb - improvement * 0.5, 0.02) * 100)}%`,
      });
    }
  }

  // Sim 5: Route optimization
  if (distance_km > 100) {
    const optimizedDist = distance_km * 0.85;
    const optimizedTime = optimizedDist / ((VEHICLE_SPEED_MAP[vehicle_type] || VEHICLE_SPEED_MAP.truck)[weather_condition] || 40);
    sims.push({
      scenario: `Using AI-optimized route (15% shorter)`,
      result: `Distance reduces to ${Math.round(optimizedDist)} km, ETA improves to ${optimizedTime.toFixed(1)}h`,
    });
  }

  return sims;
}

// ============================================
// SAMPLE SCENARIOS FOR QUICK-START
// ============================================
export const SAMPLE_SCENARIOS = [
  {
    label: '🌧️ Rainy Day Bike Delivery',
    data: {
      distance_km: 120,
      vehicle_type: 'bike',
      weather_condition: 'rainy',
      delivery_mode: 'same day',
      region: 'west',
      package_weight_kg: 15,
      delivery_partner: 'shadowfax',
      package_type: 'electronics',
    }
  },
  {
    label: '🚛 Long-Haul Truck Delivery',
    data: {
      distance_km: 450,
      vehicle_type: 'truck',
      weather_condition: 'foggy',
      delivery_mode: 'next day',
      region: 'north',
      package_weight_kg: 48,
      delivery_partner: 'delhivery',
      package_type: 'automobile parts',
    }
  },
  {
    label: '⚡ Express EV Delivery',
    data: {
      distance_km: 80,
      vehicle_type: 'ev van',
      weather_condition: 'clear',
      delivery_mode: 'express',
      region: 'south',
      package_weight_kg: 8,
      delivery_partner: 'dhl',
      package_type: 'cosmetics',
    }
  },
  {
    label: '⛈️ Storm Alert Delivery',
    data: {
      distance_km: 200,
      vehicle_type: 'three wheeler',
      weather_condition: 'stormy',
      delivery_mode: 'same day',
      region: 'east',
      package_weight_kg: 25,
      delivery_partner: 'ecom',
      package_type: 'groceries',
    }
  },
  {
    label: '📦 Heavy Package Standard',
    data: {
      distance_km: 350,
      vehicle_type: 'van',
      weather_condition: 'hot',
      delivery_mode: 'two day',
      region: 'central',
      package_weight_kg: 45,
      delivery_partner: 'dtdc',
      package_type: 'furniture',
    }
  },
];

/**
 * Generate natural-language query analysis from user text
 */
export function parseNaturalQuery(query) {
  const q = query.toLowerCase();
  const extracted = {};

  // Distance
  const distMatch = q.match(/(\d+)\s*(km|kilometer)/);
  if (distMatch) extracted.distance_km = parseInt(distMatch[1]);

  // Vehicle
  for (const v of ['bike', 'truck', 'van', 'ev van', 'three wheeler']) {
    if (q.includes(v)) { extracted.vehicle_type = v; break; }
  }

  // Weather
  for (const w of ['rainy', 'stormy', 'foggy', 'cold', 'hot', 'clear']) {
    if (q.includes(w)) { extracted.weather_condition = w; break; }
  }

  // Mode
  for (const m of ['same day', 'express', 'next day', 'two day', 'standard']) {
    if (q.includes(m)) { extracted.delivery_mode = m; break; }
  }

  // Region
  for (const r of ['north-east', 'north', 'south', 'east', 'west', 'central']) {
    if (q.includes(r)) { extracted.region = r; break; }
  }

  // Weight
  const weightMatch = q.match(/(\d+\.?\d*)\s*(kg|kilo)/);
  if (weightMatch) extracted.package_weight_kg = parseFloat(weightMatch[1]);

  // Partner
  for (const p of Object.keys(PARTNER_PERFORMANCE)) {
    if (q.includes(p)) { extracted.delivery_partner = p; break; }
  }

  return extracted;
}
