/**
 * Agent Hub Dashboard
 * Interactive multi-agent visualization dashboard with:
 *  - Live route map with vehicle simulation
 *  - Delay alerts panel 
 *  - Chat interface to interact with agents
 */

import L from 'leaflet';
import { predictDelay, optimizeRoute, chatWithAgent, getCities, getAgentHealth } from './agentApi.js';

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let agentMap = null;
let vehicleMarkers = [];
let routeLayers = [];
let simulationInterval = null;
let chatHistory = [];

// Simulated active shipments for live tracking
const activeShipments = [
  {
    id: 'LD-4821', route: 'Delhi → Jaipur', driver: 'Rajesh K.',
    status: 'on-time', progress: 0.72,
    origin: { lat: 28.6139, lng: 77.2090 },
    dest: { lat: 26.9124, lng: 75.7873 },
    waypoints: [
      { lat: 28.6139, lng: 77.2090 },
      { lat: 27.8, lng: 76.5 },
      { lat: 26.9124, lng: 75.7873 },
    ],
    delayProb: 0.15,
  },
  {
    id: 'LD-4822', route: 'Mumbai → Pune', driver: 'Suresh P.',
    status: 'on-time', progress: 0.35,
    origin: { lat: 19.0760, lng: 72.8777 },
    dest: { lat: 18.5204, lng: 73.8567 },
    waypoints: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 18.8, lng: 73.2 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    delayProb: 0.22,
  },
  {
    id: 'LD-4823', route: 'Bengaluru → Chennai', driver: 'Vikram S.',
    status: 'delayed', progress: 0.58,
    origin: { lat: 12.9716, lng: 77.5946 },
    dest: { lat: 13.0827, lng: 80.2707 },
    waypoints: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.8, lng: 78.8 },
      { lat: 13.0827, lng: 80.2707 },
    ],
    delayProb: 0.78,
  },
  {
    id: 'LD-4825', route: 'Hyderabad → Vijayawada', driver: 'Mahesh R.',
    status: 'on-time', progress: 0.44,
    origin: { lat: 17.3850, lng: 78.4867 },
    dest: { lat: 16.5062, lng: 80.6480 },
    waypoints: [
      { lat: 17.3850, lng: 78.4867 },
      { lat: 16.9, lng: 79.5 },
      { lat: 16.5062, lng: 80.6480 },
    ],
    delayProb: 0.18,
  },
  {
    id: 'LD-4826', route: 'Ahmedabad → Surat', driver: 'Priya M.',
    status: 'on-time', progress: 0.81,
    origin: { lat: 23.0225, lng: 72.5714 },
    dest: { lat: 21.1702, lng: 72.8311 },
    waypoints: [
      { lat: 23.0225, lng: 72.5714 },
      { lat: 22.1, lng: 72.7 },
      { lat: 21.1702, lng: 72.8311 },
    ],
    delayProb: 0.08,
  },
  {
    id: 'LD-4828', route: 'Chandigarh → Amritsar', driver: 'Harpreet S.',
    status: 'delayed', progress: 0.30,
    origin: { lat: 30.7333, lng: 76.7794 },
    dest: { lat: 31.6340, lng: 74.8723 },
    waypoints: [
      { lat: 30.7333, lng: 76.7794 },
      { lat: 31.2, lng: 75.8 },
      { lat: 31.6340, lng: 74.8723 },
    ],
    delayProb: 0.65,
  },
];


