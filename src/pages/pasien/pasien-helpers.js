/** Respons API sering dibungkus { data: [...] } atau array langsung */
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/** Objek tunggal: { data: { ... } } atau langsung */
export function unwrapData(data) {
  if (data == null || typeof data !== 'object') return data;
  const inner = data.data;
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) return inner;
  return data;
}

/**
 * Bentuk respons GET /pasien/dashboard (fleksibel).
 * Mengembalikan pasienId, sumber profil mentah, dan daftar janji mendatang jika ada.
 */
export function parsePasienDashboardResponse(apiBody) {
  const body = unwrapData(apiBody);
  if (!body || typeof body !== 'object') {
    return { pasienId: null, profileRaw: null, appointmentsRaw: [] };
  }
  const pasien =
    body.pasien ??
    body.pasien_data ??
    (body.id != null && (body.nama != null || body.name != null) ? body : null);
  const pasienId =
    pasien?.id ?? body.pasien_id ?? body.pasienId ?? null;
  const profileRaw =
    body.profile ??
    pasien ??
    body.user ??
    (pasienId != null ? body : null);
  const appts =
    body.upcoming_appointments ??
    body.appointments_mendatang ??
    body.janji_mendatang ??
    body.appointments;
  const appointmentsRaw = Array.isArray(appts) ? appts : [];
  return { pasienId, profileRaw, appointmentsRaw };
}

function pick(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

export function normalizeProfile(raw, authUser) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    name: pick(r.name, r.nama, authUser?.nama, authUser?.name) ?? 'Pasien',
    email: pick(r.email, authUser?.email) ?? '—',
    phone: pick(r.phone, r.telepon, r.no_telepon, r.no_hp, authUser?.phone) ?? '—',
  };
}

export function normalizeAppointmentRow(raw, idx) {
  const r = raw || {};
  return {
    id: r.id ?? `a-${idx}`,
    date: pick(r.date, r.tanggal, r.appointment_date, r.tgl, r.visit_date) ?? '—',
    doctorName: pick(
      r.doctorName,
      r.doctor_name,
      r.nama_dokter,
      r.dokter?.nama,
      r.doctor?.nama
    ) ?? '—',
    specialty: pick(
      r.specialty,
      r.spesialisasi,
      r.specialization,
      r.dokter?.spesialisasi
    ) ?? '—',
    time: pick(r.time, r.jam, r.waktu, r.jam_mulai, r.start_time) ?? '—',
  };
}

export function normalizeQueueRow(raw, idx) {
  const r = raw || {};
  return {
    id: r.id ?? `q-${idx}`,
    doctorName: pick(
      r.doctorName,
      r.doctor_name,
      r.nama_dokter,
      r.dokter?.nama,
      r.doctor?.name
    ) ?? '—',
    time: pick(r.time, r.waktu, r.jam, r.scheduled_time, r.start_time, r.jadwal) ?? '—',
    status: pick(r.status, r.status_antrian, r.state) ?? '—',
  };
}

export function normalizeHistoryRow(raw, idx) {
  const r = raw || {};
  return {
    id: r.id ?? `h-${idx}`,
    date: pick(r.date, r.tanggal, r.visit_date, r.appointment_date) ?? '—',
    doctorName: pick(r.doctorName, r.doctor_name, r.nama_dokter, r.dokter?.nama) ?? '—',
    specialty: pick(r.specialty, r.spesialisasi, r.dokter?.spesialisasi) ?? '—',
    status: pick(r.status, r.keterangan, r.state) ?? '—',
    diagnosis: pick(r.diagnosis, r.keluhan, r.keterangan_diagnosa, r.rekam_medis?.diagnosis) ?? 'Belum ada diagnosis',
    complaint: pick(r.keluhan, r.keluhan_utama, r.rekam_medis?.keluhan_utama) ?? '—',
  };
}

export function normalizeDoctor(doc) {
  if (!doc) return { id: '', name: '—', specialty: '—' };
  return {
    id: doc.id,
    name: pick(doc.name, doc.nama) ?? 'Tanpa nama',
    specialty: pick(doc.specialty, doc.spesialisasi, doc.specialization) ?? '—',
  };
}

export function normalizeSchedule(s, idx = 0) {
  if (!s) return { id: `s-${idx}`, label: '—' };
  const day = pick(s.day, s.hari, s.nama_hari) ?? '';
  const start = pick(s.startTime, s.start_time, s.jam_mulai, s.mulai) ?? '';
  const end = pick(s.endTime, s.end_time, s.jam_selesai, s.selesai) ?? '';
  const range =
    start && end ? `${start} – ${end}` : pick(start, end, s.label, s.slot) ?? '—';
  const label = day ? `${day} · ${range}` : range;
  return {id: s.id ?? `s-${idx}`,
    label,
    // ✅ Tambahkan field ini
    tanggal: pick(s.tanggal, s.tanggal_pendaftaran, s.date, s.visit_date) ?? undefined,
    jam: pick(s.jam, s.jam_kunjungan, s.jam_mulai, s.start_time, s.startTime) ?? undefined,
  };
}
