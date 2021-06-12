import React from 'react'
import {CountUp as Countt} from 'use-count-up'

export type CountUpProps={
    data: {number: number,format: string},
    suffix?: string,
    prefix?: string,
    onComplete:()=>void,
}

function CountUp(props:CountUpProps){
    const {data,suffix,prefix,onComplete} = props;
    const start = React.useRef(0);
    const prevStart = React.useRef(0);

    const handleComplete=()=>{
        if(start.current !== data.number) {
            prevStart.current = data.number;
        }
        if(onComplete) onComplete();
    }

    const handleFormatter=(num: number): string=>{
        if(num===data?.number) {
            return data?.format;
        } else {
            return num.toFixed(0).toString();
        }
    }

    React.useEffect(()=>{
        if(prevStart.current !== start.current) {
            start.current = prevStart.current;
        }
    },[data])

    return (
        <Countt
            isCounting
            start={start.current}
            end={data.number}
            onComplete={handleComplete}
            formatter={handleFormatter}
            suffix={suffix}
            prefix={prefix}
        />
    )
}

export default React.memo(CountUp);