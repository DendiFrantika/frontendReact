/**
 * Validasi klien selaras pola Laravel umum (required|email|max|in|date_format).
 * Pesan diseragamkan ke bentuk { field: [string] } seperti respons 422 Laravel.
 */

const asField = (msg) => [msg];

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

const phoneOk = (v) => {
  const s = String(v || '').trim();
  if (!s) return true;
  return /^[\d+\-\s()]{10,20}$/.test(s);
};

/** Jam HH:mm untuk input type="time" / date_format:H:i */
const timeOk = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || '').trim());

export function validateDokterForm(form, { editing }) {
  const e = {};
  const nama = String(form.nama || '').trim();
  if (!nama) e.nama = asField('Nama wajib diisi.');
  else if (nama.length > 255) e.nama = asField('Nama maksimal 255 karakter.');

  const sp = String(form.spesialisasi || '').trim();
  if (!sp) e.spesialisasi = asField('Spesialisasi wajib diisi.');
  else if (sp.length > 100) e.spesialisasi = asField('Spesialisasi terlalu panjang.');

  const tel = String(form.no_telepon || '').trim();
  if (!tel) e.no_telepon = asField('No. telepon wajib diisi.');
  else if (!phoneOk(tel)) e.no_telepon = asField('Format no. telepon tidak valid.');

  if (form.status === '' || form.status == null) {
    e.status = asField('Status wajib dipilih.');
  } else if (!['0', '1', 0, 1].includes(form.status)) {
    e.status = asField('Status tidak valid.');
  }

  if (!editing) {
    const ni = String(form.no_identitas || '').trim();
    if (!ni) e.no_identitas = asField('No. identitas wajib diisi.');
    else if (ni.length > 50) e.no_identitas = asField('No. identitas maksimal 50 karakter.');

    const nl = String(form.no_lisensi || '').trim();
    if (!nl) e.no_lisensi = asField('No. lisensi wajib diisi.');
    else if (nl.length > 50) e.no_lisensi = asField('No. lisensi maksimal 50 karakter.');

    const em = String(form.email || '').trim();
    if (!em) e.email = asField('Email wajib diisi.');
    else if (!emailOk(em)) e.email = asField('Format email tidak valid.');

    const al = String(form.alamat || '').trim();
    if (!al) e.alamat = asField('Alamat wajib diisi.');
    else if (al.length > 500) e.alamat = asField('Alamat maksimal 500 karakter.');

    const jm = String(form.jam_praktek_mulai || '').trim();
    const js = String(form.jam_praktek_selesai || '').trim();
    if (!jm) e.jam_praktek_mulai = asField('Jam mulai wajib diisi.');
    else if (!timeOk(jm)) e.jam_praktek_mulai = asField('Format jam mulai harus HH:mm.');
    if (!js) e.jam_praktek_selesai = asField('Jam selesai wajib diisi.');
    else if (!timeOk(js)) e.jam_praktek_selesai = asField('Format jam selesai harus HH:mm.');
    if (!e.jam_praktek_mulai && !e.jam_praktek_selesai && jm && js && jm >= js) {
      e.jam_praktek_selesai = asField('Jam selesai harus setelah jam mulai.');
    }

    if (form.hari_libur != null && String(form.hari_libur).length > 20) {
      e.hari_libur = asField('Hari libur tidak valid.');
    }
  }

  return e;
}

const JK_VALUES = ['L', 'P'];
const GOLDAR_VALUES = ['A', 'B', 'AB', 'O'];

export function validatePasienForm(form) {
  const e = {};
  const nama = String(form.nama || '').trim();
  if (!nama) e.nama = asField('Nama wajib diisi.');
  else if (nama.length > 255) e.nama = asField('Nama maksimal 255 karakter.');

  const tl = String(form.tanggal_lahir || '').trim();
  if (!tl) e.tanggal_lahir = asField('Tanggal lahir wajib diisi.');
  else {
    const d = new Date(tl);
    if (Number.isNaN(d.getTime())) e.tanggal_lahir = asField('Tanggal lahir tidak valid.');
    else if (d > new Date()) e.tanggal_lahir = asField('Tanggal lahir tidak boleh di masa depan.');
  }

  const jk = String(form.jenis_kelamin || '').trim();
  if (!jk) e.jenis_kelamin = asField('Jenis kelamin wajib dipilih.');
  else if (!JK_VALUES.includes(jk)) e.jenis_kelamin = asField('Jenis kelamin harus L atau P.');

  const hp = String(form.no_telepon || '').trim();
  if (hp && !phoneOk(hp)) e.no_telepon = asField('Format no. telepon tidak valid.');

  const em = String(form.email || '').trim();
  if (em && !emailOk(em)) e.email = asField('Format email tidak valid.');

  const gd = String(form.golongan_darah || '').trim();
  if (gd && !GOLDAR_VALUES.includes(gd)) {
    e.golongan_darah = asField('Golongan darah harus A, B, AB, atau O.');
  }

  return e;
}

/** Nilai JK untuk API (L/P), kompatibel dengan data lama teks panjang */
export function normalizeJenisKelaminForForm(apiValue) {
  if (apiValue == null || apiValue === '') return '';
  const s = String(apiValue).trim();
  const up = s.toUpperCase();
  if (up === 'L' || s === 'Laki-laki' || up === 'LAKI-LAKI') return 'L';
  if (up === 'P' || s === 'Perempuan' || up === 'PEREMPUAN') return 'P';
  return '';
}

export function displayJenisKelamin(apiValue) {
  const v = normalizeJenisKelaminForForm(apiValue);
  if (v === 'L') return 'Laki-laki';
  if (v === 'P') return 'Perempuan';
  return apiValue ? String(apiValue) : '–';
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function validateJadwalForm(form) {
  const e = {};
  if (form.dokter_id === '' || form.dokter_id == null) {
    e.dokter_id = asField('Dokter wajib dipilih.');
  }
  const hari = String(form.hari || '').trim();
  if (!hari) e.hari = asField('Hari wajib dipilih.');
  else if (!HARI_LIST.includes(hari)) e.hari = asField('Hari tidak valid.');

  const jm = String(form.jam_mulai || '').trim();
  const js = String(form.jam_selesai || '').trim();
  if (!jm) e.jam_mulai = asField('Jam mulai wajib diisi.');
  else if (!timeOk(jm)) e.jam_mulai = asField('Format jam mulai harus HH:mm.');
  if (!js) e.jam_selesai = asField('Jam selesai wajib diisi.');
  else if (!timeOk(js)) e.jam_selesai = asField('Format jam selesai harus HH:mm.');
  if (!e.jam_mulai && !e.jam_selesai && jm && js && jm >= js) {
    e.jam_selesai = asField('Jam selesai harus setelah jam mulai.');
  }

  const kap = Number(form.kapasitas);
  if (form.kapasitas === '' || Number.isNaN(kap)) {
    e.kapasitas = asField('Kapasitas wajib diisi.');
  } else if (!Number.isInteger(kap) || kap < 1 || kap > 500) {
    e.kapasitas = asField('Kapasitas harus bilangan bulat antara 1 dan 500.');
  }

  return e;
}
