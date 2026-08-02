import { Platform } from 'react-native';

const GOOGLE_VISION_API_KEY = '';
const GOOGLE_VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

const MOCK_RECEIPT_ITEMS = [
  { originalName: 'ORGN BAN', name: 'Organic Bananas', price: '$2.49' },
  { originalName: 'WHOLE MILK', name: 'Whole Milk', price: '$3.99' },
  { originalName: 'CHS CHED', name: 'Cheddar Cheese', price: '$4.29' },
  { originalName: 'GRND BEEF', name: 'Ground Beef', price: '$5.99' },
  { originalName: 'EGGS LRG', name: 'Large Eggs', price: '$3.49' },
  { originalName: 'BREAD WW', name: 'Whole Wheat Bread', price: '$2.99' },
  { originalName: 'YOGURT PLN', name: 'Plain Yogurt', price: '$1.99' },
  { originalName: 'CHKN BRST', name: 'Chicken Breast', price: '$8.99' },
  { originalName: 'LETTUCE ROM', name: 'Romaine Lettuce', price: '$1.79' },
  { originalName: 'TOMATOES', name: 'Tomatoes', price: '$2.99' },
];

export async function scanReceipt(imageBase64, useMock = false) {
  if (useMock || !GOOGLE_VISION_API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          storeName: 'Whole Foods Market',
          purchaseDate: new Date().toISOString().split('T')[0],
          items: MOCK_RECEIPT_ITEMS,
          rawText: 'MOCK RECEIPT DATA',
        });
      }, 1500);
    });
  }
  try {
    const response = await fetch(GOOGLE_VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{ image: { content: imageBase64 }, features: [{ type: 'TEXT_DETECTION', maxResults: 1 }] }]
      }),
    });
    const data = await response.json();
    if (data.responses?.[0]?.fullTextAnnotation) {
      return parseReceiptText(data.responses[0].fullTextAnnotation.text);
    }
    return { storeName: 'Unknown Store', purchaseDate: new Date().toISOString().split('T')[0], items: [], rawText: '' };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to scan receipt. Please try again.');
  }
}

function parseReceiptText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const storeName = lines[0] || 'Unknown Store';
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  const purchaseDate = dateMatch ? normalizeDate(dateMatch[1]) : new Date().toISOString().split('T')[0];
  const items = [];
  const itemRegex = /(.+?)\s+([\$]?\d+\.\d{2})/;
  for (const line of lines) {
    const match = line.match(itemRegex);
    if (match && !line.toLowerCase().includes('total') && !line.toLowerCase().includes('subtotal') && !line.toLowerCase().includes('tax')) {
      items.push({ originalName: match[1].trim(), name: match[1].trim(), price: match[2].startsWith('$') ? match[2] : `$${match[2]}` });
    }
  }
  return { storeName, purchaseDate, items, rawText: text };
}

function normalizeDate(dateStr) {
  try {
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
  } catch (e) {
    // Date parsing failed, fallback used
  }
  return new Date().toISOString().split('T')[0];
}
