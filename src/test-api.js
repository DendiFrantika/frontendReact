import authService from './services/auth-service';
import dashboardService from './services/dashboard-service';
import dokterService from './services/dokter-service';
import pasienService from './services/pasien-service';
import jadwalService from './services/jadwal-service';
import rekamMedisService from './services/rekam-medis-service';

const testAPI = async () => {
  console.log('🚀 Memulai test koneksi API...');
  console.log(`📍 Base URL: ${process.env.REACT_APP_API_BASE_URL}\n`);

  try {
    // Test 1: Login
    console.log('📝 Test 1: Login...');
    const loginResponse = await authService.login('admin@rumahsakit.com', 'password123');
    console.log('✅ Login berhasil:', {
      token: loginResponse.token ? 'Ada' : 'Tidak ada',
      user: loginResponse.user?.nama || 'Tidak ada',
    });
    console.log('---\n');

    // Test 2: Get Current User
    console.log('📝 Test 2: Get Current User...');
    const currentUser = await authService.getCurrentUser();
    console.log('✅ Current User:', {
      nama: currentUser.nama,
      email: currentUser.email,
      role: currentUser.role,
    });
    console.log('---\n');

    // Test 3: Dashboard Stats
    console.log('📝 Test 3: Dashboard Stats...');
    const stats = await dashboardService.getStats();
    console.log('✅ Dashboard Stats:', stats);
    console.log('---\n');

    // Test 4: Recent Activities
    console.log('📝 Test 4: Recent Activities...');
    const activities = await dashboardService.getRecentActivities();
    console.log('✅ Recent Activities:', activities.slice(0, 3)); // Show first 3
    console.log('---\n');

    // Test 5: Get Dokter
    console.log('📝 Test 5: Get Dokter...');
    const dokters = await dokterService.getAll();
    console.log('✅ Dokter List:', {
      total: dokters.length,
      first: dokters[0]?.nama || 'Tidak ada',
    });
    console.log('---\n');

    // Test 6: Get Pasien
    console.log('📝 Test 6: Get Pasien...');
    const pasiens = await pasienService.getAll();
    console.log('✅ Pasien List:', {
      total: pasiens.length,
      first: pasiens[0]?.nama || 'Tidak ada',
    });
    console.log('---\n');

    // Test 7: Get Jadwal
    console.log('📝 Test 7: Get Jadwal...');
    const jadwals = await jadwalService.getAll();
    console.log('✅ Jadwal List:', {
      total: jadwals.length,
      first: jadwals[0]?.hari || 'Tidak ada',
    });
    console.log('---\n');

    // Test 8: Get Rekam Medis
    console.log('📝 Test 8: Get Rekam Medis...');
    const rekamMedis = await rekamMedisService.getAll();
    console.log('✅ Rekam Medis List:', {
      total: rekamMedis.length,
      first: rekamMedis[0]?.diagnosis || 'Tidak ada',
    });
    console.log('---\n');

    // Test 9: Chart Data
    console.log('📝 Test 9: Chart Data (Weekly)...');
    const chartData = await dashboardService.getChartData('week');
    console.log('✅ Chart Data:', chartData);
    console.log('---\n');

    console.log('✅✅✅ Semua test berhasil! API berfungsi dengan baik ✅✅✅');
    console.log(`✅ Credentials: admin@rumahsakit.com / password123`);
    return { success: true, message: 'All tests passed' };

  } catch (error) {
    console.error('\n❌❌❌ Error saat testing API ❌❌❌');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Error Details:', error.response?.data || error);
    return { success: false, error: error.message };
  }
};

// Auto-run jika file diimport langsung
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
  console.log('✅ testAPI tersedia di console dengan: testAPI()');
}

export default testAPI;
