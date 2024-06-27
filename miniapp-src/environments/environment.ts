export const environment = {
    production: true,
    appName: 'Api2App',
    apiUrl: ''
};

export const BASE_URL = environment.apiUrl === '/' ? `${window.location.origin}/` : environment.apiUrl;
