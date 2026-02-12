// Frontend version management
export const APP_VERSION = '1.0.7';

export function getVersion(): string {
  return APP_VERSION;
}

export function getFullVersionInfo() {
  return {
    version: APP_VERSION,
    name: 'Laundry Management System',
    frontend: 'SuperAdmin Portal',
  };
}
