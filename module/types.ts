export interface PictureInPictureInterface {
    isAvailable(): Promise<boolean>;
    enterPictureInPicture(): Promise<void>;
}

export type AccountManagerType = {
    index: number,
    name: string,
    type: string
}

export interface AuthenticationInterface {
    BUTTON_SIZE_ICON: string;
    BUTTON_SIZE_STANDARD: string;
    BUTTON_SIZE_WIDE: string;
    BUTTON_COLOR_AUTO: string;
    BUTTON_COLOR_LIGHT: string;
    BUTTON_COLOR_DARK: string;
    getAccounts(): Promise<AccountManagerType[]>;
    addAccountExplicitly(username: string,password: string): Promise<AccountManagerType>;
    removeAccount(account: AccountManagerType): Promise<void>;
    renameAccount(account: AccountManagerType,newName:string): Promise<void>;
    //getAuthToken(account: AccountManagerType): Promise<string>;
    setUserData(account: AccountManagerType,key: string, data: string): Promise<void>;
    getUserData(account: AccountManagerType,key: string): Promise<{value:string}>;
    getPassword(account: AccountManagerType): Promise<string>;
    getPassword(account: AccountManagerType,password: string): Promise<void>;
    setAuthToken(account: AccountManagerType,authToken:string): Promise<void>;
    startAuthActivity(): void;
    restartApps(): void;
    addAccount(username: string,refresh_token: string,authToken: string,restart?:boolean): void;
    getIntentExtra(): Promise<{name:string|null,type:string|null,restart:boolean}>;
    prompOneTapSignIn(): Promise<{email: string,password: string}>;
    oneTapSignOut(): Promise<void>;
}
export interface SyncModuleInterface {
    sync(): Promise<void>
}

export type ShareData = {
    data: string,
    mimeType:string
}
type ShareDataListener = (ShareData & {
    extraData?: string;
}) | null;

export type ContinueInAppInterface = {
    continueInApp(type: string,data: string,extraData?: string): Promise<void>;
}
export type ShareCropOptions = {
    aspect:[number,number],
    quality: number,
}
export type ShareCropResult = {
    uri:string
} | {
    cancelled:boolean
}

export interface ShareModuleInterfaceNative {
    getSharedData(clear: boolean): Promise<ShareDataListener>;
    dismiss():void;
    startCropActivity?(type: 'png'|'jpg'|'jpeg',uri: string,options?:ShareCropOptions): Promise<ShareCropResult>
}