export const normalizeProduct = product => ({
  ...product,

  // DELIBO-style fields for existing ProductSection
  name: product.title,
  brand: product.brand || '',
  image: {
    url: product.thumbnail,
  },
  price: {
    min: product.price,
    max: product.price,
    currency: 'USD',
  },
  rating: {
    value: product.rating,
    count: product.reviews?.length || 0,
  },
  category: {
    id: product.category,
    name: product.category,
  },
  variants: [
    {
      id: String(product.id),
      name: product.title,
      price: product.price,
      compareAtPrice: product.discountPercentage
        ? Math.round(
            product.price /
              (1 - product.discountPercentage / 100),
          )
        : product.price,
      available: product.stock > 0,
      unitValue: 1,
      unit: {
        value: 'pc',
        label: 'Piece',
      },
    },
  ],
  available: product.stock > 0,
});