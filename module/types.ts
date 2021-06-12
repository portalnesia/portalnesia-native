
export type Locale = Readonly<{
    languageCode: string,
    countryCode: string,
    languageTag: string
}>

export type LocalizationConstants = Readonly<{
    country: string,
    locales: Locale[]
}>

export interface PortalnesiaInterface {
    initialLocalization: LocalizationConstants;
    SUPPORTED_ABIS: String[];
    /**
     * @argument
     * path: filepath without file://
     */
    installApk:(path: string) => Promise<boolean>;
    /**
     * @argument
     * path: filepath without file://
     */
    installApkView:(path: string) => Promise<boolean>;
    isAppInstalled:(packageName: string) => Promise<boolean>;
    openDownloadManager:()=>void;
    /**
     * @argument
     * path: filepath without file://
     */
    uriToFileProvider:(path: string) => Promise<string>;
    verifyWithRecaptcha:()=>Promise<string>;
    getAction(): Promise<string>;
}

export interface BrighnessInterface {
    getBrightness():Promise<number>;
    setBrightness(value: number): Promise<void>;
    getSystemBrightness(): Promise<number>;
}

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
    addAccount(username: string,refresh_token: string,authToken: string): void;
    getIntentExtra(): Promise<{name:string|null,type:string|null,restart:boolean}>
}
export interface SyncModuleInterface {
    sync(): Promise<void>
}