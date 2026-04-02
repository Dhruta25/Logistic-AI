// ============================================
// LogiFlow AI — Page Renderers (India Edition)
// ============================================
import {
  kpiData, mapVehicles, dispatchList, ordersData, kanbanData,
  fleetData, driversData, routesData, warehousesData,
  podData, invoicesData, aiRecommendations, settingsConfig
} from './data.js';

// --- Helpers ---
function badge(text, type) {
  return `<span class="badge badge-${type} badge-dot">${text}</span>`;
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

function starRating(rating, max = 5) {
  let html = '<div class="star-rating">';
  for (let i = 1; i <= max; i++) {
    html += i <= Math.round(rating) ? '<i class="fas fa-star"></i>' : '<i class="fas fa-star empty"></i>';
  }
  html += `<span style="color:var(--text-secondary);font-size:12px;margin-left:4px">${rating}</span></div>`;
  return html;
}

function healthBar(val) {
  const color = val >= 70 ? '' : val >= 40 ? 'warning' : 'danger';
  return `<div class="progress-bar" style="width:100px"><div class="progress-fill ${color}" style="width:${val}%"></div></div>`;
}

// ============================================
// DASHBOARD
// ============================================
export function renderDashboard() {
  const kpis = kpiData.map(k => `
    <div class="kpi-card ${k.color}">
      <div class="kpi-header">
        <div class="kpi-icon ${k.color}"><i class="${k.icon}"></i></div>
        <div class="kpi-trend ${k.trendDir}">${k.trendDir === 'up' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'}${k.trend}</div>
      </div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');

  const dispatches = dispatchList.map(d => `
    <div class="dispatch-item">
      <div class="dispatch-left">
        <span class="dispatch-id">${d.id}</span>
        <span class="dispatch-route">${d.route}</span>
      </div>
      <div class="dispatch-right">
        <span class="dispatch-eta"><i class="far fa-clock"></i> ${d.eta}</span>
        <span style="font-size:12px;color:var(--text-secondary)">${d.driver}</span>
        ${badge(d.status, d.statusType)}
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <div class="subtitle">Real-time operations overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportDashboard"><i class="fas fa-download"></i> Export</button>
        <button class="btn btn-primary" id="btnNewLoad"><i class="fas fa-plus"></i> New Load</button>
      </div>
    </div>
    <div class="kpi-grid stagger">${kpis}</div>
    <div class="dashboard-grid">
      <div class="card animate-in">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-map-marked-alt"></i> Live Operations Map</span>
          <span style="font-size:12px;color:var(--text-secondary)">${mapVehicles.length} vehicles active</span>
        </div>
        <div class="card-body no-padding">
          <div id="dashboardMap" class="leaflet-map-container" style="height:380px;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
        </div>
      </div>
      <div class="card animate-in" style="animation-delay:0.15s">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-clipboard-list"></i> Today's Dispatch</span>
          <span style="font-size:12px;color:var(--primary);cursor:pointer;font-weight:500" id="viewAllDispatch">View All →</span>
        </div>
        <div class="card-body no-padding">
          <div class="dispatch-list">${dispatches}</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// ORDERS / LOADS
// ============================================
export function renderOrders() {
  const rows = ordersData.map(o => `
    <tr data-id="${o.id}" class="order-row">
      <td class="cell-id">${o.id}</td>
      <td>${o.customer}</td>
      <td><div class="cell-route">${o.origin} <span class="arrow">→</span> ${o.dest}</div></td>
      <td>${o.eta}</td>
      <td>${badge(o.status, o.statusType)}</td>
      <td>
        <div class="cell-driver">
          <div class="driver-avatar">${initials(o.driver)}</div>
          ${o.driver}
        </div>
      </td>
      <td>${badge(o.priority, o.priority === 'High' ? 'danger' : o.priority === 'Medium' ? 'warning' : 'gray')}</td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Orders / Loads</h1>
        <div class="subtitle">${ordersData.length} total loads tracked</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnFilterOrders"><i class="fas fa-filter"></i> Filters</button>
        <button class="btn btn-secondary" id="btnExportOrders"><i class="fas fa-download"></i> Export CSV</button>
        <button class="btn btn-primary" id="btnCreateLoad"><i class="fas fa-plus"></i> Create Load</button>
      </div>
    </div>
    <div class="filter-bar" id="filterBar">
      <div class="filter-select"><i class="fas fa-circle-dot"></i><select id="filterStatus"><option value="">All Status</option><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Delayed</option></select></div>
      <div class="filter-select"><i class="fas fa-building"></i><select id="filterCustomer"><option value="">All Customers</option><option>Tata Logistics</option><option>Reliance Supply</option><option>Flipkart Cargo</option><option>Amazon India</option><option>Delhivery Express</option></select></div>
      <div class="filter-select"><i class="fas fa-flag"></i><select id="filterPriority"><option value="">All Priorities</option><option>High</option><option>Medium</option><option>Low</option></select></div>
      <div class="filter-select"><i class="fas fa-map-pin"></i><select id="filterOrigin"><option value="">All Origins</option><option>New Delhi</option><option>Mumbai</option><option>Bengaluru</option><option>Kolkata</option><option>Hyderabad</option></select></div>
    </div>
    <div class="card animate-in">
      <div class="card-body no-padding">
        <div class="data-table-wrapper">
          <table class="data-table" id="ordersTable">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>ETA</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// DISPATCH BOARD (KANBAN)
// ============================================
export function renderDispatch() {
  function renderColumn(key, title, cards) {
    const cardHtml = cards.map(c => `
      <div class="kanban-card" draggable="true" data-id="${c.id}">
        <div class="card-priority ${c.priority}">${c.priority} priority</div>
        <div class="card-load-id">${c.id}</div>
        <div class="card-route"><i class="fas fa-route" style="font-size:11px;color:var(--text-tertiary)"></i> ${c.route}</div>
        <div class="card-meta">
          <div class="eta"><i class="far fa-clock"></i> ${c.eta}</div>
          ${c.driver ? `<div class="card-driver-sm"><div class="mini-avatar">${initials(c.driver)}</div>${c.driver}</div>` : '<span style="color:var(--text-tertiary);font-style:italic">Unassigned</span>'}
        </div>
      </div>
    `).join('');

    return `
      <div class="kanban-column ${key}" data-column="${key}">
        <div class="kanban-column-header">
          <span class="col-title">${title}</span>
          <span class="col-count">${cards.length}</span>
        </div>
        <div class="kanban-cards">${cardHtml}</div>
      </div>
    `;
  }

  return `
    <div class="page-header">
      <div>
        <h1>Dispatch Board</h1>
        <div class="subtitle">Drag & drop to manage load assignments</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnRefreshDispatch"><i class="fas fa-arrows-rotate"></i> Refresh</button>
        <button class="btn btn-primary" id="btnAddLoad"><i class="fas fa-plus"></i> Add Load</button>
      </div>
    </div>
    <div class="kanban-board animate-in">
      ${renderColumn('unassigned', '📋 Unassigned', kanbanData.unassigned)}
      ${renderColumn('assigned', '👤 Assigned', kanbanData.assigned)}
      ${renderColumn('in-transit', '🚛 In Transit', kanbanData['in-transit'])}
      ${renderColumn('delivered', '✅ Delivered', kanbanData.delivered)}
    </div>
  `;
}

// ============================================
// FLEET MANAGEMENT
// ============================================
export function renderFleet() {
  const summary = [
    { label: 'Total Vehicles', value: '156', icon: 'fas fa-truck', color: 'blue' },
    { label: 'Active', value: '89', icon: 'fas fa-circle-check', color: 'green' },
    { label: 'Maintenance', value: '23', icon: 'fas fa-wrench', color: 'yellow' },
    { label: 'Critical', value: '5', icon: 'fas fa-triangle-exclamation', color: 'red' },
  ];

  const summaryCards = summary.map(s => `
    <div class="kpi-card ${s.color}">
      <div class="kpi-header">
        <div class="kpi-icon ${s.color}"><i class="${s.icon}"></i></div>
      </div>
      <div class="kpi-value">${s.value}</div>
      <div class="kpi-label">${s.label}</div>
    </div>
  `).join('');

  const rows = fleetData.map(v => `
    <tr>
      <td class="cell-id">${v.id}</td>
      <td>${v.type}</td>
      <td>${badge(v.status, v.statusType)}</td>
      <td>${v.driver}</td>
      <td style="font-size:12px">${v.location}</td>
      <td style="font-size:12px;color:var(--text-tertiary)">${v.lastPing}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          ${healthBar(v.health)}
          <span style="font-size:12px;font-weight:600;${v.health < 40 ? 'color:var(--danger)' : v.health < 70 ? 'color:var(--warning)' : 'color:var(--success)'}">${v.health}%</span>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Fleet Management</h1>
        <div class="subtitle">Monitor vehicle status, health, and assignments</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportFleet"><i class="fas fa-download"></i> Export</button>
        <button class="btn btn-primary" id="btnAddVehicle"><i class="fas fa-plus"></i> Add Vehicle</button>
      </div>
    </div>
    <div class="kpi-grid stagger" style="grid-template-columns:repeat(4,1fr)">${summaryCards}</div>
    <div class="card animate-in">
      <div class="card-body no-padding">
        <div class="data-table-wrapper">
          <table class="data-table" id="fleetTable">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Location</th>
                <th>Last GPS Ping</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// DRIVER MANAGEMENT
// ============================================
export function renderDrivers() {
  const cards = driversData.map(d => `
    <div class="driver-card">
      <div class="driver-avatar-lg">${d.initials}</div>
      <div class="driver-name-lg">${d.name}</div>
      <div class="driver-exp">${d.exp} experience • ${d.trips} trips</div>
      ${starRating(d.rating)}
      <div class="driver-stats">
        <div class="driver-stat">
          <div class="val" style="font-size:12px">${d.hos}</div>
          <div class="lbl">HOS</div>
        </div>
        <div class="driver-stat">
          <div class="val" style="font-size:12px">${d.license.split('—')[0].trim()}</div>
          <div class="lbl">License</div>
        </div>
        <div class="driver-stat">
          <div class="val" style="font-size:12px">${d.medical.includes('Expiring') ? '<span style="color:var(--warning)">Expiring</span>' : 'Valid'}</div>
          <div class="lbl">Medical</div>
        </div>
        <div class="driver-stat">
          <div class="val" style="font-size:12px">${d.hazmat}</div>
          <div class="lbl">Hazmat</div>
        </div>
      </div>
      <div style="margin-top:12px">
        ${badge(d.compliance === 'green' ? 'Compliant' : d.compliance === 'yellow' ? 'Review Needed' : 'Action Required', d.compliance === 'green' ? 'success' : d.compliance === 'yellow' ? 'warning' : 'danger')}
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Driver Management</h1>
        <div class="subtitle">${driversData.length} drivers managed</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportDrivers"><i class="fas fa-download"></i> Export</button>
        <button class="btn btn-primary" id="btnAddDriver"><i class="fas fa-user-plus"></i> Add Driver</button>
      </div>
    </div>
    <div class="driver-profile-grid stagger">${cards}</div>
  `;
}

// ============================================
// ROUTES & TRACKING
// ============================================
export function renderRoutes() {
  const routeCards = routesData.map(r => `
    <div class="card animate-in" style="margin-bottom:16px">
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:2px">${r.id}</div>
            <div style="font-size:16px;font-weight:600">${r.origin} → ${r.dest}</div>
          </div>
          <div style="text-align:right">
            ${badge(r.status === 'on-time' ? 'On Time' : 'Delayed', r.status === 'on-time' ? 'success' : 'danger')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px">
          <div><div style="font-size:11px;color:var(--text-tertiary)">Distance</div><div style="font-weight:600">${r.distance}</div></div>
          <div><div style="font-size:11px;color:var(--text-tertiary)">ETA</div><div style="font-weight:600">${r.eta}</div></div>
          <div><div style="font-size:11px;color:var(--text-tertiary)">Driver</div><div style="font-weight:600">${r.driver}</div></div>
          <div><div style="font-size:11px;color:var(--text-tertiary)">Vehicle</div><div style="font-weight:600">${r.vehicle}</div></div>
        </div>
        <div style="margin-bottom:6px;display:flex;justify-content:space-between">
          <span style="font-size:12px;color:var(--text-secondary)">Progress</span>
          <span style="font-size:12px;font-weight:600">${r.progress}%</span>
        </div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill ${r.status === 'delayed' ? 'warning' : ''}" style="width:${r.progress}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--text-tertiary)">
          <span><i class="fas fa-map-pin" style="color:var(--primary)"></i> ${r.origin}</span>
          <span><i class="fas fa-flag-checkered" style="color:var(--danger)"></i> ${r.dest}</span>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Routes & Tracking</h1>
        <div class="subtitle">Real-time route monitoring and ETA tracking</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportRoutes"><i class="fas fa-file-pdf"></i> Export PDF</button>
      </div>
    </div>
    <div class="card animate-in" style="margin-bottom:24px">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-map-marked-alt"></i> Live Tracking Map</span>
      </div>
      <div class="card-body no-padding">
        <div id="routesMap" class="leaflet-map-container" style="height:300px;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
      </div>
    </div>
    <div>${routeCards}</div>
  `;
}

// ============================================
// WAREHOUSES / HUBS
// ============================================
export function renderWarehouses() {
  const cards = warehousesData.map(w => {
    const capColor = w.capacity >= 85 ? 'danger' : w.capacity >= 65 ? 'warning' : '';
    return `
      <div class="warehouse-card">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="warehouse-name">${w.name}</div>
            <div class="warehouse-location"><i class="fas fa-map-pin" style="font-size:10px"></i> ${w.location}</div>
          </div>
          <div class="kpi-icon ${w.capacity >= 85 ? 'red' : w.capacity >= 65 ? 'yellow' : 'green'}">
            <i class="fas fa-warehouse"></i>
          </div>
        </div>
        <div class="capacity-bar">
          <div class="capacity-header">
            <span class="capacity-label">Capacity Utilization</span>
            <span class="capacity-value">${w.capacity}%</span>
          </div>
          <div class="progress-bar" style="height:8px">
            <div class="progress-fill ${capColor}" style="width:${w.capacity}%"></div>
          </div>
        </div>
        <div class="warehouse-stats">
          <div class="warehouse-stat">
            <div class="stat-value" style="color:var(--info)">${w.inbound}</div>
            <div class="stat-label">Inbound</div>
          </div>
          <div class="warehouse-stat">
            <div class="stat-value" style="color:var(--primary)">${w.outbound}</div>
            <div class="stat-label">Outbound</div>
          </div>
          <div class="warehouse-stat">
            <div class="stat-value">${w.docks.active}/${w.docks.total}</div>
            <div class="stat-label">Docks Active</div>
          </div>
          <div class="warehouse-stat">
            <div class="stat-value" style="color:${w.alert ? 'var(--warning)' : 'var(--success)'}">
              ${w.alert ? '<i class="fas fa-exclamation-triangle"></i>' : '<i class="fas fa-check-circle"></i>'}
            </div>
            <div class="stat-label">${w.alert ? 'Alert' : 'Normal'}</div>
          </div>
        </div>
        ${w.alert ? `<div style="margin-top:14px;padding:10px 12px;background:var(--warning-bg);border-radius:var(--radius-md);font-size:12px;color:var(--warning);display:flex;align-items:center;gap:6px"><i class="fas fa-exclamation-circle"></i>${w.alert}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Warehouses / Hubs</h1>
        <div class="subtitle">${warehousesData.length} hubs across India</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" id="btnAddHub"><i class="fas fa-plus"></i> Add Hub</button>
      </div>
    </div>
    <div class="warehouse-grid stagger">${cards}</div>
  `;
}

// ============================================
// PROOF OF DELIVERY
// ============================================
export function renderPOD() {
  const cards = podData.map(p => `
    <div class="pod-card">
      <div class="pod-preview"><i class="${p.icon}"></i></div>
      <div class="pod-info">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div class="pod-load">${p.loadId}</div>
          ${badge(p.status, p.statusType)}
        </div>
        <div class="pod-date"><i class="far fa-calendar"></i> ${p.date} • ${p.type}</div>
        <div class="pod-actions">
          <button class="btn btn-sm btn-secondary btn-view-pod" data-pod="${p.id}" data-load="${p.loadId}" data-type="${p.type}"><i class="fas fa-eye"></i> View</button>
          <button class="btn btn-sm btn-secondary btn-download-pod" data-pod="${p.id}" data-load="${p.loadId}" data-type="${p.type}"><i class="fas fa-download"></i> Download</button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Proof of Delivery</h1>
        <div class="subtitle">Upload and verify delivery documentation</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportPOD"><i class="fas fa-file-pdf"></i> Export All</button>
      </div>
    </div>
    <div class="card animate-in" style="margin-bottom:24px">
      <div class="card-body">
        <div class="upload-area" id="uploadArea">
          <i class="fas fa-cloud-upload-alt"></i>
          <p><span>Click to upload</span> or drag and drop</p>
          <p style="font-size:11px;color:var(--text-tertiary);margin-top:4px">PDF, PNG, JPG up to 10MB</p>
          <input type="file" id="fileInput" style="display:none" accept=".pdf,.png,.jpg,.jpeg" multiple />
        </div>
      </div>
    </div>
    <div class="pod-grid stagger">${cards}</div>
  `;
}

// ============================================
// BILLING & INVOICES
// ============================================
export function renderBilling() {
  const summaryCards = [
    { label: 'Total Revenue', value: '₹2,38,15,000', icon: 'fas fa-chart-line', color: 'green', bg: 'var(--success-bg)' },
    { label: 'Outstanding', value: '₹41,68,700', icon: 'fas fa-clock', color: 'yellow', bg: 'var(--warning-bg)' },
    { label: 'Overdue', value: '₹28,70,900', icon: 'fas fa-exclamation-circle', color: 'red', bg: 'var(--danger-bg)' },
    { label: 'Paid This Month', value: '₹1,67,76,300', icon: 'fas fa-check-circle', color: 'blue', bg: 'var(--info-bg)' },
  ];

  const fCards = summaryCards.map(s => `
    <div class="financial-card">
      <div class="financial-icon" style="background:${s.bg};color:var(--${s.color === 'yellow' ? 'warning' : s.color === 'red' ? 'danger' : s.color === 'blue' ? 'info' : 'success'})">
        <i class="${s.icon}"></i>
      </div>
      <div class="financial-value">${s.value}</div>
      <div class="financial-label">${s.label}</div>
    </div>
  `).join('');

  const rows = invoicesData.map(inv => `
    <tr>
      <td class="cell-id">${inv.id}</td>
      <td>${inv.customer}</td>
      <td style="font-weight:600">${inv.amount}</td>
      <td>${inv.dueDate}</td>
      <td>${badge(inv.status, inv.statusType)}</td>
      <td>
        <button class="btn btn-sm btn-ghost btn-view-invoice" data-id="${inv.id}" data-customer="${inv.customer}" data-amount="${inv.amount}" data-due="${inv.dueDate}" data-status="${inv.status}"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-ghost btn-download-invoice" data-id="${inv.id}" data-customer="${inv.customer}" data-amount="${inv.amount}" data-due="${inv.dueDate}" data-status="${inv.status}"><i class="fas fa-download"></i></button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Billing & Invoices</h1>
        <div class="subtitle">Financial overview and invoice management</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportBilling"><i class="fas fa-download"></i> Export</button>
        <button class="btn btn-primary" id="btnCreateInvoice"><i class="fas fa-plus"></i> Create Invoice</button>
      </div>
    </div>
    <div class="financial-cards stagger">${fCards}</div>
    <div class="card animate-in">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-file-invoice-dollar"></i> Recent Invoices</span>
      </div>
      <div class="card-body no-padding">
        <div class="data-table-wrapper">
          <table class="data-table" id="invoiceTable">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// REPORTS
// ============================================
export function renderReports() {
  const barData = [
    { label: 'Mon', value: 85 },
    { label: 'Tue', value: 92 },
    { label: 'Wed', value: 78 },
    { label: 'Thu', value: 95 },
    { label: 'Fri', value: 88 },
    { label: 'Sat', value: 72 },
    { label: 'Sun', value: 65 },
  ];

  const bars = barData.map(b => `
    <div class="chart-bar-group">
      <div class="chart-bar primary" style="height:${b.value * 2}px"></div>
      <div class="chart-label">${b.label}</div>
    </div>
  `).join('');

  const delayBars = [
    { label: 'NH-44', value: 45, type: 'danger' },
    { label: 'NH-48', value: 32, type: 'warning' },
    { label: 'NH-19', value: 28, type: 'warning' },
    { label: 'NH-65', value: 15, type: 'primary' },
    { label: 'NH-8', value: 12, type: 'primary' },
  ];

  const dBars = delayBars.map(b => `
    <div class="chart-bar-group">
      <div class="chart-bar ${b.type}" style="height:${b.value * 4}px"></div>
      <div class="chart-label">${b.label}</div>
    </div>
  `).join('');

  const driverPerf = driversData.slice(0, 5).map(d => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="driver-avatar" style="width:32px;height:32px;font-size:11px">${d.initials}</div>
        <div>
          <div style="font-weight:500;font-size:13px">${d.name}</div>
          <div style="font-size:11px;color:var(--text-tertiary)">${d.trips} trips</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        ${starRating(d.rating)}
        <div class="progress-bar" style="width:80px">
          <div class="progress-fill" style="width:${(d.rating / 5 * 100)}%"></div>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <div class="subtitle">Analytics and performance insights</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnExportReportPDF"><i class="fas fa-file-pdf"></i> Export PDF</button>
        <button class="btn btn-secondary" id="btnExportReportCSV"><i class="fas fa-file-csv"></i> Export CSV</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card animate-in">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-chart-line"></i> On-Time Performance</span>
          <span style="font-size:12px;color:var(--text-secondary)">Last 7 days</span>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <div class="chart-bars" style="align-items:flex-end">${bars}</div>
          </div>
        </div>
      </div>
      <div class="card animate-in" style="animation-delay:0.1s">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-chart-bar"></i> Delays by Route</span>
          <span style="font-size:12px;color:var(--text-secondary)">Current month</span>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <div class="chart-bars" style="align-items:flex-end">${dBars}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card animate-in" style="animation-delay:0.2s">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-trophy"></i> Driver Performance</span>
        <span style="font-size:12px;color:var(--text-secondary)">Top performers</span>
      </div>
      <div class="card-body">${driverPerf}</div>
    </div>
  `;
}

// ============================================
// AI OPS ASSISTANT
// ============================================
export function renderAIOps() {
  const typeIcons = {
    assignment: 'fas fa-user-gear',
    delay: 'fas fa-clock',
    cost: 'fas fa-indian-rupee-sign',
    invoice: 'fas fa-file-invoice',
  };

  const cards = aiRecommendations.map((r, i) => `
    <div class="ai-card" style="animation-delay:${i * 0.08}s">
      <div class="confidence" title="AI Confidence"><i class="fas fa-brain" style="margin-right:3px"></i>${r.confidence}%</div>
      <div class="severity ${r.severity}">${r.severity} priority</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <i class="${typeIcons[r.type]}" style="color:var(--text-tertiary)"></i>
        <div class="ai-title">${r.title}</div>
      </div>
      <div class="ai-desc">${r.desc}</div>
      <div class="ai-actions">
        <button class="btn btn-sm btn-success btn-ai-action" data-action="${r.actions[0]}" data-title="${r.title}">${r.actions[0]}</button>
        <button class="btn btn-sm btn-secondary btn-ai-action" data-action="${r.actions[1]}" data-title="${r.title}">${r.actions[1]}</button>
        <button class="btn btn-sm btn-ghost btn-ai-action" data-action="${r.actions[2]}" data-title="${r.title}" style="color:var(--info)">${r.actions[2]}</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1 style="display:flex;align-items:center;gap:10px">
          <span style="background:linear-gradient(135deg,#8B5CF6,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px">
            <i class="fas fa-wand-magic-sparkles" style="-webkit-text-fill-color:#8B5CF6"></i>
          </span>
          AI Ops Assistant
        </h1>
        <div class="subtitle">Intelligent recommendations powered by machine learning</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" id="btnConfigureAI"><i class="fas fa-sliders"></i> Configure AI</button>
      </div>
    </div>
    <div class="kpi-grid stagger" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
      <div class="kpi-card purple">
        <div class="kpi-header"><div class="kpi-icon purple"><i class="fas fa-lightbulb"></i></div></div>
        <div class="kpi-value">${aiRecommendations.length}</div>
        <div class="kpi-label">Active Recommendations</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-header"><div class="kpi-icon red"><i class="fas fa-bell"></i></div></div>
        <div class="kpi-value">${aiRecommendations.filter(r => r.severity === 'high').length}</div>
        <div class="kpi-label">High Priority Alerts</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-header"><div class="kpi-icon green"><i class="fas fa-check-double"></i></div></div>
        <div class="kpi-value">23</div>
        <div class="kpi-label">Actions Taken Today</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-header"><div class="kpi-icon blue"><i class="fas fa-chart-line"></i></div></div>
        <div class="kpi-value">₹15L</div>
        <div class="kpi-label">Savings This Week</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="stagger">${cards}</div>
  `;
}

// ============================================
// SETTINGS
// ============================================
export function renderSettings() {
  function toggleHtml(enabled) {
    return `
      <label class="toggle-switch">
        <input type="checkbox" ${enabled ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    `;
  }

  const alertItems = settingsConfig.alerts.map(a => `
    <div class="setting-item">
      <div class="setting-info">
        <div class="setting-label">${a.label}</div>
        <div class="setting-detail">${a.detail}</div>
      </div>
      ${toggleHtml(a.enabled)}
    </div>
  `).join('');

  const notifItems = settingsConfig.notifications.map(n => `
    <div class="setting-item">
      <div class="setting-info">
        <div class="setting-label">${n.label}</div>
        <div class="setting-detail">${n.detail}</div>
      </div>
      ${toggleHtml(n.enabled)}
    </div>
  `).join('');

  const ruleItems = settingsConfig.rules.map(r => `
    <div class="setting-item">
      <div class="setting-info">
        <div class="setting-label">${r.label}</div>
        <div class="setting-detail">${r.detail}</div>
      </div>
      ${toggleHtml(r.enabled)}
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Settings</h1>
        <div class="subtitle">Configure alerts, notifications, and automation rules</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" id="btnSaveSettings"><i class="fas fa-save"></i> Save Changes</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="card animate-in" style="margin-bottom:24px">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-bell"></i> Alert Configuration</span>
          </div>
          <div class="card-body">${alertItems}</div>
        </div>
        <div class="card animate-in" style="animation-delay:0.2s">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-robot"></i> Rule-Based Triggers</span>
          </div>
          <div class="card-body">${ruleItems}</div>
        </div>
      </div>
      <div>
        <div class="card animate-in" style="animation-delay:0.1s">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-paper-plane"></i> Notification Channels</span>
          </div>
          <div class="card-body">${notifItems}</div>
        </div>
        <div class="card animate-in" style="animation-delay:0.3s;margin-top:24px">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-palette"></i> Appearance</span>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">Dark Mode</div>
                <div class="setting-detail">Use dark theme across the dashboard</div>
              </div>
              ${toggleHtml(false)}
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">Compact View</div>
                <div class="setting-detail">Reduce spacing for more data density</div>
              </div>
              ${toggleHtml(false)}
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">Real-time Updates</div>
                <div class="setting-detail">Auto-refresh data every 30 seconds</div>
              </div>
              ${toggleHtml(true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
