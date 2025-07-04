import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

import { VkAppOptions } from '../apps/models/vk-app-options.interface';
import { BASE_URL } from '../../environments/environment';

declare const vkBridge: any;

@Injectable()
export class VkBridgeService {

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    adsShownAt = 0;
    adsShowIntervalSeconds = 3 * 60; // 3 minutes

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected httpClient: HttpClient
    ) {}

    async getOptions(): Promise<VkAppOptions> {
        if (typeof vkBridge === 'undefined' || !window['isVKApp']) {
            return Promise.resolve({});
        }
        const options: VkAppOptions = {
            appId: 0,
            userId: 0,
            userToken: '',
            userFileUploadUrl: '',
            userSubscriptions: [],
            adEnabled: true,
            adAvailableInterstitial: false,
            appLaunchParamsJson: ''
        };

        const p1 = vkBridge.send('VKWebAppCheckNativeAds', {ad_format: 'interstitial'})
            .then((data: any) => {
                if (data.result) {
                    options.adAvailableInterstitial = true;
                }
                return data;
            })
            .catch((error: any) => {
                console.log(error);
            });

        const p2 = vkBridge.send('VKWebAppGetLaunchParams')
            .then((data: any) => {
                if (data.vk_app_id) {
                    options.appId = data.vk_app_id;
                    options.userId = data.vk_user_id;
                    options.appLaunchParamsJson = JSON.stringify(data);
                }
                return data;
            })
            .catch((error: any) => {
                console.log(error);
            });

        return Promise.all([p1, p2])
            .then((data) => {
                return firstValueFrom(this.getUserSubscriptions(data[1]));
            })
            .then((res) => {
                if (res.subscriptions) {
                    options.userSubscriptions = res.subscriptions;
                }
                return options;
            });
    }

    getUserSubscriptions(appData: any): Observable<{subscriptions: string[]}> {
        const url = `${BASE_URL}api/v1/vk_user_subscriptions`;
        return this.httpClient.post<{subscriptions: string[]}>(url, appData, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    async getUserToken(options: VkAppOptions, callbackFunc?: () => void): Promise<string> {
        if (!options.appId || !options.userId) {
            return Promise.reject();
        }
        if (options.userToken) {
            return Promise.resolve(options.userToken);
        }
        return vkBridge.send('VKWebAppGetAuthToken', {
                app_id: options.appId,
                scope: 'docs'
            })
            .then((data: any) => {
                options.userToken = data?.access_token;
                return data?.access_token;
            });
            // .catch((error: any) => {
            //     console.log(error);
            // });
    }

    async getFileUploadUrl(options: VkAppOptions): Promise<string> {
        return this.getUserToken(options)
            .then((userToken) => {
                return userToken;
            })
            .then((userToken) => {
                return vkBridge.send('VKWebAppCallAPIMethod', {
                    method: 'docs.getUploadServer',
                    params: {
                        v: '5.131',
                        user_ids: options.userId,
                        access_token: userToken
                    }})
                    .then((data: any) => {
                        options.userFileUploadUrl = data.response?.upload_url;
                        return data.response?.upload_url;
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
            });
    }

    showBannerAd(): void {
        if (typeof vkBridge === 'undefined' || !window['isVKApp']) {
            return;
        }
        vkBridge.send('VKWebAppShowBannerAd', {
            banner_location: 'top'
        })
            .then((data: any) => {
                if (data.result) {
                    // Banner ad displayed
                } else {
                    console.log(data);
                }
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    showAds(options: VkAppOptions): void {
        if (!options.adAvailableInterstitial || this.hasAnyString(options.userSubscriptions, ['remove_ad', 'premium_20', 'premium_30'])) {
            return;
        }
        const now = Date.now();
        if (this.adsShownAt && now - this.adsShownAt < this.adsShowIntervalSeconds * 1000) {
            // console.log(this.adsShowIntervalSeconds * 1000 - (now - this.adsShownAt));
            return;
        }
        this.showNativeAds()
            .then((data: any) => {
                if (data.result) {
                    this.adsShownAt = Date.now();
                }
            });
    }

    async showNativeAds(type: string = 'interstitial'): Promise<any> {
        return vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
            .then((data: any) => {
                return data;
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    async getUserInfo(): Promise<any> {
        return vkBridge.send('VKWebAppGetUserInfo')
            .then((data: any) => {
                return data;
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    async saveFile(appName: string, locale: string, options: VkAppOptions, fileDataString: string): Promise<string> {
        locale = locale || window.document.documentElement.lang;
        return this.getUserToken(options)
            .then((userToken) => {
                return userToken;
            })
            .then((userToken) => {
                const date = new Date();
                return vkBridge.send('VKWebAppCallAPIMethod', {
                    method: 'docs.save',
                    params: {
                        v: '5.131',
                        user_ids: options.userId,
                        access_token: options.userToken,
                        file: fileDataString,
                        title: appName + ' - ' + date.toLocaleString(locale)
                    }})
                    .then((data: any) => {
                        return data.response?.doc?.url;
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
            });
    }

    showSubscriptionBox(itemName: string): Promise<any> {
        return vkBridge.send('VKWebAppShowSubscriptionBox', {
            action: 'create',
            item: itemName
        })
            .then((data) => {
                // console.log('The purchase was successful.', data);
                return data;
            })
            .catch((e) => {
                console.log('Error!', e);
            });
    }

    hasAnyString(mainArray: string[], searchStrings: string[]): boolean {
        return searchStrings.some(str => mainArray.includes(str));
    }

    calculateFullAgeIso(dateStr: string): number {
        const parts = dateStr.split('-');
        const day = parseInt(parts[2], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[0], 10);
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    calculateFullAge(dateStr: string): number {
        const parts = dateStr.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    handleError<T>(error: HttpErrorResponse): Observable<any> {
        if (error.error) {
            return throwError(error.error);
        }
        if (error.message) {
            return throwError(() => error.message);
        }
        return throwError(() => error);
    }
}
