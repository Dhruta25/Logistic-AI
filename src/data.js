// ============================================
// LogiFlow AI — Mock Data (India Localized)
// ============================================

export const kpiData = [
  { id: 'active-loads', label: 'Active Loads', value: '247', icon: 'fas fa-box', trend: '+12%', trendDir: 'up', color: 'green' },
  { id: 'ontime', label: 'On-time %', value: '94.2%', icon: 'fas fa-clock', trend: '+2.1%', trendDir: 'up', color: 'blue' },
  { id: 'trucks', label: 'Trucks Available', value: '89', icon: 'fas fa-truck', trend: '-3', trendDir: 'down', color: 'purple' },
  { id: 'exceptions', label: 'Exceptions', value: '12', icon: 'fas fa-exclamation-triangle', trend: '-5', trendDir: 'up', color: 'red' },
  { id: 'fuel', label: 'Fuel Cost', value: '₹37.8L', icon: 'fas fa-gas-pump', trend: '+8%', trendDir: 'down', color: 'yellow' },
  { id: 'revenue', label: 'Revenue', value: '₹1.02Cr', icon: 'fas fa-indian-rupee-sign', trend: '+18%', trendDir: 'up', color: 'orange' },
];

export const mapVehicles = [
  { lat: 28.6139, lng: 77.2090, status: 'on-time', label: 'TRK-001', info: 'Delhi → Jaipur' },
  { lat: 19.0760, lng: 72.8777, status: 'delayed', label: 'TRK-014', info: 'Mumbai → Pune' },
  { lat: 12.9716, lng: 77.5946, status: 'on-time', label: 'TRK-007', info: 'Bengaluru → Chennai' },
  { lat: 22.5726, lng: 88.3639, status: 'critical', label: 'TRK-022', info: 'Kolkata → Patna' },
  { lat: 17.3850, lng: 78.4867, status: 'on-time', label: 'TRK-009', info: 'Hyderabad → Vijayawada' },
  { lat: 23.0225, lng: 72.5714, status: 'on-time', label: 'TRK-015', info: 'Ahmedabad → Surat' },
  { lat: 26.9124, lng: 75.7873, status: 'delayed', label: 'TRK-018', info: 'Jaipur → Udaipur' },
  { lat: 13.0827, lng: 80.2707, status: 'on-time', label: 'TRK-031', info: 'Chennai → Coimbatore' },
  { lat: 21.1702, lng: 72.8311, status: 'on-time', label: 'TRK-044', info: 'Surat → Vadodara' },
  { lat: 25.3176, lng: 82.9739, status: 'critical', label: 'TRK-003', info: 'Varanasi → Lucknow' },
  { lat: 30.7333, lng: 76.7794, status: 'on-time', label: 'TRK-027', info: 'Chandigarh → Amritsar' },
  { lat: 15.2993, lng: 74.1240, status: 'on-time', label: 'TRK-033', info: 'Goa → Hubli' },
];

export const dispatchList = [
  { id: 'LD-4821', route: 'Delhi → Jaipur', eta: '2:30 PM', driver: 'Rajesh K.', status: 'On Route', statusType: 'info' },
  { id: 'LD-4822', route: 'Mumbai → Pune', eta: '3:15 PM', driver: 'Suresh P.', status: 'Loading', statusType: 'warning' },
  { id: 'LD-4823', route: 'Bengaluru → Chennai', eta: '5:00 PM', driver: 'Vikram S.', status: 'Delayed', statusType: 'danger' },
  { id: 'LD-4824', route: 'Kolkata → Patna', eta: '1:45 PM', driver: 'Anita D.', status: 'Delivered', statusType: 'success' },
  { id: 'LD-4825', route: 'Hyderabad → Vijayawada', eta: '4:20 PM', driver: 'Mahesh R.', status: 'On Route', statusType: 'info' },
  { id: 'LD-4826', route: 'Ahmedabad → Surat', eta: '6:00 PM', driver: 'Priya M.', status: 'On Route', statusType: 'info' },
  { id: 'LD-4827', route: 'Jaipur → Udaipur', eta: '7:30 PM', driver: 'Amit B.', status: 'Loading', statusType: 'warning' },
];

