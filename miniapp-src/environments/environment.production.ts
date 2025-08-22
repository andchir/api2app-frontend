export const environment = {
    production: true,
    appName: 'Api2App',
    languages: ['en', 'ru', 'fr', 'de', 'es'],
    apiUrl: 'https://api2app.org/'
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
