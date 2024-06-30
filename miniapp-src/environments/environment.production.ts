export const environment = {
    production: true,
    appName: 'Api2App',
    apiUrl: 'https://api2app.ru/'
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