export const ordersData = [
  { id: 'LD-4821', customer: 'Tata Logistics', origin: 'New Delhi', dest: 'Jaipur, RJ', eta: 'Apr 1, 2:30 PM', status: 'In Transit', statusType: 'info', driver: 'Rajesh K.', priority: 'High' },
  { id: 'LD-4822', customer: 'Reliance Supply', origin: 'Mumbai, MH', dest: 'Pune, MH', eta: 'Apr 1, 3:15 PM', status: 'Pending', statusType: 'warning', driver: 'Suresh P.', priority: 'Medium' },
  { id: 'LD-4823', customer: 'Flipkart Cargo', origin: 'Bengaluru, KA', dest: 'Chennai, TN', eta: 'Apr 1, 5:00 PM', status: 'Delayed', statusType: 'danger', driver: 'Vikram S.', priority: 'High' },
  { id: 'LD-4824', customer: 'Amazon India', origin: 'Kolkata, WB', dest: 'Patna, BR', eta: 'Apr 1, 1:45 PM', status: 'Delivered', statusType: 'success', driver: 'Anita D.', priority: 'Low' },
  { id: 'LD-4825', customer: 'Delhivery Express', origin: 'Hyderabad, TS', dest: 'Vijayawada, AP', eta: 'Apr 1, 4:20 PM', status: 'In Transit', statusType: 'info', driver: 'Mahesh R.', priority: 'Medium' },
  { id: 'LD-4826', customer: 'Gati Ltd', origin: 'Ahmedabad, GJ', dest: 'Surat, GJ', eta: 'Apr 1, 6:00 PM', status: 'In Transit', statusType: 'info', driver: 'Priya M.', priority: 'Low' },
  { id: 'LD-4827', customer: 'Blue Dart', origin: 'Jaipur, RJ', dest: 'Udaipur, RJ', eta: 'Apr 2, 7:30 PM', status: 'Pending', statusType: 'warning', driver: 'Amit B.', priority: 'Medium' },
  { id: 'LD-4828', customer: 'Mahindra Logistics', origin: 'Chandigarh, PB', dest: 'Amritsar, PB', eta: 'Apr 2, 10:00 AM', status: 'In Transit', statusType: 'info', driver: 'Harpreet S.', priority: 'High' },
  { id: 'LD-4829', customer: 'Rivigo Transport', origin: 'Lucknow, UP', dest: 'Varanasi, UP', eta: 'Apr 2, 11:30 AM', status: 'Delivered', statusType: 'success', driver: 'Deepak N.', priority: 'Low' },
  { id: 'LD-4830', customer: 'Tata Logistics', origin: 'Coimbatore, TN', dest: 'Kochi, KL', eta: 'Apr 2, 2:00 PM', status: 'Pending', statusType: 'warning', driver: 'Ravi T.', priority: 'Medium' },
];

export const kanbanData = {
  unassigned: [
    { id: 'LD-4831', priority: 'high', route: 'Nagpur → Indore', eta: '4:00 PM', driver: null },
    { id: 'LD-4832', priority: 'medium', route: 'Goa → Hubli', eta: '6:30 PM', driver: null },
    { id: 'LD-4833', priority: 'low', route: 'Bhopal → Jabalpur', eta: '8:00 PM', driver: null },
  ],
  assigned: [
    { id: 'LD-4822', priority: 'medium', route: 'Mumbai → Pune', eta: '3:15 PM', driver: 'Suresh P.' },
    { id: 'LD-4827', priority: 'high', route: 'Jaipur → Udaipur', eta: '7:30 PM', driver: 'Amit B.' },
    { id: 'LD-4830', priority: 'medium', route: 'Coimbatore → Kochi', eta: '2:00 PM', driver: 'Ravi T.' },
  ],
  'in-transit': [
    { id: 'LD-4821', priority: 'high', route: 'Delhi → Jaipur', eta: '2:30 PM', driver: 'Rajesh K.' },
    { id: 'LD-4825', priority: 'medium', route: 'Hyderabad → Vijayawada', eta: '4:20 PM', driver: 'Mahesh R.' },
    { id: 'LD-4826', priority: 'low', route: 'Ahmedabad → Surat', eta: '6:00 PM', driver: 'Priya M.' },
    { id: 'LD-4828', priority: 'high', route: 'Chandigarh → Amritsar', eta: '10:00 AM', driver: 'Harpreet S.' },
  ],
  delivered: [
    { id: 'LD-4824', priority: 'low', route: 'Kolkata → Patna', eta: '1:45 PM', driver: 'Anita D.' },
    { id: 'LD-4829', priority: 'low', route: 'Lucknow → Varanasi', eta: '11:30 AM', driver: 'Deepak N.' },
  ],
};

