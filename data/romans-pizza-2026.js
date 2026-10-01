// Roman's Pizza South Africa current menu integration notes.
// Official source: https://romanspizza.co.za/menus
// Roman's requires selecting a store before the menu/order flow is loaded, so branch-specific
// product names and prices must be fetched after selecting the BG retailer branch.
export const romansPizzaCatalogue2026 = {
  source: 'https://romanspizza.co.za/menus',
  requiresStoreSelection: true,
  currentVerifiedPromotion: {name:'Any 2 Large SAVA FLAVA Pizzas',price:179.80},
  branches: ['romans-pizza-denlyn','romans-pizza-tshwane-regional-mall']
};
