import React from 'react'
import { View,Dimensions,FlatList, Pressable } from 'react-native';
import {Layout as Lay,Text,Card,useTheme,Input, Icon,Divider,Autocomplete,AutocompleteItem} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'
import Image from 'react-native-fast-image'
import {useLinkTo} from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Layout from '@pn/components/global/Layout';
import Skeleton from '@pn/components/global/Skeleton'
import {AuthContext} from '@pn/provider/AuthProvider'
import usePagination from '@pn/utils/usePagination';
import {ucwords,specialHTML} from '@pn/utils/Main'
import Button from '@pn/components/global/Button';
import {RenderNoImage,RenderWithImage} from './Search'

export default function SearchFilter({navigation,route}){
    const {filter,q} = route?.params
    const linkTo = useLinkTo();
    const theme = useTheme();
    const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating,isLoadingInitialData,originalData
	} = usePagination( filter && q ? `/search?q=${q}&filter=${filter}` : null,"data",18)

    const renderItem=(prop)=>{
        if(['news','blog','users','media'].indexOf(filter) !== -1) return <RenderWithImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} withType={false} navigation={navigation} data={data} />
        if(['chord','thread'].indexOf(filter) !== -1) return <RenderNoImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} withType={false} navigation={navigation} data={data} />
        return null;
    }

    const Footer=()=>{
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" height={300} number={2} image /></View> 
		else return null
    }

    const RenderEmpty=()=>{
        if(isLoadingInitialData) {
            return <Skeleton type="grid" image number={12} />
        }
        if(error || originalData?.error) {
            return <NotFound status={originalData?.code||503}><Text>{originalData?.msg||"Something went wrong"}</Text></NotFound>
        }
        return (
            <Lay style={{flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                <Text appearance="hint">No data</Text>
            </Lay>
        )
    }

    return (
        <Layout navigation={navigation} withBack title="Search" subtitle={ucwords(filter)}>
            <FlatList
                data={data}
                columnWrapperStyle={{flexWrap:'wrap',flex:1}}
                numColumns={2}
                renderItem={renderItem}
                ListFooterComponent={Footer}
                onEndReached={()=>{
                    if(!isReachingEnd && !isLoadingMore) {
                        setSize(size+1)
                    }
                }}
                ListEmptyComponent={RenderEmpty}
                keyExtractor={(item,index)=>`${item?.title}-${index}`}
            />
        </Layout>
    )
}