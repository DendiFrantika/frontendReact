export function getRoleFromResponse(data, userResponse) {
  if (data?.role) return data.role;
  if (userResponse?.role) return userResponse.role;
  if (userResponse?.isAdmin || userResponse?.is_admin) return 'admin';
  if (userResponse?.isDokter || userResponse?.is_dokter) return 'dokter';
  if (userResponse?.isPasien || userResponse?.is_pasien) return 'pasien';
  return null;
}

export function normalizeUserPayload(userResponse, roleFromResponse, emailFallback = '') {
  const baseUser =
    typeof userResponse === 'object' && userResponse !== null
      ? { ...userResponse }
      : { email: emailFallback };

  return {
    ...baseUser,
    role:
      roleFromResponse ||
      baseUser.role ||
      (baseUser.email?.includes('admin') ? 'admin' : 'pasien'),
  };
}
