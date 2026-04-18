/**
 * Background halaman Login & Register.
 *
 * Prioritas:
 * 1. REACT_APP_LOGIN_BG_IMAGE di .env (path publik mis. /images/bg.jpg atau URL https://…)
 * 2. File aset di src (bundel webpack) — ganti file atau impor di bawah
 *
 * Untuk memakai JPG/PNG sendiri: letakkan mis. `images.jpg` di folder ini lalu ubah impor:
 *   import authBackgroundAsset from '../../assets/images/images.jpg';
 */
import authBackgroundAsset from '../../assets/images/auth-background.svg';

export function getAuthBackgroundImageUrl() {
  const env = (process.env.REACT_APP_LOGIN_BG_IMAGE || '').trim();
  if (env) return env;
  return authBackgroundAsset;
}
