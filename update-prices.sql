-- =====================================================================
-- Tennessee Toss — PLACEHOLDER menu prices
-- Run ONCE in the Supabase SQL Editor (paste all, click Run).
--
-- ⚠️  PLACEHOLDER / TEMPORARY PRICES — NOT FINAL  ⚠️
--   Every number below is a market-research-based ESTIMATE chosen so the
--   app has something realistic to display. They are NOT Jordi's real
--   prices. Replace them all once the owner confirms actual pricing,
--   then delete the "placeholder" notes in the UI (see notes at bottom).
--
-- PRICING MODEL — flat-rate "build-your-own salad":
--   • One base price covers greens + UNLIMITED toppings + ONE dressing.
--   • Proteins are paid add-ons.
--   • Avocado is the only premium (paid) topping.
--
-- PLACEHOLDER NUMBERS USED:
--   BASE (all 3)................. $9.50   (salad starting price)
--   TOPPINGS (free, included).... $0.00   (15 of 16 toppings)
--   Avocado slices (premium)..... $1.50
--   PROTEIN  Grilled chicken..... $3.50
--   PROTEIN  Ham................. $2.50
--   PROTEIN  Turkey.............. $2.50
--   PROTEIN  Fried chicken....... $4.00   (stays unavailable / coming soon)
--   DRESSING (both, 1st free).... $0.00
--
-- Rows are matched by name_en (NOT hardcoded UUIDs — those differ per
-- install). Safe to re-run: it only sets prices, nothing destructive.
-- Schema ref: src/lib/supabase.ts → menu_items(name_en, price, ...)
-- =====================================================================

BEGIN;

-- ── BASE: pick-any-base starting price ($9.50) ───────────────────────
UPDATE menu_items SET price = 9.50 WHERE name_en = 'Romaine';
UPDATE menu_items SET price = 9.50 WHERE name_en = 'Iceberg';
UPDATE menu_items SET price = 9.50 WHERE name_en = 'Spinach';

-- ── TOPPINGS: free / included with the base ($0.00) ──────────────────
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Tomatoes';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Red onions';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Cucumber';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Carrots';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Corn';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Black olives';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Potato sticks';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Croutons';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Homemade bacon bits';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Feta cheese';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Colby Jack';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Cheddar';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Cottage cheese';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Hummus';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Hard boiled eggs';

-- ── TOPPINGS: premium add-on ─────────────────────────────────────────
UPDATE menu_items SET price = 1.50 WHERE name_en = 'Avocado slices';

-- ── PROTEIN: paid add-ons ────────────────────────────────────────────
UPDATE menu_items SET price = 3.50 WHERE name_en = 'Grilled chicken breast';
UPDATE menu_items SET price = 2.50 WHERE name_en = 'Ham';
UPDATE menu_items SET price = 2.50 WHERE name_en = 'Turkey';
-- Fried chicken stays unavailable / coming soon — price set for when it launches.
UPDATE menu_items
  SET price = 4.00, is_available = FALSE, coming_soon = TRUE
  WHERE name_en = 'Fried chicken breast';

-- ── DRESSING: first dressing included free ($0.00) ───────────────────
-- DB names are "Homemade ranch" / "Homemade honey mustard" (Ranch + Honey Mustard).
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Homemade ranch';
UPDATE menu_items SET price = 0.00 WHERE name_en = 'Homemade honey mustard';

COMMIT;

-- ── Sanity check (optional — run after COMMIT) ───────────────────────
-- SELECT c.name_en AS category, i.name_en, i.price, i.is_available, i.coming_soon
-- FROM menu_items i JOIN menu_categories c ON c.id = i.category_id
-- ORDER BY c.display_order, i.display_order;
--
-- ── WHEN JORDI CONFIRMS REAL PRICES ──────────────────────────────────
-- 1. Update the numbers above (or write a fresh UPDATE) and re-run.
-- 2. Remove the "estimated price" disclaimers in the UI:
--      messages/en.json + messages/es.json  → keys: menu.priceNote,
--        builder.priceNote, cart.priceNote, menu.priceEstimated
--      src/app/menu/page.tsx, src/app/build/page.tsx, src/app/cart/page.tsx
--        → <PriceDisclaimer /> banners + the "*" markers on prices.
