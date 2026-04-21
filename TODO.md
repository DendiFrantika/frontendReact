# Fix ClinicDoctors.jsx 404 Error - /api/public/dokters

**Status:** In progress

## Steps (sequential):
- [x] 1. Analyzed files, created this TODO  
- [x] 2. Edit ClinicDoctors.jsx: ✅ axios + fallback + error UI
- [ ] 3. npm start, test landing page (http://localhost:3000), verify no console errors, shows fallback if backend down  
- [ ] 4. Backend fix (separate project): Add Laravel route `Route::get('/public/dokters', [DokterController::class, 'publicIndex']);` return public doctors list  
- [ ] 5. Mark complete  

**Expected result:** Landing page loads without JS errors. Fallback UI: 3 sample doctors. Real data when backend ready.