// ══════════════════════════════════════
// PAGE RENDERER
// ══════════════════════════════════════
export function renderAgentHub() {
  const delayedCount = activeShipments.filter(s => s.status === 'delayed').length;
  const onTimeCount = activeShipments.filter(s => s.status === 'on-time').length;

  const alertCards = activeShipments
    .filter(s => s.delayProb >= 0.30)
    .sort((a, b) => b.delayProb - a.delayProb)
    .map(s => {
      const pct = Math.round(s.delayProb * 100);
      const color = pct >= 65 ? 'danger' : pct >= 35 ? 'warning' : 'success';
      const icon = pct >= 65 ? 'fa-exclamation-triangle' : pct >= 35 ? 'fa-exclamation-circle' : 'fa-check-circle';
      return `
        <div class="agent-alert-card ${color}" id="alert-${s.id}">
          <div class="alert-header">
            <div class="alert-id">${s.id}</div>
            <div class="alert-prob ${color}"><i class="fas ${icon}"></i> ${pct}%</div>
          </div>
          <div class="alert-route"><i class="fas fa-route"></i> ${s.route}</div>
          <div class="alert-driver"><i class="fas fa-user"></i> ${s.driver}</div>
          <div class="alert-progress-bar">
            <div class="alert-progress-fill ${color}" style="width:${Math.round(s.progress * 100)}%"></div>
          </div>
          <div class="alert-progress-label">${Math.round(s.progress * 100)}% complete</div>
        </div>
      `;
    }).join('');

  const suggestedQueries = [
    "Why is LD-4823 delayed?",
    "Find fastest route from Delhi to Mumbai",
    "Show delivery status",
    "What's the delay risk for Bengaluru to Chennai?",
    "Suggest alternate route avoiding Jaipur",
  ];

  const suggestionsHtml = suggestedQueries.map(q =>
    `<button class="agent-suggestion-chip" data-query="${q}">${q}</button>`
  ).join('');

  return `
    <div class="page-header">
      <div>
        <h1 style="display:flex;align-items:center;gap:12px">
          <span class="agent-hub-icon"><i class="fas fa-network-wired"></i></span>
          Agent Hub
          <span class="agent-status-badge" id="agentStatusBadge"><i class="fas fa-circle" style="font-size:6px"></i> Connecting...</span>
        </h1>
        <div class="subtitle">Multi-agent intelligence platform — Delay Prediction · Route Optimization · AI Chat</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnToggleSimulation"><i class="fas fa-play"></i> Start Simulation</button>
        <button class="btn btn-primary" id="btnRefreshAgents"><i class="fas fa-sync"></i> Refresh</button>
      </div>
    </div>

    <!-- Agent KPIs -->
    <div class="kpi-grid stagger" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi-card green">
        <div class="kpi-header"><div class="kpi-icon green"><i class="fas fa-truck-moving"></i></div></div>
        <div class="kpi-value">${activeShipments.length}</div>
        <div class="kpi-label">Active Shipments</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-header"><div class="kpi-icon blue"><i class="fas fa-check-circle"></i></div></div>
        <div class="kpi-value">${onTimeCount}</div>
        <div class="kpi-label">On Time</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-header"><div class="kpi-icon red"><i class="fas fa-exclamation-triangle"></i></div></div>
        <div class="kpi-value">${delayedCount}</div>
        <div class="kpi-label">Delayed</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-header"><div class="kpi-icon purple"><i class="fas fa-brain"></i></div></div>
        <div class="kpi-value">3</div>
        <div class="kpi-label">Active Agents</div>
      </div>
    </div>

    <!-- Main Grid: Map + Alerts + Chat -->
    <div class="agent-main-grid">
      <!-- LEFT: Map + Alerts -->
      <div class="agent-left-col">
        <div class="card animate-in">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-map-marked-alt"></i> Live Vehicle Tracking</span>
            <span style="font-size:12px;color:var(--text-secondary)" id="mapStatus">${activeShipments.length} vehicles tracked</span>
          </div>
          <div class="card-body no-padding">
            <div id="agentMap" class="leaflet-map-container" style="height:420px;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
          </div>
        </div>

        <!-- Delay Alerts -->
        <div class="card animate-in" style="margin-top:16px">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-bell" style="color:var(--danger)"></i> Delay Alerts</span>
            <span style="font-size:12px;color:var(--danger);font-weight:600">${activeShipments.filter(s => s.delayProb >= 0.30).length} at risk</span>
          </div>
          <div class="card-body" style="padding:12px">
            <div class="agent-alerts-grid" id="alertsContainer">
              ${alertCards || '<div style="text-align:center;color:var(--text-tertiary);padding:20px">✅ No delay alerts</div>'}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Chat -->
      <div class="agent-right-col">
        <div class="card animate-in agent-chat-card">
          <div class="card-header agent-chat-header">
            <span class="card-title"><i class="fas fa-comments"></i> AI Agent Chat</span>
            <div class="agent-chat-agents">
              <span class="agent-chip delay"><i class="fas fa-clock"></i> Delay</span>
              <span class="agent-chip route"><i class="fas fa-route"></i> Route</span>
              <span class="agent-chip chat"><i class="fas fa-robot"></i> Chat</span>
            </div>
          </div>
          <div class="agent-chat-body" id="agentChatBody">
            <div class="agent-chat-welcome">
              <div class="agent-chat-welcome-icon"><i class="fas fa-robot"></i></div>
              <h3>Logistics AI Assistant</h3>
              <p>Ask me about delays, routes, or shipment status. I coordinate with multiple AI agents to get you answers.</p>
            </div>
          </div>
          <div class="agent-chat-suggestions" id="agentSuggestions">${suggestionsHtml}</div>
          <div class="agent-chat-input-area">
            <div class="agent-chat-input-wrapper">
              <i class="fas fa-sparkles agent-chat-input-icon"></i>
              <input type="text" id="agentChatInput" placeholder="Ask about delays, routes, or shipments..." />
              <button class="agent-chat-send-btn" id="agentChatSend"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════
export function initAgentHub(mapInstances) {
  initAgentMap(mapInstances);
  initChatInterface();
  initSimulationControls();
  checkAgentStatus();
}

// ── Map Setup ──
function initAgentMap(mapInstances) {
  const mapEl = document.getElementById('agentMap');
  if (!mapEl) return;

  agentMap = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView([21.5, 78.5], 5);
  if (mapInstances) mapInstances['agent-hub'] = agentMap;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CartoDB',
    maxZoom: 19,
  }).addTo(agentMap);

  // Draw routes and vehicles
  drawShipmentRoutes();
  drawVehicleMarkers();

  // Legend
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div');
    div.innerHTML = `
      <div style="background:rgba(15,18,32,0.9);backdrop-filter:blur(12px);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);font-family:Inter,sans-serif;font-size:11px;color:#E8EAF0">
        <div style="font-weight:700;margin-bottom:6px;font-size:12px">Vehicle Status</div>
        <div style="display:flex;gap:12px">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#10B981"></div>On Time</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#EF4444"></div>Delayed</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#6366F1"></div>City Node</div>
        </div>
      </div>
    `;
    return div;
  };
  legend.addTo(agentMap);

  setTimeout(() => agentMap.invalidateSize(), 200);
}

function drawShipmentRoutes() {
  if (!agentMap) return;

  // Clear existing
  routeLayers.forEach(l => agentMap.removeLayer(l));
  routeLayers = [];

  activeShipments.forEach(s => {
    const coords = s.waypoints.map(w => [w.lat, w.lng]);
    const color = s.status === 'delayed' ? '#EF4444' : '#10B981';

    const polyline = L.polyline(coords, {
      color,
      weight: 3,
      opacity: 0.7,
      dashArray: s.status === 'delayed' ? '8, 6' : null,
    }).addTo(agentMap);

    polyline.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:160px;color:#E8EAF0">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${s.id}</div>
        <div style="font-size:12px;color:#8B92A8">${s.route}</div>
        <div style="font-size:12px;margin-top:4px">Driver: ${s.driver}</div>
        <div style="font-size:12px;margin-top:2px">Delay Risk: <span style="color:${color};font-weight:600">${Math.round(s.delayProb * 100)}%</span></div>
      </div>
    `);

    routeLayers.push(polyline);

    // Origin marker
    L.circleMarker([s.origin.lat, s.origin.lng], {
      radius: 5, fillColor: '#6366F1', color: '#fff', weight: 2, fillOpacity: 1,
    }).addTo(agentMap).bindPopup(`<b>Origin:</b> ${s.route.split('→')[0].trim()}`);

    // Destination marker
    L.circleMarker([s.dest.lat, s.dest.lng], {
      radius: 5, fillColor: '#EC4899', color: '#fff', weight: 2, fillOpacity: 1,
    }).addTo(agentMap).bindPopup(`<b>Destination:</b> ${s.route.split('→')[1].trim()}`);
  });
}

