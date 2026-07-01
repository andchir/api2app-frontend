export const environment = {
    production: true,
    appName: 'Api2App',
    appLogoUrl: '/assets/img/api2app-logo-light.svg',
    languages: ['en', 'ru', 'fr', 'de', 'es'],
    apiUrl: '',
    robokassaUrl: ''
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
