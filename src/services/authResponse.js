/**
 * Normalisasi respons login/register dari backend (Laravel / Passport / Sanctum).
 * Mendukung: { token, user }, { access_token, user }, { data: { token, user } }, dll.
 */
export function parseLoginResponse(raw) {
  const body = raw && typeof raw === 'object' ? raw : {};
  const nested = body.data != null && typeof body.data === 'object' ? body.data : null;

  const token =
    body.token ??
    body.access_token ??
    nested?.token ??
    nested?.access_token;

  let user = body.user ?? nested?.user;

  if (!user && nested) {
    const { token: _t, access_token: _a, user: nestedUser, message: _m, ...rest } =
      nested;
    if (nestedUser && typeof nestedUser === 'object') user = nestedUser;
    else if (rest.id != null || rest.email != null || rest.nama != null) user = rest;
  }

  if (!user || typeof user !== 'object') user = {};

  return { token, user, raw: body };
}

/** Pesan error dari throw authService (objek Laravel / string) */
export function formatServiceError(err) {
  if (err == null) return 'Terjadi kesalahan.';
  const data = err.response?.data;
  if (data != null) {
    if (typeof data === 'string') return data;
    if (typeof data.message === 'string') return data.message;
    if (data.errors && typeof data.errors === 'object') {
      const key = Object.keys(data.errors)[0];
      if (key) {
        const v = data.errors[key];
        return Array.isArray(v) ? v[0] : String(v);
      }
    }
  }
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string') return err.message;
  const errs = err.errors;
  if (errs && typeof errs === 'object') {
    const key = Object.keys(errs)[0];
    if (key) {
      const v = errs[key];
      return Array.isArray(v) ? v[0] : String(v);
    }
  }
  return 'Permintaan gagal.';
}
