import React from 'react'
import {View,NativeSyntheticEvent, TextInputSelectionChangeEventData,TextInput,ScrollView} from 'react-native'
import {Divider, Icon, Input,Layout as Lay, Text} from '@ui-kitten/components'
import { Markdown } from '../global/Parser';
import withTheme from '../HOC/withTheme';
import { MarkdownEditorProps,MarkdownEditorState } from './types';
import { RenderFormatButtons } from './renderButtons';
import Button from '../global/Button';

export * from './types'

export default class MarkdownEditor extends React.PureComponent<MarkdownEditorProps,MarkdownEditorState> {
    private textInput:React.RefObject<Input>

    constructor(props: MarkdownEditorProps){
        super(props);
        this.state={
            value:props.value,
            selection:{start:0,end:0},
            showPreview:props.showPreview||false
        }
        this.textInput = React.createRef<Input>()
        this.getValue=this.getValue.bind(this);
    }

    private _onChange(value: string){
        this.setState({value})
        if(this.props.onChangeText) this.props.onChangeText(value);
    }

    getValue(){
        return this.state.value;
    }

    componentDidUpdate(prev: MarkdownEditorProps){
        if(prev.value !== this.props.value) {
            this.setState({value:this.props.value})
        }
    }

    private _onSelectionChange(event:NativeSyntheticEvent<TextInputSelectionChangeEventData>){
        this.setState({
            selection: event.nativeEvent.selection
        })
    }

    private _getState(): MarkdownEditorState {
        /*this.setState({
            selection:{
                start:1,
                end:1
            }
        })*/
        return this.state;
    }

    toggle(){
        this.setState({showPreview:!this.state.showPreview});
    }

    focus(){
        this.textInput.current?.focus();
    }
    blur(){
        this.textInput.current?.blur();
    }

    private renderPreview(){
        const {value} = this.state;
        const {label,theme} = this.props;
        return (
                <ScrollView
                    style={{position:'absolute',top:0,left:5,zIndex:1,height:'100%',width:'100%',backgroundColor:theme['background-basic-color-1']}}
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={{padding:10,paddingTop:0}}
                >
                    <Lay><Text appearance="hint" style={{fontSize:12}}>{label||"Markdown Editor"}</Text></Lay>
                    <Markdown source={value} padding={false} editor />
                </ScrollView>
        )
    }

    render(){
        const {theme,label,disabled} = this.props
        const {value,selection,showPreview}=this.state;
        return (
            <Lay>
                <Lay style={{position:'relative',flex:1}}>
                    {showPreview ? this.renderPreview() : null}
                    <Input
                        style={{color:theme['text-basic-color'],paddingHorizontal:15,flexGrow:1,flexShrink:1,fontSize:15,margin:0,flexDirection:'column',flex:1}}
                        multiline
                        underlineColorAndroid="transparent"
                        onChangeText={(value)=>this._onChange(value)}
                        onSelectionChange={(event)=>this._onSelectionChange(event)}
                        value={value}
                        ref={this.textInput}
                        label={label||"Markdown Editor"}
                        textStyle={{minHeight:200,maxHeight:400}}
                        placeholderTextColor={theme['text-hint-color']}
                        selection={selection}
                        textAlignVertical="top"
                        disabled={disabled}
                    />
                </Lay>
                <Divider />
                <View style={{flex:0,flexDirection:'row',paddingVertical:5,paddingHorizontal:15}}>
                    <Button tooltip={showPreview ? "Hide preview" : "Show preview"} text accessoryLeft={(props)=><Icon {...props} name={showPreview ? 'eye-off-outline' : 'eye-outline'} />} onPress={()=>this.toggle()} />
                    <RenderFormatButtons getState={()=>this._getState()} setState={(state,callback)=>this.setState({...state},callback)} setSelection={(state,callback)=>this.setState(state,callback)} />
                </View>
                <Divider />
            </Lay>
        )
    }
}

export const WithThemeMarkdown = withTheme<MarkdownEditorProps>(MarkdownEditor)