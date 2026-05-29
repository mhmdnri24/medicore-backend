/** Maps DB section titles to frontend i18n keys. */
export const SECTION_TITLE_KEYS: Record<string, string> = {
  Main: 'nav_main',
  'Master Data': 'master_data',
  Settings: 'Settings',
};

/** Maps permission slug (without view:) to frontend labelKey. */
export const MENU_LABEL_KEYS: Record<string, string> = {
  dashboard: 'Dashboard',
  registration: 'registration',
  igd: 'igd',
  'patient-services': 'patient_services',
  laboratory: 'Laboratory',
  radiology: 'radiology',
  drug: 'drug',
  uom: 'uom',
  category: 'category',
  doctor: 'doctor',
  nurse: 'nurse',
  staff: 'staff',
  procedure: 'procedure',
  ancillary: 'ancillary',
  insurer: 'insurer',
  supplier: 'supplier',
  user: 'User',
  role: 'Role',
  settings: 'Settings',
};

export function permissionToSlug(name: string | null): string {
  if (!name) return '';
  return name.startsWith('view:') ? name.slice(5) : name;
}

export function sectionTitleKey(title: string): string {
  return SECTION_TITLE_KEYS[title] ?? title.toLowerCase().replace(/\s+/g, '_');
}

export function menuLabelKey(slug: string): string {
  return MENU_LABEL_KEYS[slug] ?? slug;
}