export const fleetData = [
  { id: 'VH-1001', type: 'Tata Prima', status: 'Active', statusType: 'success', driver: 'Rajesh K.', location: 'NH-48 near Manesar, HR', lastPing: '2 min ago', health: 92 },
  { id: 'VH-1002', type: 'Ashok Leyland', status: 'Active', statusType: 'success', driver: 'Suresh P.', location: 'Mumbai-Pune Expressway', lastPing: '1 min ago', health: 88 },
  { id: 'VH-1003', type: 'Tata Prima', status: 'Maintenance', statusType: 'warning', driver: '—', location: 'Depot Alpha, Delhi', lastPing: '3 hrs ago', health: 45 },
  { id: 'VH-1004', type: 'BharatBenz', status: 'Active', statusType: 'success', driver: 'Vikram S.', location: 'NH-44 near Anantapur, AP', lastPing: '5 min ago', health: 76 },
  { id: 'VH-1005', type: 'Reefer Truck', status: 'Critical', statusType: 'danger', driver: 'Mahesh R.', location: 'NH-65 near Guntur, AP', lastPing: '12 min ago', health: 23 },
  { id: 'VH-1006', type: 'Tata Prima', status: 'Active', statusType: 'success', driver: 'Anita D.', location: 'NH-19 near Dhanbad, JH', lastPing: '1 min ago', health: 95 },
  { id: 'VH-1007', type: 'Eicher Pro', status: 'Active', statusType: 'success', driver: 'Priya M.', location: 'NH-48 near Vadodara, GJ', lastPing: '3 min ago', health: 81 },
  { id: 'VH-1008', type: 'Tata Prima', status: 'Maintenance', statusType: 'warning', driver: '—', location: 'Depot Beta, Mumbai', lastPing: '6 hrs ago', health: 38 },
  { id: 'VH-1009', type: 'Ashok Leyland', status: 'Active', statusType: 'success', driver: 'Harpreet S.', location: 'NH-44 near Karnal, HR', lastPing: '2 min ago', health: 89 },
  { id: 'VH-1010', type: 'BharatBenz', status: 'Critical', statusType: 'danger', driver: '—', location: 'Depot Gamma, Chennai', lastPing: '1 day ago', health: 12 },
];

export const driversData = [
  { name: 'Rajesh Kumar', initials: 'RK', exp: '8 years', rating: 4.8, stars: 5, trips: 1243, hos: '6h 20m / 11h', license: 'Valid — HMV', medical: 'Valid — Dec 2026', hazmat: 'Certified', compliance: 'green' },
  { name: 'Suresh Patil', initials: 'SP', exp: '5 years', rating: 4.6, stars: 5, trips: 876, hos: '4h 10m / 11h', license: 'Valid — HMV', medical: 'Valid — Sep 2026', hazmat: 'N/A', compliance: 'green' },
  { name: 'Vikram Singh', initials: 'VS', exp: '12 years', rating: 4.9, stars: 5, trips: 2104, hos: '9h 45m / 11h', license: 'Valid — HMV', medical: 'Valid — Mar 2026', hazmat: 'Certified', compliance: 'yellow' },
  { name: 'Anita Desai', initials: 'AD', exp: '3 years', rating: 4.4, stars: 4, trips: 512, hos: '2h 30m / 11h', license: 'Valid — LMV', medical: 'Valid — Jun 2026', hazmat: 'N/A', compliance: 'green' },
  { name: 'Mahesh Reddy', initials: 'MR', exp: '7 years', rating: 4.7, stars: 5, trips: 1087, hos: '7h 50m / 11h', license: 'Valid — HMV', medical: 'Expiring Soon', hazmat: 'Certified', compliance: 'yellow' },
  { name: 'Priya Mehta', initials: 'PM', exp: '4 years', rating: 4.5, stars: 5, trips: 643, hos: '3h 15m / 11h', license: 'Valid — HMV', medical: 'Valid — Nov 2026', hazmat: 'N/A', compliance: 'green' },
  { name: 'Amit Bhatia', initials: 'AB', exp: '10 years', rating: 4.3, stars: 4, trips: 1876, hos: '10h 20m / 11h', license: 'Renewal Due', medical: 'Valid — Aug 2026', hazmat: 'Certified', compliance: 'red' },
  { name: 'Harpreet Singh', initials: 'HS', exp: '6 years', rating: 4.6, stars: 5, trips: 934, hos: '5h 40m / 11h', license: 'Valid — HMV', medical: 'Valid — Feb 2027', hazmat: 'N/A', compliance: 'green' },
];

