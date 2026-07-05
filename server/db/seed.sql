INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Alimentación', 'alimentacion', 'Restaurantes, sodas, repostería, productos locales y catering.', 'Utensils', '#f05d23'),
  ('Eco-Verde', 'eco-verde', 'Productos orgánicos, reciclaje, viveros y soluciones sostenibles.', 'Leaf', '#1b998b'),
  ('Servicios', 'servicios', 'Soluciones profesionales, mantenimiento, logística y consultoría.', 'BriefcaseBusiness', '#33658a'),
  ('Salud y Belleza', 'salud-belleza', 'Bienestar, farmacias, terapias, estética y cuidado personal.', 'Sparkles', '#d81e5b'),
  ('Turismo', 'turismo', 'Hospedaje, transporte, artesanías y experiencias nacionales.', 'MapPinned', '#f6ae2d'),
  ('Tecnología', 'tecnologia', 'Soporte técnico, desarrollo web, equipos y soluciones digitales.', 'Cpu', '#4b4e6d')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

INSERT INTO businesses (name, slug, owner_email, category_id, description, province, canton, address, phone, email, website, image_url, status, is_open, rating, review_count, plan, featured) VALUES
  ('Sabores Ancestrales Samocha', 'sabores-ancestrales-samocha', 'duena@samocha.cr', (SELECT id FROM categories WHERE slug = 'alimentacion'), 'Emprendimiento costarricense dedicado a alimentos artesanales con recetas tradicionales y productos locales.', 'Alajuela', 'Alajuela', 'Plaza Ferias, Alajuela', '+506 8888-1001', 'hola@samocha.cr', 'https://samocha.example', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80', 'active', true, 4.8, 24, 'premium', true),
  ('TecnoFibras TFCR', 'tecnofibras-tfcr', 'admin@tecnofibras.cr', (SELECT id FROM categories WHERE slug = 'servicios'), 'Empresa familiar de productos de fibra y soluciones a la medida para hogares, comercios e industria.', 'San José', 'Desamparados', 'Servicio a todo Costa Rica', '+506 8888-1002', 'ventas@tecnofibras.cr', 'https://tecnofibras.example', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'active', true, 4.9, 18, 'growth', true),
  ('Uros Ancestral Care', 'uros-ancestral-care', 'info@uroscare.cr', (SELECT id FROM categories WHERE slug = 'salud-belleza'), 'Cosmética natural artesanal con ingredientes botánicos y procesos responsables.', 'San José', 'Santa Ana', 'Santa Ana centro', '+506 8888-1003', 'info@uroscare.cr', '', 'https://images.unsplash.com/photo-1556228724-4d9514a47375?auto=format&fit=crop&w=900&q=80', 'active', false, 4.7, 31, 'premium', true),
  ('Connected CR', 'connected-cr', 'soporte@connected.cr', (SELECT id FROM categories WHERE slug = 'tecnologia'), 'Servicios técnicos, reparación, mantenimiento e instalación para hogares y pequeñas empresas.', 'Heredia', 'San Rafael', 'San Rafael de Heredia', '+506 8888-1004', 'soporte@connected.cr', 'https://connected.example', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 'active', true, 4.5, 12, 'growth', false),
  ('Clean Recycle Export', 'clean-recycle-export', 'contacto@cleanrecycle.cr', (SELECT id FROM categories WHERE slug = 'eco-verde'), 'Gestión responsable de reciclaje, chatarra y materiales recuperables para negocios.', 'Alajuela', 'El Coyol', 'Zona industrial El Coyol', '+506 8888-1005', 'contacto@cleanrecycle.cr', '', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80', 'active', false, 4.3, 9, 'starter', false),
  ('Ruta Viva Tours', 'ruta-viva-tours', 'reservas@rutaviva.cr', (SELECT id FROM categories WHERE slug = 'turismo'), 'Tours nacionales diseñados con proveedores locales, guías certificados y experiencias auténticas.', 'Guanacaste', 'Liberia', 'Liberia centro', '+506 8888-1006', 'reservas@rutaviva.cr', 'https://rutaviva.example', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', 'pending', true, 0, 0, 'starter', false)
ON CONFLICT (slug) DO UPDATE SET
  owner_email = EXCLUDED.owner_email,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  province = EXCLUDED.province,
  canton = EXCLUDED.canton,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  is_open = EXCLUDED.is_open,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  plan = EXCLUDED.plan,
  featured = EXCLUDED.featured,
  updated_at = now();

UPDATE businesses SET
  story = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN 'Samocha nace para rescatar recetas familiares y convertir ingredientes locales en experiencias memorables. Trabajamos con proveedores nacionales y producción por encargo para mantener frescura y calidad.'
    WHEN 'tecnofibras-tfcr' THEN 'TecnoFibras combina oficio familiar y soluciones técnicas a la medida para hogares, comercios e industria ligera.'
    ELSE story
  END,
  services = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN '["Catering artesanal", "Repostería tradicional", "Pedidos corporativos", "Degustaciones por temporada"]'::jsonb
    WHEN 'connected-cr' THEN '["Diagnóstico técnico", "Instalaciones", "Soporte a domicilio", "Mantenimiento preventivo"]'::jsonb
    ELSE services
  END,
  gallery_urls = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=85"]'::jsonb
    ELSE gallery_urls
  END,
  schedule = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN 'Lunes a sábado, 8:00 a.m. - 6:00 p.m. Pedidos especiales con 48 horas de anticipación.'
    ELSE schedule
  END,
  coverage_area = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN 'Alajuela, Heredia y entregas coordinadas en GAM.'
    ELSE coverage_area
  END,
  social_links = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN '{"instagram":"https://instagram.com/samocha","facebook":"https://facebook.com/samocha","whatsapp":"https://wa.me/50688881001"}'::jsonb
    ELSE social_links
  END,
  verification_notes = CASE slug
    WHEN 'sabores-ancestrales-samocha' THEN 'Ficha verificada con referencias, evidencia de operación y autorización de publicación.'
    ELSE verification_notes
  END;

INSERT INTO subscriptions (business_id, plan, status, billing_cycle, amount_cents, currency, next_payment_at, last_payment_at, payment_method)
SELECT
  id,
  plan,
  CASE WHEN status = 'active' THEN 'active' ELSE 'trialing' END,
  'monthly',
  CASE plan WHEN 'premium' THEN 4500000 WHEN 'growth' THEN 2500000 ELSE 0 END,
  'CRC',
  CURRENT_DATE + INTERVAL '30 days',
  CASE WHEN plan = 'starter' THEN NULL ELSE CURRENT_DATE - INTERVAL '2 days' END,
  CASE WHEN plan = 'starter' THEN '' ELSE 'Tarjeta terminada en 4242' END
FROM businesses
ON CONFLICT (business_id) DO UPDATE SET
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  amount_cents = EXCLUDED.amount_cents,
  next_payment_at = EXCLUDED.next_payment_at,
  payment_method = EXCLUDED.payment_method,
  updated_at = now();

INSERT INTO payments (subscription_id, business_id, amount_cents, currency, status, due_at, paid_at, reference, notes)
SELECT s.id, s.business_id, s.amount_cents, s.currency, 'paid', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', 'seed-' || s.business_id, 'Pago inicial de demostración'
FROM subscriptions s
WHERE s.amount_cents > 0
ON CONFLICT DO NOTHING;

INSERT INTO coupons (business_id, title, code, discount, expires_at, active) VALUES
  ((SELECT id FROM businesses WHERE slug = 'sabores-ancestrales-samocha'), 'Combo artesanal de bienvenida', 'SABORES10', '10% de descuento', CURRENT_DATE + INTERVAL '45 days', true),
  ((SELECT id FROM businesses WHERE slug = 'connected-cr'), 'Diagnóstico técnico inicial', 'CONECTA15', '15% en diagnóstico', CURRENT_DATE + INTERVAL '30 days', true),
  ((SELECT id FROM businesses WHERE slug = 'ruta-viva-tours'), 'Reserva anticipada nacional', 'RUTAVIVA', 'Precio especial para grupos', CURRENT_DATE + INTERVAL '60 days', true)
ON CONFLICT DO NOTHING;

INSERT INTO users (email, name, role, password_hash, business_id, active) VALUES
  ('admin@pymesverificadas.cr', 'Administrador Pymes', 'admin', 'pbkdf2$120000$000a73e9940dbba8337f8de44c7692f4$653aff6c7d4cb8d31cfeffeb309208c219a6077426aca8ee93eaaf877ba6863d', NULL, true),
  ('duena@samocha.cr', 'Dueña Samocha', 'client', 'pbkdf2$120000$50c567cc6752f9b2a1838560fa3b4181$017eab17c2f9c86732e4ebd85eaf024192e86f813e74f95be5d9b95b653639ca', (SELECT id FROM businesses WHERE slug = 'sabores-ancestrales-samocha'), true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  business_id = EXCLUDED.business_id,
  active = EXCLUDED.active,
  updated_at = now();
