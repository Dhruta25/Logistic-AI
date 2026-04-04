
import './style.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  renderDashboard, renderOrders, renderDispatch, renderFleet,
  renderDrivers, renderRoutes, renderWarehouses, renderPOD,
  renderBilling, renderReports, renderAIOps, renderSettings
} from './pages.js';
import { ordersData, mapVehicles, fleetData, invoicesData, driversData, routesData } from './data.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Navigation Configuration ---
const navItems = [
  { key: 'dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
  { key: 'fleet', icon: 'fas fa-truck-moving', label: 'Fleet' },
  { key: 'routes', icon: 'fas fa-route', label: 'Routes' },
  { key: 'orders', icon: 'fas fa-boxes-stacked', label: 'Shipments', badge: '10' },
  { key: 'reports', icon: 'fas fa-chart-area', label: 'Analytics' },
  { key: 'settings', icon: 'fas fa-gear', label: 'Settings' },
];

const pageRenderers = {
  dashboard: renderDashboard,
  orders: renderOrders,
  dispatch: renderDispatch,
  fleet: renderFleet,
  drivers: renderDrivers,
  routes: renderRoutes,
  warehouses: renderWarehouses,
  pod: renderPOD,
  billing: renderBilling,
  reports: renderReports,
  'ai-ops': renderAIOps,
  settings: renderSettings,
};

let currentPage = 'dashboard';
let mapInstances = {};

function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = navItems.map(item => {
    if (item.divider) {
      return `<div class="nav-section-label">${item.label}</div>`;
    }
    const badgeHtml = item.badge
      ? `<span class="nav-badge ${item.badgeClass || ''}">${item.badge}</span>`
      : '';
    return `
      <div class="nav-item ${item.key === currentPage ? 'active' : ''}" data-page="${item.key}" id="nav-${item.key}">
        <i class="${item.icon}"></i>
        <span>${item.label}</span>
        ${badgeHtml}
      </div>
    `;
  }).join('');

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

function navigateTo(page) {
  currentPage = page;

  Object.values(mapInstances).forEach(m => { try { m.remove(); } catch (e) { } });
  mapInstances = {};

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const content = document.getElementById('pageContent');
  const renderer = pageRenderers[page];
  if (renderer) {
    content.innerHTML = renderer();
    content.scrollTop = 0;

    // Post-render hooks
    if (page === 'dashboard') initDashboardMap();
    if (page === 'orders') initOrdersInteractions();
    if (page === 'dispatch') initKanbanDragDrop();
    if (page === 'routes') initRoutesMap();
    if (page === 'pod') initPODUpload();
    if (page === 'reports') animateChartBars();

    // Global button handlers after render
    initButtonHandlers(page);
  }

  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

function initDashboardMap() {
  const mapEl = document.getElementById('dashboardMap');
  if (!mapEl) return;

  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView([22.5, 78.9], 5);
  mapInstances.dashboard = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  const statusColors = {
    'on-time': '#818CF8',
    'delayed': '#FBBF24',
    'critical': '#F87171',
  };

  mapVehicles.forEach(v => {
    const marker = L.circleMarker([v.lat, v.lng], {
      radius: 8,
      fillColor: statusColors[v.status],
      color: 'rgba(255,255,255,0.6)',
      weight: 2,
      fillOpacity: 0.9,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:140px;color:#E8EAF0">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${v.label}</div>
        <div style="font-size:12px;color:#8B92A8;margin-bottom:4px">${v.info}</div>
        <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${statusColors[v.status]}22;color:${statusColors[v.status]}">${v.status.replace('-', ' ').toUpperCase()}</span>
      </div>
    `);
  });

  // Add legend
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-legend');
    div.innerHTML = `
      <div style="background:rgba(15,18,32,0.85);backdrop-filter:blur(12px);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);font-family:Inter,sans-serif;font-size:11px;color:#E8EAF0">
        <div style="font-weight:700;margin-bottom:6px;font-size:12px">Vehicle Status</div>
        <div style="display:flex;gap:12px">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#818CF8"></div>On Time</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#FBBF24"></div>Delayed</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#F87171"></div>Critical</div>
        </div>
      </div>
    `;
    return div;
  };
  legend.addTo(map);

  setTimeout(() => map.invalidateSize(), 200);
}

function initRoutesMap() {
  const mapEl = document.getElementById('routesMap');
  if (!mapEl) return;

  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView([20.5, 78.9], 5);
  mapInstances.routes = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  const routeCoords = [
    { origin: [28.6139, 77.2090], dest: [26.9124, 75.7873], status: 'on-time', label: 'RT-001: Delhi → Jaipur' },
    { origin: [19.0760, 72.8777], dest: [18.5204, 73.8567], status: 'on-time', label: 'RT-002: Mumbai → Pune' },
    { origin: [12.9716, 77.5946], dest: [13.0827, 80.2707], status: 'delayed', label: 'RT-003: Bengaluru → Chennai' },
    { origin: [17.3850, 78.4867], dest: [16.5062, 80.6480], status: 'on-time', label: 'RT-004: Hyderabad → Vijayawada' },
    { origin: [23.0225, 72.5714], dest: [21.1702, 72.8311], status: 'on-time', label: 'RT-005: Ahmedabad → Surat' },
  ];

  const colors = { 'on-time': '#818CF8', 'delayed': '#EC4899' };

  routeCoords.forEach(r => {
    L.polyline([r.origin, r.dest], {
      color: colors[r.status],
      weight: 3,
      opacity: 0.7,
      dashArray: r.status === 'delayed' ? '8, 4' : null,
    }).addTo(map).bindPopup(`<b>${r.label}</b>`);

    L.circleMarker(r.origin, { radius: 6, fillColor: '#818CF8', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);
    L.circleMarker(r.dest, { radius: 6, fillColor: '#EC4899', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);
  });

  setTimeout(() => map.invalidateSize(), 200);
}

// ============================================
// FUNCTIONAL BUTTON HANDLERS
// ============================================
function initButtonHandlers(page) {
  // --- Export / Download buttons ---
  bindClick('btnExportDashboard', () => exportDashboardPDF());
  bindClick('btnNewLoad', () => showFormModal('New Load', getNewLoadForm()));
  bindClick('btnExportOrders', () => exportTableCSV(ordersData, ['id', 'customer', 'origin', 'dest', 'eta', 'status', 'driver', 'priority'], 'orders_export.csv'));
  bindClick('btnCreateLoad', () => showFormModal('Create New Load', getNewLoadForm()));
  bindClick('btnFilterOrders', () => toggleFilters());
  bindClick('btnExportFleet', () => exportTableCSV(fleetData, ['id', 'type', 'status', 'driver', 'location', 'lastPing', 'health'], 'fleet_export.csv'));
  bindClick('btnAddVehicle', () => showFormModal('Add Vehicle', getAddVehicleForm()));
  bindClick('btnExportDrivers', () => exportTableCSV(driversData, ['name', 'exp', 'rating', 'trips', 'hos', 'license', 'compliance'], 'drivers_export.csv'));
  bindClick('btnAddDriver', () => showFormModal('Add Driver', getAddDriverForm()));
  bindClick('btnExportRoutes', () => exportRoutesPDF());
  bindClick('btnRefreshDispatch', () => { showToast('Dispatch board refreshed', 'success'); navigateTo('dispatch'); });
  bindClick('btnAddLoad', () => showFormModal('Add Load', getNewLoadForm()));
  bindClick('btnAddHub', () => showFormModal('Add Hub', getAddHubForm()));
  bindClick('btnExportPOD', () => exportPODPDF());
  bindClick('btnExportBilling', () => exportTableCSV(invoicesData, ['id', 'customer', 'amount', 'dueDate', 'status'], 'invoices_export.csv'));
  bindClick('btnCreateInvoice', () => showFormModal('Create Invoice', getCreateInvoiceForm()));
  bindClick('btnExportReportPDF', () => exportReportsPDF());
  bindClick('btnExportReportCSV', () => exportReportsCSV());
  bindClick('btnConfigureAI', () => showFormModal('AI Configuration', getAIConfigForm()));
  bindClick('btnSaveSettings', () => { showToast('Settings saved successfully!', 'success'); });
  bindClick('viewAllDispatch', () => navigateTo('dispatch'));

  document.querySelectorAll('.btn-view-invoice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = btn.dataset;
      showViewModal('Invoice Details', `
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid var(--border)">
            <div>
              <div style="font-size:22px;font-weight:700;color:var(--primary)">LogiFlow AI</div>
              <div style="font-size:12px;color:var(--text-tertiary)">Logistics Management Platform</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:18px;font-weight:700">${d.id}</div>
              <div style="font-size:12px;color:var(--text-tertiary)">Due: ${d.due}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
            <div>
              <div style="font-size:11px;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:4px">Bill To</div>
              <div style="font-weight:600">${d.customer}</div>
              <div style="font-size:12px;color:var(--text-secondary)">India</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:11px;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:4px">Amount</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)">${d.amount}</div>
            </div>
          </div>
          <div style="padding:12px 16px;border-radius:8px;background:${d.status === 'Paid' ? 'var(--success-bg)' : d.status === 'Overdue' ? 'var(--danger-bg)' : 'var(--warning-bg)'};color:${d.status === 'Paid' ? 'var(--success)' : d.status === 'Overdue' ? 'var(--danger)' : 'var(--warning)'};font-weight:600;text-align:center">
            Status: ${d.status}
          </div>
        </div>
      `);
    });
  });

  document.querySelectorAll('.btn-download-invoice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = btn.dataset;
      downloadInvoicePDF(d.id, d.customer, d.amount, d.due, d.status);
    });
  });

  // --- POD View/Download buttons ---
  document.querySelectorAll('.btn-view-pod').forEach(btn => {
    btn.addEventListener('click', () => {
      showViewModal(`POD — ${btn.dataset.load}`, `
        <div style="padding:20px;text-align:center">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i class="fas fa-${btn.dataset.type === 'Signature' ? 'file-signature' : btn.dataset.type === 'Photo' ? 'camera' : 'file-pdf'}" style="font-size:32px;color:var(--primary)"></i>
          </div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px">${btn.dataset.type} Proof</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:20px">Load: ${btn.dataset.load} • Type: ${btn.dataset.type}</div>
          <div style="padding:40px;border:2px dashed var(--border);border-radius:12px;margin-bottom:16px">
            <i class="fas fa-file-lines" style="font-size:48px;color:var(--text-tertiary)"></i>
            <p style="margin-top:12px;font-size:13px;color:var(--text-tertiary)">Document preview would appear here</p>
          </div>
        </div>
      `);
    });
  });

  document.querySelectorAll('.btn-download-pod').forEach(btn => {
    btn.addEventListener('click', () => {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('LogiFlow AI — Proof of Delivery', 20, 25);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`POD ID: ${btn.dataset.pod}`, 20, 40);
      doc.text(`Load: ${btn.dataset.load}`, 20, 50);
      doc.text(`Type: ${btn.dataset.type}`, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 70);
      doc.text('Status: Verified', 20, 80);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(20, 90, 190, 90);

      doc.text('This document certifies that the delivery has been', 20, 105);
      doc.text('completed and verified by the receiving party.', 20, 115);

      doc.save(`POD_${btn.dataset.load}.pdf`);
      showToast(`Downloaded POD for ${btn.dataset.load}`, 'success');
    });
  });

  // --- AI Action Buttons ---
  document.querySelectorAll('.btn-ai-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const title = btn.dataset.title;
      if (action === 'Dismiss') {
        btn.closest('.ai-card').style.opacity = '0.4';
        btn.closest('.ai-card').style.pointerEvents = 'none';
        showToast(`Dismissed: ${title}`, 'info');
      } else if (['Accept', 'Reroute', 'Reassign', 'Schedule Check', 'Flag'].includes(action)) {
        btn.closest('.ai-card').style.borderColor = 'var(--success)';
        btn.closest('.ai-card').style.background = 'var(--success-bg)';
        showToast(`${action} executed: ${title}`, 'success');
      } else {
        showToast(`Viewing details: ${title}`, 'info');
      }
    });
  });

  // --- Filter functionality for Orders ---
  if (page === 'orders') {
    ['filterStatus', 'filterCustomer', 'filterPriority', 'filterOrigin'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', filterOrdersTable);
    });
  }
}

function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

function filterOrdersTable() {
  const status = document.getElementById('filterStatus')?.value || '';
  const customer = document.getElementById('filterCustomer')?.value || '';
  const priority = document.getElementById('filterPriority')?.value || '';
  const origin = document.getElementById('filterOrigin')?.value || '';

  document.querySelectorAll('#ordersTable tbody tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowStatus = cells[4]?.textContent.trim() || '';
    const rowCustomer = cells[1]?.textContent.trim() || '';
    const rowPriority = cells[6]?.textContent.trim() || '';
    const rowOrigin = cells[2]?.textContent.trim() || '';

    const show = (
      (!status || rowStatus.includes(status)) &&
      (!customer || rowCustomer.includes(customer)) &&
      (!priority || rowPriority.includes(priority)) &&
      (!origin || rowOrigin.includes(origin))
    );
    row.style.display = show ? '' : 'none';
  });
}

function toggleFilters() {
  const bar = document.getElementById('filterBar');
  if (bar) {
    bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
  }
}

function exportTableCSV(data, keys, filename) {
  const header = keys.join(',');
  const rows = data.map(item => keys.map(k => `"${String(item[k] || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const csv = header + '\n' + rows;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`, 'success');
}

function exportDashboardPDF() {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text('LogiFlow AI', 20, 20);
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.text('Dashboard Report', 20, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 38);

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Indicators', 20, 52);

  const kpiLabels = ['Active Loads: 247', 'On-time: 94.2%', 'Trucks Available: 89', 'Exceptions: 12', 'Fuel Cost: ₹37.8L', 'Revenue: ₹1.02Cr'];
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  kpiLabels.forEach((label, i) => {
    doc.text(`• ${label}`, 25, 62 + i * 8);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Today's Dispatch", 20, 120);

  doc.autoTable({
    startY: 128,
    head: [['Load ID', 'Route', 'ETA', 'Driver', 'Status']],
    body: [
      ['LD-4821', 'Delhi → Jaipur', '2:30 PM', 'Rajesh K.', 'On Route'],
      ['LD-4822', 'Mumbai → Pune', '3:15 PM', 'Suresh P.', 'Loading'],
      ['LD-4823', 'Bengaluru → Chennai', '5:00 PM', 'Vikram S.', 'Delayed'],
      ['LD-4824', 'Kolkata → Patna', '1:45 PM', 'Anita D.', 'Delivered'],
      ['LD-4825', 'Hyderabad → Vijayawada', '4:20 PM', 'Mahesh R.', 'On Route'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { font: 'helvetica', fontSize: 9 },
  });

  doc.save('LogiFlow_Dashboard_Report.pdf');
  showToast('Dashboard report downloaded as PDF', 'success');
}

function downloadInvoicePDF(id, customer, amount, due, status) {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text('LogiFlow AI', 20, 20);

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Logistics Management Platform', 20, 28);
  doc.text('India', 20, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', 150, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(id, 150, 30);

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(customer, 20, 60);
  doc.text('India', 20, 68);

  doc.text(`Due Date: ${due}`, 140, 52);
  doc.text(`Status: ${status}`, 140, 60);

  doc.autoTable({
    startY: 80,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: [
      ['Freight Transport Services', '1', amount, amount],
      ['Loading & Unloading', '1', '₹5,000', '₹5,000'],
      ['Insurance', '1', '₹2,500', '₹2,500'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { font: 'helvetica', fontSize: 10 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Total: ${amount}`, 140, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Payment Terms: Net 30 days | GST: 18% applicable', 20, finalY + 20);
  doc.text('Bank: State Bank of India | IFSC: SBIN0001234', 20, finalY + 28);

  doc.save(`Invoice_${id}.pdf`);
  showToast(`Downloaded invoice ${id} as PDF`, 'success');
}

function exportRoutesPDF() {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text('LogiFlow AI — Routes Report', 20, 20);
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 28);

  doc.autoTable({
    startY: 36,
    head: [['Route ID', 'Origin', 'Destination', 'Distance', 'ETA', 'Driver', 'Vehicle', 'Status']],
    body: routesData.map(r => [r.id, r.origin, r.dest, r.distance, r.eta, r.driver, r.vehicle, r.status]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { font: 'helvetica', fontSize: 9 },
  });

  doc.save('LogiFlow_Routes_Report.pdf');
  showToast('Routes report downloaded as PDF', 'success');
}

function exportPODPDF() {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text('LogiFlow AI — Proof of Delivery Report', 20, 20);
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 28);



  doc.autoTable({
    startY: 36,
    head: [['POD ID', 'Load ID', 'Date', 'Type', 'Status']],
    body: [
      ['POD-001', 'LD-4824', 'Apr 1, 2026', 'Signature', 'Approved'],
      ['POD-002', 'LD-4829', 'Apr 1, 2026', 'Photo', 'Approved'],
      ['POD-003', 'LD-4821', 'Apr 1, 2026', 'Document', 'Pending'],
      ['POD-004', 'LD-4825', 'Mar 31, 2026', 'Photo', 'Rejected'],
      ['POD-005', 'LD-4820', 'Mar 31, 2026', 'Signature', 'Approved'],
      ['POD-006', 'LD-4819', 'Mar 30, 2026', 'Document', 'Pending'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { font: 'helvetica', fontSize: 9 },
  });

  doc.save('LogiFlow_POD_Report.pdf');
  showToast('POD report downloaded as PDF', 'success');
}

function exportReportsPDF() {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text('LogiFlow AI', 20, 20);
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.text('Performance Analytics Report', 20, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 38);

  doc.setDrawColor(16, 185, 129);
  doc.line(20, 42, 190, 42);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('On-Time Performance (Last 7 Days)', 20, 52);

  doc.autoTable({
    startY: 58,
    head: [['Day', 'On-Time %']],
    body: [['Monday', '85%'], ['Tuesday', '92%'], ['Wednesday', '78%'], ['Thursday', '95%'], ['Friday', '88%'], ['Saturday', '72%'], ['Sunday', '65%']],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  let y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Drivers', 20, y);

  doc.autoTable({
    startY: y + 6,
    head: [['Driver', 'Rating', 'Trips']],
    body: driversData.slice(0, 5).map(d => [d.name, d.rating.toString(), d.trips.toString()]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save('LogiFlow_Analytics_Report.pdf');
  showToast('Analytics report downloaded as PDF', 'success');
}

function exportReportsCSV() {
  const data = [
    { day: 'Monday', ontime: '85%' },
    { day: 'Tuesday', ontime: '92%' },
    { day: 'Wednesday', ontime: '78%' },
    { day: 'Thursday', ontime: '95%' },
    { day: 'Friday', ontime: '88%' },
    { day: 'Saturday', ontime: '72%' },
    { day: 'Sunday', ontime: '65%' },
  ];
  exportTableCSV(data, ['day', 'ontime'], 'performance_report.csv');
}

function showFormModal(title, formHtml) {
  showViewModal(title, `
    <div style="padding:20px">
      ${formHtml}
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
        <button class="btn btn-secondary" onclick="document.getElementById('viewModal').style.display='none'">Cancel</button>
        <button class="btn btn-primary" onclick="document.getElementById('viewModal').style.display='none';document.querySelector('#toast-container').dispatchEvent(new CustomEvent('toast',{detail:{msg:'Saved successfully!',type:'success'}}))">Save</button>
      </div>
    </div>
  `);
  const saveBtn = document.querySelector('#viewModal .btn-primary');
  if (saveBtn) {
    saveBtn.onclick = () => {
      document.getElementById('viewModal').style.display = 'none';
      showToast('Saved successfully!', 'success');
    };
  }
  const cancelBtn = document.querySelector('#viewModal .btn-secondary');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      document.getElementById('viewModal').style.display = 'none';
    };
  }
}

function showViewModal(title, bodyHtml) {
  const modal = document.getElementById('viewModal');
  modal.querySelector('.view-modal-title').textContent = title;
  modal.querySelector('.view-modal-body').innerHTML = bodyHtml;
  modal.style.display = 'flex';

  document.getElementById('viewModalClose').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function formField(label, type = 'text', placeholder = '') {
  return `
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">${label}</label>
      <input type="${type}" placeholder="${placeholder}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-family);font-size:13px;outline:none;transition:border 0.2s" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" />
    </div>
  `;
}

function formSelect(label, options) {
  return `
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">${label}</label>
      <select style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-family);font-size:13px;outline:none;background:white">
        ${options.map(o => `<option>${o}</option>`).join('')}
      </select>
    </div>
  `;
}

function getNewLoadForm() {
  return `
    ${formField('Customer Name', 'text', 'e.g. Tata Logistics')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${formField('Origin', 'text', 'e.g. Mumbai, MH')}
      ${formField('Destination', 'text', 'e.g. Delhi, DL')}
    </div>
    ${formSelect('Priority', ['High', 'Medium', 'Low'])}
    ${formSelect('Driver', ['Rajesh K.', 'Suresh P.', 'Vikram S.', 'Anita D.', 'Mahesh R.', 'Priya M.'])}
    ${formField('ETA', 'datetime-local')}
  `;
}

function getAddVehicleForm() {
  return `
    ${formField('Vehicle ID', 'text', 'e.g. VH-1011')}
    ${formSelect('Type', ['Tata Prima', 'Ashok Leyland', 'BharatBenz', 'Eicher Pro', 'Reefer Truck'])}
    ${formSelect('Status', ['Active', 'Maintenance', 'Critical'])}
    ${formSelect('Assign Driver', ['— Unassigned —', 'Rajesh K.', 'Suresh P.', 'Vikram S.', 'Anita D.'])}
    ${formField('Location', 'text', 'e.g. NH-48 near Manesar, HR')}
  `;
}

function getAddDriverForm() {
  return `
    ${formField('Full Name', 'text', 'e.g. Rajesh Kumar')}
    ${formField('Experience', 'text', 'e.g. 5 years')}
    ${formSelect('License Type', ['HMV', 'LMV', 'HGMV'])}
    ${formField('Medical Expiry', 'date')}
    ${formSelect('Hazmat Certified', ['Yes', 'No', 'N/A'])}
  `;
}

function getAddHubForm() {
  return `
    ${formField('Hub Name', 'text', 'e.g. Hub Eta')}
    ${formField('Location', 'text', 'e.g. Pune, MH')}
    ${formField('Total Docks', 'number', 'e.g. 10')}
  `;
}

function getCreateInvoiceForm() {
  return `
    ${formField('Invoice ID', 'text', 'e.g. INV-10429')}
    ${formSelect('Customer', ['Tata Logistics', 'Reliance Supply', 'Flipkart Cargo', 'Amazon India', 'Delhivery Express'])}
    ${formField('Amount (₹)', 'text', 'e.g. ₹10,00,000')}
    ${formField('Due Date', 'date')}
  `;
}

function getAIConfigForm() {
  return `
    ${formSelect('AI Model', ['LogiFlow ML v3.2', 'LogiFlow ML v2.8', 'Custom Model'])}
    ${formSelect('Confidence Threshold', ['80%', '85%', '90%', '95%'])}
    ${formSelect('Auto-Execute', ['Manual Approval', 'Auto for Low Risk', 'Full Auto'])}
    ${formField('Max Daily Recommendations', 'number', '25')}
  `;
}

// ============================================
// ORDERS INTERACTIONS
// ============================================
function initOrdersInteractions() {
  document.querySelectorAll('.order-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.id;
      const order = ordersData.find(o => o.id === id);
      if (order) openOrderPanel(order);
    });
  });
}

function openOrderPanel(order) {
  const panel = document.getElementById('slidePanel');
  const overlay = document.getElementById('overlay');

  panel.innerHTML = `
    <div class="slide-panel-header">
      <div>
        <div style="font-size:18px;font-weight:700">${order.id}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${order.customer}</div>
      </div>
      <button class="slide-panel-close" id="closePanelBtn"><i class="fas fa-times"></i></button>
    </div>
    <div class="tabs">
      <div class="tab active">Overview</div>
      <div class="tab">Stops</div>
      <div class="tab">Docs</div>
      <div class="tab">Notes</div>
      <div class="tab">Billing</div>
    </div>
    <div style="padding:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div>
          <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Status</div>
          <span class="badge badge-${order.statusType} badge-dot">${order.status}</span>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Priority</div>
          <span class="badge badge-${order.priority === 'High' ? 'danger' : order.priority === 'Medium' ? 'warning' : 'gray'}">${order.priority}</span>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-body">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px">Route Details</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--primary)"></div>
            <div>
              <div style="font-size:12px;color:var(--text-tertiary)">Pickup</div>
              <div style="font-weight:500">${order.origin}</div>
            </div>
          </div>
          <div style="border-left:2px dashed var(--border);height:20px;margin-left:4px"></div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--danger)"></div>
            <div>
              <div style="font-size:12px;color:var(--text-tertiary)">Delivery</div>
              <div style="font-weight:500">${order.dest}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-body">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px">Assigned Driver</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--info));display:flex;align-items:center;justify-content:center;color:white;font-weight:700">
              ${order.driver.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <div style="font-weight:600">${order.driver}</div>
              <div style="font-size:12px;color:var(--text-secondary)">HMV Licensed</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px">ETA & Timeline</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <i class="far fa-clock" style="color:var(--text-tertiary)"></i>
            <span style="font-weight:500">${order.eta}</span>
          </div>
          <div class="progress-bar" style="height:8px">
            <div class="progress-fill" style="width:${Math.random() * 60 + 20}%"></div>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;display:flex;gap:10px">
        <button class="btn btn-primary btn-download-order-pdf" style="flex:1"><i class="fas fa-file-pdf"></i> Download PDF</button>
        <button class="btn btn-secondary" style="flex:1" id="btnTrackOrder"><i class="fas fa-map-marked-alt"></i> Track on Map</button>
      </div>
    </div>
  `;

  panel.classList.add('open');
  overlay.classList.add('active');

  document.getElementById('closePanelBtn').addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  // Download Order PDF
  panel.querySelector('.btn-download-order-pdf')?.addEventListener('click', () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text(`LogiFlow AI — Order ${order.id}`, 20, 20);
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${order.customer}`, 20, 35);
    doc.text(`Route: ${order.origin} → ${order.dest}`, 20, 43);
    doc.text(`ETA: ${order.eta}`, 20, 51);
    doc.text(`Status: ${order.status}`, 20, 59);
    doc.text(`Priority: ${order.priority}`, 20, 67);
    doc.text(`Driver: ${order.driver}`, 20, 75);
    doc.save(`Order_${order.id}.pdf`);
    showToast(`Downloaded order ${order.id} as PDF`, 'success');
  });

  document.getElementById('btnTrackOrder')?.addEventListener('click', () => {
    closePanel();
    navigateTo('routes');
    showToast(`Tracking ${order.id}: ${order.origin} → ${order.dest}`, 'info');
  });
}

function closePanel() {
  document.getElementById('slidePanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

function initKanbanDragDrop() {
  const cards = document.querySelectorAll('.kanban-card');
  const columns = document.querySelectorAll('.kanban-cards');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.id);
      setTimeout(() => card.style.opacity = '0.4', 0);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      card.style.opacity = '1';
      document.querySelectorAll('.kanban-column').forEach(col => {
        const count = col.querySelector('.kanban-cards').children.length;
        col.querySelector('.col-count').textContent = count;
      });
    });
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.style.background = 'rgba(16, 185, 129, 0.05)';
      const dragging = document.querySelector('.dragging');
      if (dragging) {
        const afterElement = getDragAfterElement(col, e.clientY);
        if (afterElement == null) col.appendChild(dragging);
        else col.insertBefore(dragging, afterElement);
      }
    });
    col.addEventListener('dragleave', () => { col.style.background = ''; });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.style.background = '';
      showToast('Load moved successfully', 'success');
    });
  });
}

function getDragAfterElement(container, y) {
  const children = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
  return children.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function initPODUpload() {
  const area = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  if (!area) return;

  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.style.borderColor = 'var(--primary)';
    area.style.background = 'var(--primary-bg)';
  });
  area.addEventListener('dragleave', () => {
    area.style.borderColor = '';
    area.style.background = '';
  });
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.style.borderColor = '';
    area.style.background = '';
    const files = e.dataTransfer.files;
    if (files.length) showToast(`${files.length} file(s) uploaded successfully!`, 'success');
  });
  area.addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) showToast(`${fileInput.files.length} file(s) uploaded successfully!`, 'success');
    });
  }
}

function animateChartBars() {
  document.querySelectorAll('.chart-bar').forEach(bar => {
    const height = bar.style.height;
    bar.style.height = '0px';
    setTimeout(() => { bar.style.height = height; }, 100);
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fas fa-check-circle', warning: 'fas fa-exclamation-triangle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type]}"></i>${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function initMobileMenu() {
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
  });
}

function initNotifications() {
  document.getElementById('notifBtn').addEventListener('click', () => {
    showToast('5 new notifications', 'info');
  });
}

function initGlobalSearch() {
  const search = document.getElementById('globalSearch');
  search.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      showToast(`Searching for "${search.value}"...`, 'info');
    }
  });
}

function startRealTimeSimulation() {
  setInterval(() => {
    const badge = document.querySelector('.notif-badge');
    if (badge) {
      const count = parseInt(badge.textContent) + (Math.random() > 0.7 ? 1 : 0);
      badge.textContent = Math.min(count, 99);
    }
  }, 15000);
}

function init() {
  buildSidebar();
  navigateTo('dashboard');
  initMobileMenu();
  initNotifications();
  initGlobalSearch();
  startRealTimeSimulation();

  setTimeout(() => {
    showToast('Welcome back, Alex! 5 new alerts.', 'info');
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
