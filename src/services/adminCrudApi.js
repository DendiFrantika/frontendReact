import axiosInstance from '../api/axios';

export async function requestWithFallback(configs) {
  let lastError = null;
  for (const config of configs) {
    try {
      return await axiosInstance.request(config);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export function unpackCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function normalizeFieldErrors(error) {
  const raw = error?.response?.data?.errors || {};
  const out = {};
  Object.keys(raw).forEach((key) => {
    const v = raw[key];
    if (Array.isArray(v)) out[key] = v;
    else if (typeof v === 'string') out[key] = [v];
    else if (v != null) out[key] = [String(v)];
  });
  return out;
}

export function normalizeErrorMessage(error, fallback = 'Terjadi kesalahan.') {
  return error?.response?.data?.message || fallback;
}
