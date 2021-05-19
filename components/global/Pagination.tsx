import React from 'react'
import {  View } from 'react-native';

import Button from '@pn/components/global/Button'

export interface PaginationProps {
    total: number;
    page: number;
    onChange:(value: number)=>void
}

export default class Pagination extends React.PureComponent<PaginationProps> {
    constructor(props:PaginationProps){
        super(props)
    }

    static defaultProps = {
        total:0,
        page:0,
        onChange:()=>{}
    }

    _onPress(pg: number){
        if(this.props.onChange) this.props.onChange(pg)
    }

    _renderPage(){
        const {total,page}=this.props;
        const jumlah_number=3;
        const start_number = (page > jumlah_number) ? (page==total ? total-jumlah_number : page-jumlah_number+1) : 1;
        const end_number = (page < (total - jumlah_number+1))? (page==1? jumlah_number : page + jumlah_number-1) : total;

        let pageItems = [];
        for(let i=start_number;i<=end_number;i++) {
            pageItems.push(
                <Button key={`page-${i}`} style={{marginHorizontal:1,paddingHorizontal:3,paddingVertical:3}} appearance={i === page ? 'filled' : `ghost`} status={i === page ? 'primary' : `basic`} onPress={()=>this._onPress(i)} >{`${i}`}</Button>
            )
        }
        return pageItems
    }

    render(){
        const {page,total} = this.props;
        return (
            <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                {page !== 1 && <Button key='page-start' style={{marginRight:1,paddingHorizontal:3,paddingVertical:3}} appearance="ghost" status="basic" onPress={()=>this._onPress(1)}>{`<<`}</Button>}
                {this._renderPage()}
                {page !== total && total > 0 && <Button key='page-end' style={{marginLeft:1,paddingHorizontal:3,paddingVertical:3}} appearance="ghost" status="basic" onPress={()=>this._onPress(total)}>{`>>`}</Button>}
            </View>
        )
    }
}