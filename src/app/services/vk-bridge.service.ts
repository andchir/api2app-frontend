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
            adAvailableInterstitial: false
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
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    getFileUploadUrl(options: VkAppOptions): Promise<string> {
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

    saveFile(options: VkAppOptions, fileDataString: string, fileName: string): void {
        vkBridge.send('VKWebAppCallAPIMethod', {
            method: 'docs.save',
            params: {
                v: '5.131',
                user_ids: options.userId,
                access_token: options.userToken,
                file: fileDataString,
                title: fileName
            }})
            .then((data: any) => {
                return data.response?.doc?.url;
            })
            .catch((error: any) => {
                console.log(error);
            });
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
