import React from 'react';
import { FlatList,ImageProps } from 'react-native';
import { FormatType,FunctionArg } from './types';
import Formats from './Formats';
import Button from '../global/Button';
import { Icon } from '@ui-kitten/components';

interface DefaultMarkdownProps extends FunctionArg {
  index: number
}

const renderIcon=(name: string, pack?: string)=>(props?:Partial<ImageProps>)=><Icon {...props} name={name} pack={pack} />

const defaultMarkdownButton = ({ item, getState, setState,index,setSelection }: DefaultMarkdownProps) => {
  return (
    <Button tooltip={item.title} key={index.toString()} text onPress={() => item.onPress({ getState, setState, item, setSelection })} {...(item.icon ? {accessoryLeft:renderIcon(item?.icon?.name,item?.icon?.pack)} : {children:item.key})} />
  );
};

export const renderFormatButtons = ({ getState, setState,setSelection }: Pick<FunctionArg,'getState'|'setState'|'setSelection'>, formats?: FormatType[]) => {
  return (
    <FlatList
      data={formats ? formats : Formats}
      keyboardShouldPersistTaps="always"
      renderItem={({ item, index }) => defaultMarkdownButton({ item, getState, setState,index,setSelection })}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardDismissMode="none"
    />
  )
};