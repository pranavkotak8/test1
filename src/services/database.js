// In-memory database - bulletproof, no native module issues
// All features work perfectly. Data resets when app closes (persistence can be added later).

let items = [];
let notificationSettings = {
  id: 1,
  enabled: 1,
  threeDaysBefore: 1,
  oneDayBefore: 1,
  dayOfExpiry: 1,
  morningTime: '08:00',
};
let initialized = false;

export async function initDatabase() {
  if (initialized) return true;
  console.log('[DB] In-memory database initialized');
  initialized = true;
  return true;
}

export async function getDatabase() {
  await initDatabase();
  return { items, notificationSettings };
}

export async function addItem(item) {
  await initDatabase();
  items.push(item);
  console.log('[DB] Added item:', item.itemName);
  return { changes: 1 };
}

export async function updateItem(id, updates) {
  await initDatabase();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    console.log('[DB] Updated item:', id);
  }
  return { changes: index !== -1 ? 1 : 0 };
}

export async function deleteItem(id) {
  await initDatabase();
  const before = items.length;
  items = items.filter(i => i.id !== id);
  console.log('[DB] Deleted item:', id);
  return { changes: before - items.length };
}

export async function getItemById(id) {
  await initDatabase();
  return items.find(i => i.id === id) || null;
}

export async function getAllItems(filters = {}) {
  await initDatabase();
  let result = [...items];

  if (filters.status) {
    result = result.filter(i => i.status === filters.status);
  }
  if (filters.category) {
    result = result.filter(i => i.category === filters.category);
  }
  if (filters.storageLocation) {
    result = result.filter(i => i.storageLocation === filters.storageLocation);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(i => 
      i.itemName.toLowerCase().includes(q) ||
      (i.originalReceiptName && i.originalReceiptName.toLowerCase().includes(q))
    );
  }
  if (filters.excludeConsumed) {
    result = result.filter(i => i.status !== 'consumed');
  }

  return result.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export async function getExpiringItems(days = 3) {
  await initDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  return items
    .filter(i => i.expiryDate <= cutoffString && i.status !== 'consumed' && i.status !== 'expired')
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export async function getItemsByStatus(status) {
  await initDatabase();
  return items.filter(i => i.status === status).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export async function updateItemStatus(id, status) {
  await initDatabase();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index].status = status;
    items[index].updatedAt = new Date().toISOString();
  }
  return { changes: index !== -1 ? 1 : 0 };
}

export async function getNotificationSettings() {
  await initDatabase();
  return { ...notificationSettings };
}

export async function updateNotificationSettings(settings) {
  await initDatabase();
  notificationSettings = { ...notificationSettings, ...settings };
  return { changes: 1 };
}

export async function getInventoryStats() {
  await initDatabase();
  return {
    total: items.length,
    fresh: items.filter(i => i.status === 'fresh').length,
    expiring_soon: items.filter(i => i.status === 'expiring_soon').length,
    expired: items.filter(i => i.status === 'expired').length,
    consumed: items.filter(i => i.status === 'consumed').length,
  };
}
