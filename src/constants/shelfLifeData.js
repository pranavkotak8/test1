export const SHELF_LIFE_DATABASE = {
  'banana': { category: 'produce', names: ['banana', 'bananas', 'orgn ban', 'organic banana'], pantry: 5, fridge: 7, freezer: 90 },
  'apple': { category: 'produce', names: ['apple', 'apples', 'gala apple', 'granny smith', 'fuji apple', 'red apple', 'green apple'], pantry: 14, fridge: 30, freezer: 240 },
  'orange': { category: 'produce', names: ['orange', 'oranges', 'navel orange', 'blood orange', 'clementine', 'mandarin'], pantry: 10, fridge: 21, freezer: 180 },
  'strawberry': { category: 'produce', names: ['strawberry', 'strawberries', 'berry', 'berries'], pantry: 1, fridge: 5, freezer: 180 },
  'blueberry': { category: 'produce', names: ['blueberry', 'blueberries'], pantry: 1, fridge: 7, freezer: 180 },
  'lettuce': { category: 'produce', names: ['lettuce', 'romaine', 'iceberg', 'spinach', 'greens', 'salad mix', 'spring mix'], pantry: 1, fridge: 7, freezer: 90 },
  'tomato': { category: 'produce', names: ['tomato', 'tomatoes', 'roma tomato', 'cherry tomato', 'grape tomato'], pantry: 5, fridge: 10, freezer: 180 },
  'potato': { category: 'produce', names: ['potato', 'potatoes', 'russet', 'yukon gold', 'red potato'], pantry: 30, fridge: 60, freezer: 365 },
  'onion': { category: 'produce', names: ['onion', 'onions', 'yellow onion', 'red onion', 'white onion', 'shallot'], pantry: 30, fridge: 60, freezer: 180 },
  'garlic': { category: 'produce', names: ['garlic', 'garlic cloves'], pantry: 90, fridge: 120, freezer: 365 },
  'carrot': { category: 'produce', names: ['carrot', 'carrots', 'baby carrot'], pantry: 7, fridge: 21, freezer: 365 },
  'broccoli': { category: 'produce', names: ['broccoli', 'brocolli', 'broccolini'], pantry: 1, fridge: 7, freezer: 365 },
  'bell pepper': { category: 'produce', names: ['pepper', 'peppers', 'bell pepper', 'red pepper', 'green pepper', 'yellow pepper'], pantry: 3, fridge: 7, freezer: 365 },
  'cucumber': { category: 'produce', names: ['cucumber', 'cucumbers'], pantry: 3, fridge: 7, freezer: 90 },
  'avocado': { category: 'produce', names: ['avocado', 'avocados', 'avocadoes'], pantry: 4, fridge: 7, freezer: 180 },
  'lemon': { category: 'produce', names: ['lemon', 'lemons', 'lime', 'limes'], pantry: 14, fridge: 30, freezer: 180 },
  'grape': { category: 'produce', names: ['grape', 'grapes', 'red grape', 'green grape'], pantry: 3, fridge: 7, freezer: 180 },
  'milk': { category: 'dairy', names: ['milk', 'whole milk', 'skim milk', '2% milk', '1% milk', 'organic milk', 'lactose free milk'], pantry: 0, fridge: 7, freezer: 90 },
  'cheese': { category: 'dairy', names: ['cheese', 'cheddar', 'mozzarella', 'swiss', 'provolone', 'gouda', 'colby', 'jack cheese', 'american cheese', 'sliced cheese', 'shredded cheese', 'cheese block'], pantry: 0, fridge: 21, freezer: 180 },
  'yogurt': { category: 'dairy', names: ['yogurt', 'yoghurt', 'greek yogurt', 'plain yogurt', 'vanilla yogurt', 'fruit yogurt'], pantry: 0, fridge: 14, freezer: 60 },
  'butter': { category: 'dairy', names: ['butter', 'unsalted butter', 'salted butter', 'margarine', 'spread'], pantry: 7, fridge: 90, freezer: 365 },
  'eggs': { category: 'dairy', names: ['egg', 'eggs', 'large egg', 'dozen egg', 'organic egg', 'free range egg'], pantry: 14, fridge: 35, freezer: 365 },
  'ice cream': { category: 'dairy', names: ['ice cream', 'gelato', 'frozen yogurt', 'sorbet'], pantry: 0, fridge: 0, freezer: 60 },
  'chicken': { category: 'meat', names: ['chicken', 'chicken breast', 'chicken thigh', 'whole chicken', 'rotisserie chicken', 'chicken wing', 'chicken tender', 'ground chicken'], pantry: 0, fridge: 2, freezer: 365 },
  'beef': { category: 'meat', names: ['beef', 'steak', 'ground beef', 'hamburger', 'beef roast', 'sirloin', 'ribeye', 'tenderloin', 'beef chuck'], pantry: 0, fridge: 3, freezer: 365 },
  'pork': { category: 'meat', names: ['pork', 'pork chop', 'pork loin', 'pork tenderloin', 'ground pork', 'bacon', 'sausage', 'ham', 'pork shoulder', 'ribs'], pantry: 0, fridge: 5, freezer: 180 },
  'fish': { category: 'meat', names: ['fish', 'salmon', 'tilapia', 'cod', 'tuna', 'halibut', 'trout', 'mahi mahi', 'snapper', 'sea bass', 'catfish'], pantry: 0, fridge: 2, freezer: 180 },
  'shrimp': { category: 'meat', names: ['shrimp', 'prawn', 'prawns', 'scallop', 'scallops', 'lobster', 'crab', 'crab meat'], pantry: 0, fridge: 2, freezer: 180 },
  'deli meat': { category: 'meat', names: ['deli meat', 'lunch meat', 'cold cuts', 'salami', 'pepperoni', 'prosciutto', 'ham slices', 'turkey slices', 'roast beef slices'], pantry: 0, fridge: 5, freezer: 60 },
  'bread': { category: 'pantry', names: ['bread', 'loaf', 'white bread', 'wheat bread', 'whole wheat bread', 'sourdough', 'rye bread', 'multigrain bread', 'baguette'], pantry: 5, fridge: 14, freezer: 90 },
  'pasta': { category: 'pantry', names: ['pasta', 'spaghetti', 'penne', 'fusilli', 'macaroni', 'fettuccine', 'linguine', 'rigatoni', 'farfalle', 'orzo', 'noodle', 'noodles', 'ramen', 'udon'], pantry: 730, fridge: 0, freezer: 0 },
  'rice': { category: 'pantry', names: ['rice', 'white rice', 'brown rice', 'jasmine rice', 'basmati rice', 'wild rice', 'arborio rice', 'sushi rice'], pantry: 730, fridge: 0, freezer: 0 },
  'flour': { category: 'pantry', names: ['flour', 'all purpose flour', 'bread flour', 'whole wheat flour', 'cake flour', 'pastry flour'], pantry: 240, fridge: 365, freezer: 730 },
  'sugar': { category: 'pantry', names: ['sugar', 'white sugar', 'brown sugar', 'powdered sugar', 'cane sugar', 'granulated sugar'], pantry: 730, fridge: 0, freezer: 0 },
  'oil': { category: 'pantry', names: ['oil', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'avocado oil', 'sesame oil', 'cooking oil'], pantry: 730, fridge: 0, freezer: 0 },
  'cereal': { category: 'pantry', names: ['cereal', 'granola', 'oatmeal', 'oats', 'muesli', 'corn flakes', 'cheerios', 'special k'], pantry: 180, fridge: 0, freezer: 0 },
  'crackers': { category: 'pantry', names: ['cracker', 'crackers', 'ritz', 'saltine', 'wheat thin', 'triscuit', 'goldfish', 'pretzel', 'pretzels'], pantry: 180, fridge: 0, freezer: 0 },
  'peanut butter': { category: 'pantry', names: ['peanut butter', 'almond butter', 'nut butter', 'sunflower butter', 'cashew butter'], pantry: 180, fridge: 365, freezer: 0 },
  'jam': { category: 'pantry', names: ['jam', 'jelly', 'preserves', 'marmalade', 'fruit spread'], pantry: 365, fridge: 730, freezer: 0 },
  'honey': { category: 'pantry', names: ['honey', 'maple syrup', 'agave', 'corn syrup'], pantry: 730, fridge: 0, freezer: 0 },
  'ketchup': { category: 'pantry', names: ['ketchup', 'catsup', 'tomato sauce', 'pasta sauce', 'marinara', 'pizza sauce'], pantry: 365, fridge: 730, freezer: 0 },
  'mustard': { category: 'pantry', names: ['mustard', 'dijon', 'yellow mustard', 'whole grain mustard'], pantry: 365, fridge: 730, freezer: 0 },
  'mayonnaise': { category: 'pantry', names: ['mayonnaise', 'mayo', 'miracle whip'], pantry: 60, fridge: 120, freezer: 0 },
  'canned beans': { category: 'pantry', names: ['canned beans', 'black beans', 'kidney beans', 'pinto beans', 'cannellini beans', 'garbanzo beans', 'chickpeas', 'baked beans'], pantry: 730, fridge: 5, freezer: 0 },
  'canned tomatoes': { category: 'pantry', names: ['canned tomatoes', 'diced tomatoes', 'crushed tomatoes', 'whole tomatoes', 'stewed tomatoes', 'tomato paste', 'tomato puree'], pantry: 730, fridge: 5, freezer: 0 },
  'tuna can': { category: 'pantry', names: ['tuna', 'canned tuna', 'salmon can', 'sardines', 'anchovies', 'canned fish'], pantry: 1460, fridge: 3, freezer: 0 },
  'soup': { category: 'pantry', names: ['soup', 'canned soup', 'broth', 'stock', 'chicken broth', 'beef broth', 'vegetable broth'], pantry: 730, fridge: 5, freezer: 90 },
  'cookies': { category: 'pantry', names: ['cookie', 'cookies', 'oreo', 'chocolate chip cookie', 'biscuit'], pantry: 21, fridge: 60, freezer: 180 },
  'nuts': { category: 'pantry', names: ['nuts', 'almond', 'almonds', 'walnut', 'walnuts', 'pecan', 'pecans', 'cashew', 'cashews', 'pistachio', 'pistachios', 'mixed nuts'], pantry: 180, fridge: 365, freezer: 730 },
  'chocolate': { category: 'pantry', names: ['chocolate', 'chocolate bar', 'dark chocolate', 'milk chocolate', 'cocoa', 'cocoa powder'], pantry: 180, fridge: 365, freezer: 730 },
  'frozen pizza': { category: 'frozen', names: ['frozen pizza', 'pizza', 'digiorno', 'tombstone', 'red baron'], pantry: 0, fridge: 0, freezer: 180 },
  'frozen vegetables': { category: 'frozen', names: ['frozen vegetable', 'frozen veg', 'frozen broccoli', 'frozen corn', 'frozen peas', 'frozen spinach', 'frozen mixed vegetables'], pantry: 0, fridge: 0, freezer: 365 },
  'frozen fruit': { category: 'frozen', names: ['frozen fruit', 'frozen berries', 'frozen mango', 'frozen strawberry'], pantry: 0, fridge: 0, freezer: 365 },
  'frozen dinner': { category: 'frozen', names: ['frozen dinner', 'tv dinner', 'frozen meal', 'lean cuisine', 'stouffers', 'marie callender'], pantry: 0, fridge: 0, freezer: 365 },
  'french fries': { category: 'frozen', names: ['french fries', 'frozen fries', 'tater tots', 'hash browns', 'potato wedges'], pantry: 0, fridge: 0, freezer: 365 },
  'juice': { category: 'beverages', names: ['juice', 'orange juice', 'apple juice', 'cranberry juice', 'grape juice', 'fruit juice'], pantry: 0, fridge: 7, freezer: 365 },
  'soda': { category: 'beverages', names: ['soda', 'coke', 'pepsi', 'sprite', 'soft drink', 'pop', 'cola', 'ginger ale', 'root beer'], pantry: 180, fridge: 0, freezer: 0 },
  'water': { category: 'beverages', names: ['water', 'bottled water', 'sparkling water', 'mineral water', 'seltzer'], pantry: 730, fridge: 0, freezer: 0 },
  'coffee': { category: 'beverages', names: ['coffee', 'ground coffee', 'coffee beans', 'instant coffee', 'k-cup', 'keurig'], pantry: 180, fridge: 0, freezer: 0 },
  'tea': { category: 'beverages', names: ['tea', 'green tea', 'black tea', 'herbal tea', 'tea bags', 'loose tea'], pantry: 730, fridge: 0, freezer: 0 },
  'wine': { category: 'beverages', names: ['wine', 'red wine', 'white wine', 'rose', 'chardonnay', 'cabernet', 'merlot'], pantry: 0, fridge: 14, freezer: 0 },
  'beer': { category: 'beverages', names: ['beer', 'lager', 'ale', 'ipa', 'stout', 'pilsner'], pantry: 180, fridge: 0, freezer: 0 },
  'toilet paper': { category: 'household', names: ['toilet paper', 'tp', 'bathroom tissue'], pantry: 0, fridge: 0, freezer: 0 },
  'paper towel': { category: 'household', names: ['paper towel', 'paper towels', 'napkins', 'tissues'], pantry: 0, fridge: 0, freezer: 0 },
  'laundry detergent': { category: 'household', names: ['laundry detergent', 'detergent', 'fabric softener', 'bleach', 'stain remover'], pantry: 0, fridge: 0, freezer: 0 },
};

export function findShelfLifeData(itemName) {
  if (!itemName) return null;
  const normalizedName = itemName.toLowerCase().trim();
  for (const [key, data] of Object.entries(SHELF_LIFE_DATABASE)) {
    if (data.names.some(name => normalizedName.includes(name))) {
      return { key, ...data };
    }
  }
  return null;
}

export function getDefaultShelfLife(itemName, storageLocation = 'fridge') {
  const data = findShelfLifeData(itemName);
  if (!data) return 7;
  switch (storageLocation) {
    case 'pantry': return data.pantry || 7;
    case 'fridge': return data.fridge || data.pantry || 7;
    case 'freezer': return data.freezer || data.fridge || data.pantry || 7;
    default: return data.fridge || 7;
  }
}

export function getCategoryFromName(itemName) {
  const data = findShelfLifeData(itemName);
  return data?.category || 'other';
}
