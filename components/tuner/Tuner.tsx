import React from 'react'
import {Layout as Lay, Text,useTheme} from '@ui-kitten/components'

import Utils,{TunerListenerData} from './Utils'
import Note from './Note'
import Meter from './Meter'

interface TunerProps {
    start: boolean
}

const tuner = new Utils();

function Tuner(props: TunerProps){
    const {start} = props;
    const theme = useTheme();
    const lastNoteName = React.useRef<string>("");
    const [note,setNote]=React.useState<TunerListenerData>({name:"A",octave:4,frequency:440,cents:0,value:0});

    React.useEffect(()=>{
        function listener(data: TunerListenerData){
            if(lastNoteName.current === data.name) {
                setNote(data);
            } else {
                lastNoteName.current = data.name;
            }
        }
        tuner.addListener(listener);
        console.log("START CALLED");
        if(start) {
            tuner.start();
        }

        return ()=>{
            tuner.removeListener(listener)
            tuner.stop();
        };
    },[start])

    React.useEffect(()=>{

        return()=>{
            tuner.stop();
        }
    },[])

    if(!start) return null;
    return (
        <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Meter cents={note.cents} theme={theme} />
            <Note {...note} />
            <Text style={{fontSize:28}}>
                {`${note.frequency.toFixed(1)} Hz`}
            </Text>
        </Lay>
    )
}

export default React.memo(Tuner);