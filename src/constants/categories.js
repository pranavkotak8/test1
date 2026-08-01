export const CATEGORIES = {
  PRODUCE: { id: 'produce', label: 'Produce', icon: 'leaf', color: '#22c55e' },
  DAIRY: { id: 'dairy', label: 'Dairy', icon: 'water', color: '#3b82f6' },
  MEAT: { id: 'meat', label: 'Meat', icon: 'nutrition', color: '#ef4444' },
  PANTRY: { id: 'pantry', label: 'Pantry', icon: 'archive', color: '#f59e0b' },
  FROZEN: { id: 'frozen', label: 'Frozen', icon: 'snow', color: '#06b6d4' },
  BEVERAGES: { id: 'beverages', label: 'Beverages', icon: 'wine', color: '#8b5cf6' },
  HOUSEHOLD: { id: 'household', label: 'Household', icon: 'home', color: '#6b7280' },
  OTHER: { id: 'other', label: 'Other', icon: 'help-circle', color: '#9ca3af' },
};

export const STORAGE_LOCATIONS = {
  FRIDGE: { id: 'fridge', label: 'Fridge', icon: 'thermometer', color: '#3b82f6' },
  FREEZER: { id: 'freezer', label: 'Freezer', icon: 'snow', color: '#06b6d4' },
  PANTRY: { id: 'pantry', label: 'Pantry', icon: 'archive', color: '#f59e0b' },
  COUNTER: { id: 'counter', label: 'Counter', icon: 'desktop', color: '#f97316' },
};

export const STATUS_CONFIG = {
  fresh: { color: '#10b981', bgColor: '#d1fae5', label: 'Fresh', icon: 'checkmark-circle' },
  expiring_soon: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Expiring Soon', icon: 'warning' },
  expired: { color: '#ef4444', bgColor: '#fee2e2', label: 'Expired', icon: 'alert-circle' },
  consumed: { color: '#6b7280', bgColor: '#f3f4f6', label: 'Consumed', icon: 'checkmark-done' },
};
