import React from 'react'
import {View,NativeSyntheticEvent, TextInputSelectionChangeEventData,TextInput,ScrollView} from 'react-native'
import {Input,Layout as Lay,useTheme} from '@ui-kitten/components'
import { Markdown } from '../global/Parser';
import withTheme from '../HOC/withTheme';
import { MarkdownEditorProps,MarkdownEditorState } from './types';
import { renderFormatButtons } from './renderButtons';
import Editor,{WithThemeMarkdown} from './Editor'

export * from './types'

export default function MarkdownEdito(props: MarkdownEditorProps){
    const theme = useTheme();
    const [value,setValue]=React.useState("")
    const [showPreview,setShowPreview]=React.useState(false);
    const [selection,setSelection]=React.useState({start:0,end:0})
    const textInput = React.useRef<Editor>(null);

    return (
        <Lay level="2" style={{flex:1,flexDirection:'column',alignItems:'stretch',position:'relative'}}>
            <WithThemeMarkdown ref={textInput} value="" />
        </Lay>
    )
}