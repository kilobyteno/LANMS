import packageJson from '../package.json';

export const CURRENT_VERSION = packageJson.version;
export const API_BASE_URL = import.meta.env[`VITE_CORE_API_URL`] as string;
export const ENV = import.meta.env[`VITE_ENV`] || 'production' as string;
export const MODE = import.meta.env[`MODE`] as string;

console.log('API_BASE_URL:', API_BASE_URL);
console.log('ENV:', ENV);
console.log('MODE:', MODE);

export const GITHUB_REPO = 'kilobyteno/lanms';
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}`;