function drawVehicleMarkers() {
  if (!agentMap) return;

  // Clear existing markers
  vehicleMarkers.forEach(m => agentMap.removeLayer(m));
  vehicleMarkers = [];

  activeShipments.forEach(s => {
    const pos = interpolatePosition(s);
    const color = s.status === 'delayed' ? '#EF4444' : '#10B981';

    const icon = L.divIcon({
      className: 'agent-vehicle-marker',
      html: `
        <div class="vehicle-dot ${s.status === 'delayed' ? 'delayed' : 'on-time'}" style="background:${color}">
          <i class="fas fa-truck" style="font-size:10px;color:white"></i>
        </div>
        ${s.status === 'delayed' ? '<div class="vehicle-pulse"></div>' : ''}
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([pos.lat, pos.lng], { icon }).addTo(agentMap);
    marker.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:150px;color:#E8EAF0">
        <div style="font-weight:700;font-size:13px">${s.id} — ${s.driver}</div>
        <div style="font-size:11px;color:#8B92A8;margin:4px 0">${s.route}</div>
        <div style="font-size:11px">Progress: ${Math.round(s.progress * 100)}%</div>
        <div style="font-size:11px;color:${color};font-weight:600">Delay Risk: ${Math.round(s.delayProb * 100)}%</div>
      </div>
    `);

    marker._shipmentId = s.id;
    vehicleMarkers.push(marker);
  });
}

function interpolatePosition(shipment) {
  const t = shipment.progress;
  const wps = shipment.waypoints;
  if (wps.length < 2) return wps[0];

  const totalSegments = wps.length - 1;
  const segIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
  const segProgress = (t * totalSegments) - segIndex;

  const a = wps[segIndex];
  const b = wps[segIndex + 1];

  return {
    lat: a.lat + (b.lat - a.lat) * segProgress,
    lng: a.lng + (b.lng - a.lng) * segProgress,
  };
}

// ── Live Vehicle Simulation ──
function startSimulation() {
  if (simulationInterval) return;

  simulationInterval = setInterval(() => {
    activeShipments.forEach(s => {
      if (s.progress >= 1.0) return;

      // Move vehicles
      const speed = s.status === 'delayed' ? 0.003 : 0.008;
      s.progress = Math.min(s.progress + speed + (Math.random() * 0.005), 1.0);

      // Randomly fluctuate delay probability
      const delta = (Math.random() - 0.5) * 0.03;
      s.delayProb = Math.min(Math.max(s.delayProb + delta, 0.02), 0.98);

      // Update status based on delay probability
      s.status = s.delayProb >= 0.55 ? 'delayed' : 'on-time';
    });

    // Update vehicle positions on map
    updateVehiclePositions();
    updateAlertCards();
  }, 2000);

  const btn = document.getElementById('btnToggleSimulation');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
    btn.classList.add('active-sim');
  }
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  const btn = document.getElementById('btnToggleSimulation');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
    btn.classList.remove('active-sim');
  }
}

