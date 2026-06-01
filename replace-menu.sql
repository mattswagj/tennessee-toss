-- =====================================================================
-- Tennessee Toss — Replace seeded menu with Jordi's REAL menu
-- Run ONCE in the Supabase SQL Editor (paste all, click Run).
--
-- What this does:
--   1. Wipes ALL existing menu_items + menu_categories (inside a txn).
--   2. Inserts 4 categories: Base, Toppings, Protein, Dressing.
--   3. Inserts every item with bilingual EN/ES name + description.
--   4. price = 0.00 everywhere  -- TODO: Jordi to provide prices
--   5. is_available = true for all EXCEPT "Fried chicken breast"
--      (is_available = false, coming_soon = true).
--
-- Schema matched from src/lib/supabase.ts:
--   menu_categories(id, name_en, name_es, slug, display_order, is_active)
--   menu_items(id, category_id, name_en, name_es, description_en,
--              description_es, price, image_url, calories,
--              is_available, is_featured, display_order)
--   image_url / calories left NULL.
-- =====================================================================

BEGIN;

-- ── 0. Ensure the `coming_soon` flag column exists ───────────────────
-- Safe / idempotent: only adds the column if it isn't already there.
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 1. Wipe existing menu data ───────────────────────────────────────
-- Delete items first (they FK to categories), then categories.
DELETE FROM menu_items;
DELETE FROM menu_categories;

-- ── 2. Insert categories (exact order: Base, Toppings, Protein, Dressing)
INSERT INTO menu_categories (name_en, name_es, slug, display_order, is_active) VALUES
  ('Base',     'Base',     'base',     1, TRUE),
  ('Toppings', 'Toppings', 'toppings', 2, TRUE),
  ('Protein',  'Proteína', 'protein',  3, TRUE),
  ('Dressing', 'Aderezo',  'dressing', 4, TRUE);

-- ── 3. Insert items ──────────────────────────────────────────────────
-- price = 0.00 for every row.  -- TODO: Jordi to provide prices

-- BASE (pick one) ----------------------------------------------------
INSERT INTO menu_items
  (category_id, name_en, name_es, description_en, description_es,
   price, image_url, calories, is_available, is_featured, coming_soon, display_order)
