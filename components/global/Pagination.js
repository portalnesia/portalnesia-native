import React from 'react'
import {  View } from 'react-native';
import {Text} from '@ui-kitten/components'

import Button from '@pn/components/global/Button'

function Pagination({total,page,onChange}){
    const jumlah_number=3;
    const start_number = (page > jumlah_number) ? (page==total ? total-jumlah_number : page-jumlah_number+1) : 1;
    const end_number = (page < (total - jumlah_number+1))? (page==1? jumlah_number : page + jumlah_number-1) : total;
    
    const onPress=(pg)=>()=>{
        onChange(pg)
    }

    const renderPage=()=>{
        let pageItems = [];
        for(let i=start_number;i<=end_number;i++) {
            pageItems.push(
                <Button style={{marginHorizontal:1,paddingHorizontal:3,paddingVertical:3}} appearance={i === page ? 'filled' : `ghost`} status={i === page ? 'primary' : `basic`} onPress={onPress(i)} >{`${i}`}</Button>
            )
        }
        return pageItems
    }

    return (
        <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
            {page !== 1 && <Button style={{marginRight:1,paddingHorizontal:3,paddingVertical:3}} appearance="ghost" status="basic" onPress={onPress(1)}>{`<<`}</Button>}
            {renderPage()}
            {page !== total && total > 0 && <Button style={{marginLeft:1,paddingHorizontal:3,paddingVertical:3}} appearance="ghost" status="basic" onPress={onPress(total)}>{`>>`}</Button>}
        </View>
    )
}
Pagination.defaultProps={
    total:0,
    page:0,
    onChange:()=>{}
}
export default Pagination