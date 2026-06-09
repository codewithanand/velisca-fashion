import { useState, useCallback } from 'react';

const defaultMessages = {
  required: 'This field is required',
  minLength: 'Must be at least {min} characters',
  maxLength: 'Must be at most {max} characters',
  min: 'Must be at least {min}',
  max: 'Must be at most {max}',
  email: 'Invalid email address',
  url: 'Invalid URL',
  hex: 'Invalid hex color code',
  slug: 'Invalid slug format',
  numeric: 'Must be a number',
  integer: 'Must be a whole number',
  pattern: 'Invalid format',
  match: 'Fields do not match',
};

function isPresent(value) {
  return value !== undefined && value !== null && value !== '';
}

export default function useFormValidation(rules) {
  const [errors, setErrors] = useState({});

  const validate = useCallback((data) => {
    const newErrors = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      for (const rule of fieldRules) {
        if (rule.required && !isPresent(value)) {
          newErrors[field] = rule.message || defaultMessages.required;
          break;
        }
        if (isPresent(value)) {
          if (rule.minLength && String(value).length < rule.minLength) {
            newErrors[field] = (rule.message || defaultMessages.minLength).replace('{min}', rule.minLength);
            break;
          }
          if (rule.maxLength && String(value).length > rule.maxLength) {
            newErrors[field] = (rule.message || defaultMessages.maxLength).replace('{max}', rule.maxLength);
            break;
          }
          if (rule.min !== undefined && Number(value) < rule.min) {
            newErrors[field] = (rule.message || defaultMessages.min).replace('{min}', rule.min);
            break;
          }
          if (rule.max !== undefined && Number(value) > rule.max) {
            newErrors[field] = (rule.message || defaultMessages.max).replace('{max}', rule.max);
            break;
          }
          if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field] = rule.message || defaultMessages.email;
            break;
          }
          if (rule.url && !/^https?:\/\/.+/.test(value)) {
            newErrors[field] = rule.message || defaultMessages.url;
            break;
          }
          if (rule.hex && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
            newErrors[field] = rule.message || defaultMessages.hex;
            break;
          }
          if (rule.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
            newErrors[field] = rule.message || defaultMessages.slug;
            break;
          }
          if (rule.numeric && isNaN(Number(value))) {
            newErrors[field] = rule.message || defaultMessages.numeric;
            break;
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            newErrors[field] = rule.message || defaultMessages.pattern;
            break;
          }
          if (rule.match && value !== data[rule.match]) {
            newErrors[field] = rule.message || defaultMessages.match;
            break;
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const clearErrors = useCallback(() => setErrors({}), []);
  const clearField = useCallback((field) => setErrors((prev) => ({ ...prev, [field]: undefined })), []);

  return { errors, validate, clearErrors, clearField, setErrors };
}
