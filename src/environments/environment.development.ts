export const environment = {
    production: false,
    appName: 'Api2App',
    apiUrl: 'http://localhost:8000/',
    // apiUrl: 'https://api2app.org/',
    robokassaUrl: 'https://partner.robokassa.ru/'
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