function updateVehiclePositions() {
  vehicleMarkers.forEach(marker => {
    const shipment = activeShipments.find(s => s.id === marker._shipmentId);
    if (!shipment) return;

    const pos = interpolatePosition(shipment);
    marker.setLatLng([pos.lat, pos.lng]);

    const color = shipment.status === 'delayed' ? '#EF4444' : '#10B981';
    const icon = L.divIcon({
      className: 'agent-vehicle-marker',
      html: `
        <div class="vehicle-dot ${shipment.status === 'delayed' ? 'delayed' : 'on-time'}" style="background:${color}">
          <i class="fas fa-truck" style="font-size:10px;color:white"></i>
        </div>
        ${shipment.status === 'delayed' ? '<div class="vehicle-pulse"></div>' : ''}
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    marker.setIcon(icon);
  });
}

function updateAlertCards() {
  activeShipments.forEach(s => {
    const card = document.getElementById(`alert-${s.id}`);
    if (!card) return;
    const pct = Math.round(s.delayProb * 100);
    const probEl = card.querySelector('.alert-prob');
    if (probEl) probEl.textContent = `${pct}%`;
    const fillEl = card.querySelector('.alert-progress-fill');
    if (fillEl) fillEl.style.width = `${Math.round(s.progress * 100)}%`;
    const labelEl = card.querySelector('.alert-progress-label');
    if (labelEl) labelEl.textContent = `${Math.round(s.progress * 100)}% complete`;
  });
}

// ── Chat Interface ──
function initChatInterface() {
  const input = document.getElementById('agentChatInput');
  const sendBtn = document.getElementById('agentChatSend');
  const suggestions = document.getElementById('agentSuggestions');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }

  // Suggestion chips
  if (suggestions) {
    suggestions.querySelectorAll('.agent-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (input) input.value = query;
        sendChatMessage();
      });
    });
  }
}

async function sendChatMessage() {
  const input = document.getElementById('agentChatInput');
  const chatBody = document.getElementById('agentChatBody');
  if (!input || !chatBody) return;

  const message = input.value.trim();
  if (!message) return;

  // Hide welcome
  const welcome = chatBody.querySelector('.agent-chat-welcome');
  if (welcome) welcome.remove();

  // Add user message
  appendChatMessage('user', message);
  input.value = '';

  // Hide suggestions after first message
  const suggestions = document.getElementById('agentSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  // Show typing indicator
  const typingId = appendTypingIndicator();

  try {
    const result = await chatWithAgent(message);

    // Remove typing indicator
    removeTypingIndicator(typingId);

    // Add agent response
    appendChatMessage('agent', result.response, result.agent_used, result.suggestions);

    // If route data, draw on map
    if (result.data?.route?.best_route?.waypoints) {
      drawAgentRoute(result.data.route);
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    appendChatMessage('agent', '❌ Sorry, something went wrong. Please try again.', 'error');
  }
}

function appendChatMessage(type, content, agentUsed = '', newSuggestions = null) {
  const chatBody = document.getElementById('agentChatBody');
  if (!chatBody) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `agent-chat-msg ${type}`;

  // Convert markdown-like bold to HTML
  const htmlContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  if (type === 'user') {
    msgDiv.innerHTML = `
      <div class="agent-msg-bubble user-bubble">
        <div class="agent-msg-text">${htmlContent}</div>
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="agent-msg-bubble agent-bubble">
        ${agentUsed ? `<div class="agent-msg-label"><i class="fas fa-microchip"></i> ${agentUsed}</div>` : ''}
        <div class="agent-msg-text">${htmlContent}</div>
        ${newSuggestions ? `
          <div class="agent-msg-suggestions">
            ${newSuggestions.map(s => `<button class="agent-inline-suggestion" onclick="document.getElementById('agentChatInput').value='${s}';document.getElementById('agentChatSend').click()">${s}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function appendTypingIndicator() {
  const chatBody = document.getElementById('agentChatBody');
  if (!chatBody) return;

  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'agent-chat-msg agent';
  div.id = id;
  div.innerHTML = `
    <div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="agent-msg-bubble agent-bubble">
      <div class="agent-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Draw route from agent response on map
function drawAgentRoute(routeData) {
  if (!agentMap || !routeData.best_route?.waypoints) return;

  const waypoints = routeData.best_route.waypoints;
  const coords = waypoints.map(w => [w.lat, w.lng]);

  const line = L.polyline(coords, {
    color: '#22D3EE',
    weight: 4,
    opacity: 0.9,
    dashArray: '4, 8',
  }).addTo(agentMap);

  routeLayers.push(line);

  // Fit map to show the route
  agentMap.fitBounds(line.getBounds().pad(0.1));

  // Add waypoint markers
  waypoints.forEach((wp, i) => {
    const isTerminal = i === 0 || i === waypoints.length - 1;
    L.circleMarker([wp.lat, wp.lng], {
      radius: isTerminal ? 7 : 4,
      fillColor: isTerminal ? '#22D3EE' : '#A855F7',
      color: '#fff',
      weight: 2,
      fillOpacity: 1,
    }).addTo(agentMap).bindPopup(`<b>${wp.city}</b>`);
  });
}

// ── Simulation Controls ──
function initSimulationControls() {
  const toggleBtn = document.getElementById('btnToggleSimulation');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (simulationInterval) stopSimulation();
      else startSimulation();
    });
  }

  const refreshBtn = document.getElementById('btnRefreshAgents');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      checkAgentStatus();
      drawShipmentRoutes();
      drawVehicleMarkers();
    });
  }
}

// ── Agent Health Check ──
async function checkAgentStatus() {
  const badge = document.getElementById('agentStatusBadge');
  if (!badge) return;

  const health = await getAgentHealth();

  if (health.status === 'ok') {
    badge.innerHTML = '<i class="fas fa-circle" style="font-size:6px"></i> All Agents Online';
    badge.className = 'agent-status-badge online';
  } else {
    badge.innerHTML = '<i class="fas fa-circle" style="font-size:6px"></i> Local Mode';
    badge.className = 'agent-status-badge offline';
  }
}