export const routesData = [
  { id: 'RT-001', origin: 'New Delhi', dest: 'Jaipur, RJ', distance: '280 km', eta: '2:30 PM', progress: 72, driver: 'Rajesh K.', vehicle: 'VH-1001', status: 'on-time' },
  { id: 'RT-002', origin: 'Mumbai, MH', dest: 'Pune, MH', distance: '150 km', eta: '3:15 PM', progress: 35, driver: 'Suresh P.', vehicle: 'VH-1002', status: 'on-time' },
  { id: 'RT-003', origin: 'Bengaluru, KA', dest: 'Chennai, TN', distance: '350 km', eta: '5:00 PM', progress: 58, driver: 'Vikram S.', vehicle: 'VH-1004', status: 'delayed' },
  { id: 'RT-004', origin: 'Hyderabad, TS', dest: 'Vijayawada, AP', distance: '275 km', eta: '4:20 PM', progress: 44, driver: 'Mahesh R.', vehicle: 'VH-1005', status: 'on-time' },
  { id: 'RT-005', origin: 'Ahmedabad, GJ', dest: 'Surat, GJ', distance: '265 km', eta: '6:00 PM', progress: 81, driver: 'Priya M.', vehicle: 'VH-1007', status: 'on-time' },
];

export const warehousesData = [
  { name: 'Hub Alpha', location: 'New Delhi, DL', capacity: 78, inbound: 34, outbound: 28, docks: { total: 12, active: 9 }, alert: null },
  { name: 'Hub Beta', location: 'Mumbai, MH', capacity: 92, inbound: 45, outbound: 38, docks: { total: 8, active: 8 }, alert: 'Near capacity — consider rerouting' },
  { name: 'Hub Gamma', location: 'Chennai, TN', capacity: 54, inbound: 18, outbound: 22, docks: { total: 10, active: 6 }, alert: null },
  { name: 'Hub Delta', location: 'Bengaluru, KA', capacity: 67, inbound: 29, outbound: 31, docks: { total: 15, active: 11 }, alert: null },
  { name: 'Hub Epsilon', location: 'Kolkata, WB', capacity: 85, inbound: 52, outbound: 47, docks: { total: 20, active: 18 }, alert: 'High congestion at docks 14-17' },
  { name: 'Hub Zeta', location: 'Ahmedabad, GJ', capacity: 41, inbound: 12, outbound: 15, docks: { total: 6, active: 4 }, alert: null },
];

export const podData = [
  { id: 'POD-001', loadId: 'LD-4824', date: 'Apr 1, 2026', type: 'Signature', status: 'Approved', statusType: 'success', icon: 'fas fa-file-signature' },
  { id: 'POD-002', loadId: 'LD-4829', date: 'Apr 1, 2026', type: 'Photo', status: 'Approved', statusType: 'success', icon: 'fas fa-camera' },
  { id: 'POD-003', loadId: 'LD-4821', date: 'Apr 1, 2026', type: 'Document', status: 'Pending', statusType: 'warning', icon: 'fas fa-file-pdf' },
  { id: 'POD-004', loadId: 'LD-4825', date: 'Mar 31, 2026', type: 'Photo', status: 'Rejected', statusType: 'danger', icon: 'fas fa-camera' },
  { id: 'POD-005', loadId: 'LD-4820', date: 'Mar 31, 2026', type: 'Signature', status: 'Approved', statusType: 'success', icon: 'fas fa-file-signature' },
  { id: 'POD-006', loadId: 'LD-4819', date: 'Mar 30, 2026', type: 'Document', status: 'Pending', statusType: 'warning', icon: 'fas fa-file-pdf' },
];

export const invoicesData = [
  { id: 'INV-10421', customer: 'Tata Logistics', amount: '₹10,42,500', dueDate: 'Apr 15, 2026', status: 'Paid', statusType: 'success' },
  { id: 'INV-10422', customer: 'Reliance Supply', amount: '₹6,96,800', dueDate: 'Apr 18, 2026', status: 'Pending', statusType: 'warning' },
  { id: 'INV-10423', customer: 'Flipkart Cargo', amount: '₹13,21,400', dueDate: 'Mar 28, 2026', status: 'Overdue', statusType: 'danger' },
  { id: 'INV-10424', customer: 'Amazon India', amount: '₹4,35,600', dueDate: 'Apr 20, 2026', status: 'Pending', statusType: 'warning' },
  { id: 'INV-10425', customer: 'Delhivery Express', amount: '₹18,51,000', dueDate: 'Apr 10, 2026', status: 'Paid', statusType: 'success' },
  { id: 'INV-10426', customer: 'Gati Ltd', amount: '₹8,26,700', dueDate: 'Apr 22, 2026', status: 'Pending', statusType: 'warning' },
  { id: 'INV-10427', customer: 'Blue Dart', amount: '₹15,49,500', dueDate: 'Mar 25, 2026', status: 'Overdue', statusType: 'danger' },
  { id: 'INV-10428', customer: 'Mahindra Logistics', amount: '₹5,65,000', dueDate: 'Apr 5, 2026', status: 'Paid', statusType: 'success' },
];

