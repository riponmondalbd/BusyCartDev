export const dealOfDaySchema = {
  body: {
    productId: { required: true },
    endsAt: { required: true },
  },
};
