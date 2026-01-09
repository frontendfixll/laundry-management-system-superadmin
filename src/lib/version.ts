// Frontend version management
export const APP_VERSION = '2.0.0';

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