VALUES
  ((SELECT id FROM menu_categories WHERE slug='base'),
   'Romaine', 'Lechuga Romana',
   'Crisp, crunchy romaine leaves — the classic salad foundation.',
   'Hojas crujientes de lechuga romana, la base clásica para tu ensalada.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 1),

  ((SELECT id FROM menu_categories WHERE slug='base'),
   'Iceberg', 'Lechuga Iceberg',
   'Cool and refreshing iceberg lettuce with a satisfying crunch.',
   'Lechuga iceberg fresca y refrescante con un crujido delicioso.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 2),

  ((SELECT id FROM menu_categories WHERE slug='base'),
   'Spinach', 'Espinacas',
   'Tender baby spinach packed with fresh, green goodness.',
   'Espinacas tiernas llenas de frescura y nutrientes.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 3);

-- TOPPINGS (pick as many as you like) --------------------------------
INSERT INTO menu_items
  (category_id, name_en, name_es, description_en, description_es,
   price, image_url, calories, is_available, is_featured, coming_soon, display_order)
VALUES
  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Tomatoes', 'Tomates',
   'Juicy, ripe tomatoes for a burst of fresh flavor.',
   'Tomates jugosos y maduros para un toque de frescura.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 1),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Red onions', 'Cebolla morada',
   'Thin slices of red onion with a sharp, sweet bite.',
   'Rodajas finas de cebolla morada con un sabor intenso y dulce.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 2),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Cucumber', 'Pepino',
   'Cool, crisp cucumber slices for extra crunch.',
   'Rodajas de pepino fresco para un crujido extra.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 3),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Carrots', 'Zanahorias',
   'Sweet shredded carrots packed with color and crunch.',
   'Zanahorias ralladas, dulces y llenas de color.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 4),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Corn', 'Elote',
   'Sweet golden corn kernels for a pop of flavor.',
   'Granos de elote dulce para un toque de sabor.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 5),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Black olives', 'Aceitunas negras',
   'Savory black olives with a rich, briny taste.',
   'Aceitunas negras sabrosas con un toque salado.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 6),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Potato sticks', 'Papitas',
   'Crunchy potato sticks for a fun, salty crunch.',
   'Papitas crujientes para un toque salado y divertido.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 7),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Croutons', 'Crutones',
   'Golden, toasty croutons for the perfect crunch.',
   'Crutones dorados y tostados para el crujido perfecto.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 8),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Homemade bacon bits', 'Tocino casero',
   'Smoky homemade bacon bits made fresh in-house.',
   'Trozos de tocino casero, ahumado y preparado al momento.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 9),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Avocado slices', 'Aguacate',
   'Creamy avocado slices full of fresh flavor.',
   'Rodajas de aguacate cremoso, llenas de sabor.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 10),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Feta cheese', 'Queso feta',
   'Tangy, crumbly feta cheese for a Mediterranean touch.',
   'Queso feta suave y desmenuzado con un toque mediterráneo.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 11),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Colby Jack', 'Queso Colby Jack',
   'Mild, creamy Colby Jack cheese shredded fresh.',
   'Queso Colby Jack suave y cremoso, recién rallado.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 12),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Cheddar', 'Queso cheddar',
   'Sharp, melty cheddar cheese for a bold bite.',
   'Queso cheddar intenso para un sabor más fuerte.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 13),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Cottage cheese', 'Requesón',
   'Light, creamy cottage cheese packed with protein.',
   'Requesón ligero y cremoso, rico en proteína.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 14),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Hummus', 'Hummus',
   'Smooth, savory hummus made from chickpeas.',
   'Hummus suave y sabroso, hecho de garbanzos.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 15),

  ((SELECT id FROM menu_categories WHERE slug='toppings'),
   'Hard boiled eggs', 'Huevo cocido',
   'Protein-rich hard boiled eggs, sliced fresh.',
   'Huevo cocido rico en proteína, en rodajas frescas.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 16);

-- PROTEIN (pick one) -------------------------------------------------
INSERT INTO menu_items
  (category_id, name_en, name_es, description_en, description_es,
   price, image_url, calories, is_available, is_featured, coming_soon, display_order)
VALUES
  ((SELECT id FROM menu_categories WHERE slug='protein'),
   'Grilled chicken breast', 'Pollo a la parrilla',
   'Juicy grilled chicken breast, seasoned and tender.',
   'Pechuga de pollo a la parrilla, jugosa y sazonada.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 1),

  ((SELECT id FROM menu_categories WHERE slug='protein'),
   'Ham', 'Jamón',
   'Savory sliced ham for a hearty, satisfying bite.',
   'Jamón en rebanadas, sabroso y abundante.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 2),

  ((SELECT id FROM menu_categories WHERE slug='protein'),
   'Turkey', 'Pavo',
   'Lean, tender turkey breast sliced fresh.',
   'Pechuga de pavo magra y tierna, en rebanadas frescas.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 3),

  -- Coming soon: NOT yet available.
  ((SELECT id FROM menu_categories WHERE slug='protein'),
   'Fried chicken breast', 'Pollo frito',
   'Crispy fried chicken breast — coming soon to your bowl!',
   'Pechuga de pollo frito y crujiente — ¡próximamente disponible!',
   0.00, NULL, NULL, FALSE, FALSE, TRUE, 4);

-- DRESSING (pick one) ------------------------------------------------
INSERT INTO menu_items
  (category_id, name_en, name_es, description_en, description_es,
   price, image_url, calories, is_available, is_featured, coming_soon, display_order)
VALUES
  ((SELECT id FROM menu_categories WHERE slug='dressing'),
   'Homemade ranch', 'Aderezo ranch casero',
   'Creamy homemade ranch made fresh in our kitchen.',
   'Aderezo ranch casero y cremoso, preparado en nuestra cocina.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 1),

  ((SELECT id FROM menu_categories WHERE slug='dressing'),
   'Homemade honey mustard', 'Mostaza con miel casera',
   'Sweet and tangy homemade honey mustard.',
   'Mostaza con miel casera, dulce y con un toque ácido.',
   0.00, NULL, NULL, TRUE, FALSE, FALSE, 2);

-- ── 4. Re-enable Row Level Security (in case it was disabled) ────────
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ── Sanity check (optional — run after COMMIT) ──────────────────────
-- SELECT c.name_en AS category, i.name_en, i.is_available, i.coming_soon
-- FROM menu_items i JOIN menu_categories c ON c.id = i.category_id
-- ORDER BY c.display_order, i.display_order;
