/**
 * Agent API Client
 * Handles communication between the frontend and the FastAPI agent endpoints.
 * Falls back to local simulation if backend is unavailable.
 */

const API_BASE = 'http://localhost:8000';

let _backendAvailable = null; // cached health check result

/**
 * Check if the backend is reachable.
 */
async function checkBackend() {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const res = await fetch(`${API_BASE}/agent/health`, { signal: AbortSignal.timeout(3000) });
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  // Re-check after 30s
  setTimeout(() => { _backendAvailable = null; }, 30000);
  return _backendAvailable;
}

/**
 * POST request helper with fallback.
 */
async function agentPost(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[AgentAPI] ${endpoint} failed:`, err.message);
    return null;
  }
}

/**
 * Predict delay for a shipment.
 */
export async function predictDelay(data) {
  const result = await agentPost('/agent/predict-delay', data);
  if (result) return result;

  // Fallback: local heuristic
  return localDelayPrediction(data);
}

/**
 * Optimize route between two cities.
 */
export async function optimizeRoute(source, destination, conditions = {}) {
  const result = await agentPost('/agent/optimize-route', {
    source,
    destination,
    conditions,
  });
  if (result) return result;

  // Fallback: local mock route
  return localRouteFallback(source, destination);
}

/**
 * Chat with the AI agent.
 */
export async function chatWithAgent(message) {
  const result = await agentPost('/agent/chat', { message });
  if (result) return result;

  // Fallback: local chatbot
  return localChatFallback(message);
}

/**
 * Get all cities in the network.
 */
export async function getCities() {
  try {
    const res = await fetch(`${API_BASE}/agent/cities`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) return (await res.json()).cities;
  } catch { /* Use fallback */ }

  return LOCAL_CITIES;
}

/**
 * Get agent health status.
 */
export async function getAgentHealth() {
  try {
    const res = await fetch(`${API_BASE}/agent/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch { /* offline */ }
  return { status: 'offline', agents: {} };
}


// ══════════════════════════════════════════════
// LOCAL FALLBACKS (when backend is unavailable)
// ══════════════════════════════════════════════

const LOCAL_CITIES = [
  { city: "Delhi", lat: 28.6139, lng: 77.2090, region: "north" },
  { city: "Mumbai", lat: 19.0760, lng: 72.8777, region: "west" },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946, region: "south" },
  { city: "Chennai", lat: 13.0827, lng: 80.2707, region: "south" },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639, region: "east" },
  { city: "Hyderabad", lat: 17.3850, lng: 78.4867, region: "south" },
  { city: "Pune", lat: 18.5204, lng: 73.8567, region: "west" },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714, region: "west" },
  { city: "Jaipur", lat: 26.9124, lng: 75.7873, region: "north" },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462, region: "north" },
  { city: "Chandigarh", lat: 30.7333, lng: 76.7794, region: "north" },
  { city: "Surat", lat: 21.1702, lng: 72.8311, region: "west" },
  { city: "Nagpur", lat: 21.1458, lng: 79.0882, region: "central" },
  { city: "Patna", lat: 25.6093, lng: 85.1376, region: "east" },
  { city: "Varanasi", lat: 25.3176, lng: 82.9739, region: "north" },
  { city: "Indore", lat: 22.7196, lng: 75.8577, region: "central" },
  { city: "Bhopal", lat: 23.2599, lng: 77.4126, region: "central" },
  { city: "Goa", lat: 15.2993, lng: 74.1240, region: "west" },
  { city: "Kochi", lat: 9.9312, lng: 76.2673, region: "south" },
  { city: "Coimbatore", lat: 11.0168, lng: 76.9558, region: "south" },
  { city: "Vijayawada", lat: 16.5062, lng: 80.6480, region: "south" },
];

// Simulated routes for fallback
const LOCAL_ROUTES = [
  { source: "Delhi", dest: "Mumbai", via: ["Delhi", "Jaipur", "Ahmedabad", "Mumbai"], distance: 1400, hours: 22 },
  { source: "Delhi", dest: "Bengaluru", via: ["Delhi", "Agra", "Bhopal", "Hyderabad", "Bengaluru"], distance: 2150, hours: 34 },
  { source: "Mumbai", dest: "Chennai", via: ["Mumbai", "Pune", "Bengaluru", "Chennai"], distance: 1330, hours: 21 },
  { source: "Mumbai", dest: "Delhi", via: ["Mumbai", "Ahmedabad", "Jaipur", "Delhi"], distance: 1400, hours: 22 },
  { source: "Bengaluru", dest: "Chennai", via: ["Bengaluru", "Chennai"], distance: 350, hours: 5.5 },
  { source: "Kolkata", dest: "Delhi", via: ["Kolkata", "Patna", "Lucknow", "Delhi"], distance: 1500, hours: 25 },
  { source: "Hyderabad", dest: "Vijayawada", via: ["Hyderabad", "Vijayawada"], distance: 275, hours: 4.5 },
];

