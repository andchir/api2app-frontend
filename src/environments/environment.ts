export const environment = {
    production: true,
    appName: 'api2app',
    apiUrl: ''
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
