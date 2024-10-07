import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { VkAppOptions } from '../apps/models/vk-app-options.interface';

declare const vkBridge: any;

@Injectable()
export class VkBridgeService {

    constructor(
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async getOptions(): Promise<VkAppOptions> {
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
            })
            .catch((error: any) => {
                console.log(error);
            });

        return Promise.all([p1, p2])
            .then(() => {
                return options;
            });
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
}