function localDelayPrediction(data) {
  const weather = (data.Weather || data.weather || 'clear').toLowerCase();
  const traffic = parseInt(data.Traffic_Level || data.traffic_level || 5);
  const distance = parseFloat(data.Distance_km || data.distance_km || 200);

  const weatherRisk = { clear: 0.05, cold: 0.12, hot: 0.10, foggy: 0.25, rainy: 0.35, stormy: 0.55 };
  const wr = weatherRisk[weather] || 0.10;
  const prob = Math.min(Math.max(
    wr * 0.35 + (traffic / 10) * 0.35 + Math.min(distance / 800, 1) * 0.30,
    0.02
  ), 0.98);

  const reasons = [];
  if (wr >= 0.20) reasons.push(`${weather} weather increasing delay risk by ${Math.round(wr * 100)}%`);
  if (traffic >= 7) reasons.push(`Heavy traffic (level ${traffic}/10) causing slowdowns`);
  if (distance > 300) reasons.push(`Long-distance delivery (${distance} km) increases uncertainty`);
  if (!reasons.length) reasons.push('No major risk factors detected');

  return {
    prediction: prob >= 0.45 ? 1 : 0,
    status: prob >= 0.45 ? 'Delayed' : 'On-Time',
    probability: Math.round(prob * 1000) / 1000,
    reasons,
    confidence: 0.65,
    explainability: { weather: wr, traffic: traffic / 10, distance: distance / 800 },
    _fallback: true,
  };
}

function localRouteFallback(source, dest) {
  const route = LOCAL_ROUTES.find(r =>
    r.source.toLowerCase() === source.toLowerCase() && r.dest.toLowerCase() === dest.toLowerCase()
  );

  if (route) {
    return {
      best_route: {
        path: route.via,
        distance_km: route.distance,
        estimated_hours: route.hours,
        waypoints: route.via.map(city => {
          const c = LOCAL_CITIES.find(cc => cc.city === city);
          return c ? { city: c.city, lat: c.lat, lng: c.lng } : { city, lat: 20, lng: 78 };
        }),
      },
      alternatives: [],
      conditions_applied: ["Standard conditions (local fallback)"],
      _fallback: true,
    };
  }

  // Generate a simple direct route
  const srcCity = LOCAL_CITIES.find(c => c.city.toLowerCase() === source.toLowerCase());
  const dstCity = LOCAL_CITIES.find(c => c.city.toLowerCase() === dest.toLowerCase());

  if (srcCity && dstCity) {
    const dist = Math.round(
      Math.sqrt(Math.pow((srcCity.lat - dstCity.lat) * 111, 2) + Math.pow((srcCity.lng - dstCity.lng) * 85, 2))
    );
    return {
      best_route: {
        path: [srcCity.city, dstCity.city],
        distance_km: dist,
        estimated_hours: Math.round(dist / 55 * 10) / 10,
        waypoints: [
          { city: srcCity.city, lat: srcCity.lat, lng: srcCity.lng },
          { city: dstCity.city, lat: dstCity.lat, lng: dstCity.lng },
        ],
      },
      alternatives: [],
      conditions_applied: ["Direct route estimate (local fallback)"],
      _fallback: true,
    };
  }

  return { error: `Could not find route from ${source} to ${dest}`, _fallback: true };
}

function localChatFallback(message) {
  const msg = message.toLowerCase();

  if (msg.includes('help') || msg.includes('what can')) {
    return {
      response: "👋 I'm the Logistics AI Assistant! I can help with delay predictions, route optimization, and shipment tracking. (Note: Backend is offline — using local mode)",
      agent_used: "chatbot (local)",
      data: null,
      suggestions: ["Predict delay for Mumbai to Delhi", "Find route from Bengaluru to Chennai", "Show delivery status"],
    };
  }

  if (msg.includes('delay') || msg.includes('risk') || msg.includes('late')) {
    const result = localDelayPrediction({ distance_km: 250, weather: 'rainy', traffic_level: 6 });
    return {
      response: `🟡 **Delay Probability: ${Math.round(result.probability * 100)}%**\n${result.reasons.join('\n• ')}`,
      agent_used: "delay_prediction (local)",
      data: { delay: result },
      suggestions: ["Show alternate routes", "Check weather"],
    };
  }

  if (msg.includes('route') || msg.includes('fastest') || msg.includes('path')) {
    return {
      response: "🗺️ Please specify source and destination.\n\nExample: \"Find route from Mumbai to Delhi\"",
      agent_used: "chatbot (local)",
      data: null,
      suggestions: ["Route from Delhi to Mumbai", "Route from Bengaluru to Chennai"],
    };
  }

  return {
    response: "I can help with delay predictions, route optimization, and delivery tracking. Try asking about a specific shipment or route! (Backend offline — limited mode)",
    agent_used: "chatbot (local)",
    data: null,
    suggestions: ["Predict delay", "Optimize route", "Show shipment status"],
  };
}
