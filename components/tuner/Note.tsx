import React from 'react'
import {Layout as Lay, Text} from '@ui-kitten/components'

export interface NoteProps {
    name: string,
    octave: number;

}

export default class Note extends React.PureComponent<NoteProps> {
    render() {
        const {name,octave}=this.props;
        return (
            <Lay style={{width:110,height:146,marginBottom:10}}>
                <Text style={{fontSize:128,fontFamily:"Inter_Bold",flexDirection:"row"}}>{name[0]}</Text>
                <Text style={{fontSize:32,position:"absolute",right:0,bottom:0}}>{octave.toFixed(0)}</Text>
                <Text style={{fontSize:32,position:"absolute",right:0,top:32}}>{name[1]}</Text>
            </Lay>
        )
    }
}