export const environment = {
    production: true,
    appName: 'Api2App',
    languages: ['en', 'ru', 'fr', 'de', 'es'],
    apiUrl: ''
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
