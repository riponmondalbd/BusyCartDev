// Form validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // At least 8 chars, 1 uppercase, 1 lowercase, 1 number

export const validators = {
  email: (value: string): string | null => {
    if (!value) return "Email is required";
    if (!emailRegex.test(value)) return "Invalid email address";
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter";
    if (!/\d/.test(value)) return "Password must contain a number";
    return null;
  },

  confirmPassword: (value: string, password: string): string | null => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return null;
  },

  name: (value: string): string | null => {
    if (!value) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 100)
      return "Name must be less than 100 characters";
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return "Phone number is required";
    if (!/^\d{10,}$/.test(value.replace(/\D/g, "")))
      return "Phone number must be at least 10 digits";
    return null;
  },

  number: (
    value: string | number,
    min?: number,
    max?: number,
  ): string | null => {
    if (value === "") return "This field is required";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "Must be a number";
    if (min !== undefined && num < min) return `Must be at least ${min}`;
    if (max !== undefined && num > max) return `Must be no more than ${max}`;
    return null;
  },

  required: (value: string): string | null => {
    if (!value || value.trim() === "") return "This field is required";
    return null;
  },
};

export const validateForm = (
  data: Record<string, any>,
  schema: Record<string, (value: any) => string | null>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(data[field]);
    if (error) {
      errors.push({ field, message: error });
    }
  }

  return errors;
};
