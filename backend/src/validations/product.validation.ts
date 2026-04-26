export const createProductSchema = {
  body: {
    name: { required: true, minLength: 1 },
    price: { required: true, transform: 'number' },
    stock: { required: true, transform: 'number' },
    categoryId: { required: true },
  },
};

export const updateProductSchema = {
  body: {
    name: { required: false, minLength: 1 },
    price: { required: false, transform: 'number' },
    stock: { required: false, transform: 'number' },
    categoryId: { required: false },
  },
};
