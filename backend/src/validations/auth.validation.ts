export const registerSchema = {
  body: {
    name: { required: false, minLength: 2 },
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 6 },
  },
};

export const loginSchema = {
  body: {
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 1 },
  },
};
