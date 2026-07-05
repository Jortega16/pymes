export function slugify(value) {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toBusiness(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerEmail: row.owner_email,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    categoryColor: row.category_color,
    description: row.description,
    province: row.province,
    canton: row.canton,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    imageUrl: row.image_url,
    galleryUrls: row.gallery_urls || [],
    story: row.story,
    services: row.services || [],
    schedule: row.schedule,
    coverageArea: row.coverage_area,
    socialLinks: row.social_links || {},
    verificationNotes: row.verification_notes,
    status: row.status,
    isOpen: row.is_open,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    plan: row.plan,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    color: row.color,
  };
}
