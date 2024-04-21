export const environment = {
    production: false,
    appName: 'api2app',
    // apiUrl: 'http://localhost:8000/'
    apiUrl: 'https://api2app.ru/'
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
