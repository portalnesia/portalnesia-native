
export type copyTextType = (url: string,type?:string)=>void

export interface ClipboardTypes {
    copyText:copyTextType
}

export default function usClipboard(): ClipboardTypes