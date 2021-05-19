import { TextStyle,StyleProp } from "react-native"

export type SelectionType = {
    start:number,
    end:number
}

export interface MarkdownEditorProps {
    theme: Record<string,string>;
    value: string;
    showPreview?: boolean;
    label?: string;
    disabled?:boolean;
    onChangeText?: (value: string)=>void;
}

export interface MarkdownEditorState {
    value: string;
    selection:SelectionType;
    showPreview: boolean;
}

export type FunctionArg = {
    getState():MarkdownEditorState,
    item: FormatType,
    setState<K extends keyof MarkdownEditorState>(state: Pick<MarkdownEditorState,K>,callback?:()=>void): void
    setSelection(state: Pick<MarkdownEditorState,"selection">,callback?:()=>void): void
}

export type FormatType = {
    key: string,
    title: string,
    wrapper?: string,
    onPress(arg: FunctionArg): void,
    style?:StyleProp<TextStyle>,
    prefix?: string,
    icon?:{
        name: string,
        pack?: string
    }
}