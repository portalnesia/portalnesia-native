
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
    uriToFileProvider:(path: string) => Promise<string>
}