export const aiRecommendations = [
  {
    type: 'assignment',
    severity: 'medium',
    title: 'Optimal Driver-Truck Assignment',
    desc: 'Based on route patterns and driver performance, reassign Amit B. (VH-1008) to Route RT-003 for 18% efficiency gain. Current driver Vikram S. has 94% fatigue risk.',
    confidence: 94,
    actions: ['Accept', 'Dismiss', 'Override'],
  },
  {
    type: 'delay',
    severity: 'high',
    title: 'Delay Risk: NH-44 Corridor',
    desc: 'Heavy rain alert + construction on NH-44 near Anantapur. Load LD-4823 estimated 2.5hr delay. Alternate route via NH-48 saves 45 minutes.',
    confidence: 89,
    actions: ['Reroute', 'Dismiss', 'Monitor'],
  },
  {
    type: 'cost',
    severity: 'medium',
    title: 'Fuel Cost Anomaly Detected',
    desc: 'Vehicle VH-1005 consuming 32% more fuel than fleet average on similar routes. Possible mechanical issue or route inefficiency. Estimated monthly loss: ₹1,03,800.',
    confidence: 87,
    actions: ['Schedule Check', 'Dismiss', 'Details'],
  },
  {
    type: 'invoice',
    severity: 'low',
    title: 'Invoice Discrepancy: INV-10423',
    desc: 'Flipkart Cargo invoice shows ₹1,75,700 surcharge not matching contracted rates. Similar pattern detected in 3 previous invoices.',
    confidence: 92,
    actions: ['Flag', 'Dismiss', 'Review'],
  },
  {
    type: 'delay',
    severity: 'high',
    title: 'Congestion Alert: Hub Epsilon',
    desc: 'Dock utilization at 90%. 4 inbound loads arriving within 30-min window. Suggest staggering arrivals or routing 2 loads to Hub Alpha.',
    confidence: 96,
    actions: ['Reroute', 'Dismiss', 'Monitor'],
  },
  {
    type: 'assignment',
    severity: 'low',
    title: 'Driver Hours Optimization',
    desc: 'Amit B. approaching HOS limit (10h 20m / 11h). Suggest reassigning remaining stops to Harpreet S. who has 5h 40m remaining.',
    confidence: 91,
    actions: ['Reassign', 'Dismiss', 'Details'],
  },
];

export const settingsConfig = {
  alerts: [
    { label: 'Delivery Delays', detail: 'Alert when delivery is 30+ mins late', enabled: true },
    { label: 'Route Deviations', detail: 'Alert on >10% route deviation', enabled: true },
    { label: 'Vehicle Health Critical', detail: 'Alert when health drops below 25%', enabled: true },
    { label: 'HOS Violations', detail: 'Alert when driver exceeds hours limit', enabled: true },
    { label: 'Billing Anomalies', detail: 'Flag invoices with unusual charges', enabled: false },
    { label: 'Fuel Consumption Spikes', detail: 'Alert on >20% fuel increase', enabled: true },
  ],
  notifications: [
    { label: 'In-App Notifications', detail: 'Real-time alerts in dashboard', enabled: true },
    { label: 'Email Notifications', detail: 'Send alerts to admin@logiflow.ai', enabled: true },
    { label: 'SMS Notifications', detail: 'Text alerts to +91 98765 43210', enabled: false },
    { label: 'Slack Integration', detail: 'Post alerts to #logistics channel', enabled: false },
  ],
  rules: [
    { label: 'Auto-reassign on delay', detail: 'Reassign loads when delay > 2 hours', enabled: true },
    { label: 'Auto-reroute on weather', detail: 'Automatically suggest alternate routes', enabled: true },
    { label: 'Auto-flag overdue invoices', detail: 'Flag invoices overdue by 7+ days', enabled: true },
  ],
};
