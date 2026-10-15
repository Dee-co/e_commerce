// utils/normalizeProduct.js

export const normalizeProduct = (product = {}) => {
  const price = Number(product.price ?? 0);
  const discountPercentage = Number(product.discountPercentage ?? 0);
  const stock = Number(product.stock ?? 0);
  const available = stock > 0;

  return {
    ...product,

    // ProductSection ke format ke fields
    name: product.title ?? '',
    brand: product.brand ?? '',
    image: {
      url: product.thumbnail ?? product.images?.[0] ?? null,
    },
    price: {
      min: price,
      max: price,
      currency: 'USD',
    },
    rating: {
      value: Number(product.rating ?? 0),
      count: product.reviews?.length ?? 0,
    },
    category: {
      id: product.category,
      name: product.category,
    },
    variants: [
      {
        id: String(product.id),
        name: product.title ?? '',
        price,
        compareAtPrice:
          discountPercentage > 0 && discountPercentage < 100
            ? Math.round(price / (1 - discountPercentage / 100))
            : price,
        available,
        unitValue: 1,
        unit: {
          value: 'pc',
          label: 'Piece',
        },
      },
    ],
    available,
  };
};

export default normalizeProduct;