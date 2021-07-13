import React from 'react'
import { View,FlatList,RefreshControl } from 'react-native';
import {Layout as Lay,Text,useTheme} from '@ui-kitten/components'
import {linkTo} from '@pn/navigation/useRootNavigation'

import Layout from '@pn/components/global/Layout';
import Skeleton from '@pn/components/global/Skeleton'
import usePagination from '@pn/utils/usePagination';
import useSelector from '@pn/provider/actions'
import {ucwords} from '@pn/utils/Main'
import NotFoundScreen from '../NotFound'
import i18n from 'i18n-js';
import {RenderNoImage,RenderWithImage} from './Like'

export default function SearchFilter({navigation,route}){
    const {filter} = route?.params
    const user = useSelector(state=>state.user);
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />
    const [refreshing,setRefreshing] = React.useState(false)
    const theme = useTheme();
    const {
		data:dataa,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating,isLoadingInitialData,originalData
	} = usePagination( filter && user ? `/like/${filter}` : null,"data",18)
    const [data,setData] = React.useState([]);

    React.useEffect(()=>{
        if(!isValidating) setRefreshing(false)
    },[isValidating])

    React.useEffect(()=>{
        if(dataa?.length > 0) setData(dataa?.[0]?.data);
        else setData(dataa)
    },[dataa])

    const renderItem=(prop)=>{
        if(['news','blog','users','media','twibbon'].indexOf(filter) !== -1) return <RenderWithImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} withType={false} navigation={navigation} data={data} />
        if(['chord','thread'].indexOf(filter) !== -1) return <RenderNoImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} withType={false} navigation={navigation} data={data} />
        return null;
    }

    const Footer=()=>{
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t("reach_end")}</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={15}><Skeleton type="grid" height={300} number={2} image /></View> 
		else return null
    }

    const RenderEmpty=()=>{
        if(isLoadingInitialData) return <Skeleton type="grid" image number={12} />
        if(error || originalData?.error) {
            return <NotFound status={originalData?.code||503}><Text>{originalData?.msg ?? i18n.t("errors.general")}</Text></NotFound>
        }
        if(dataa && dataa?.length == 0) {
            return (
                <Lay style={{flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                    <Text appearance="hint">No data</Text>
                </Lay>
            )
        }
        return <Skeleton type="grid" image number={12} />
    }

    return (
        <Layout navigation={navigation} withBack title="Likes" subtitle={ucwords(filter)}>
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
                refreshControl={
                    <RefreshControl
                        colors={['white']}
                        progressBackgroundColor="#2f6f4e"
                        onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
                        refreshing={refreshing}
                    />
                }
            />
        </Layout>
    )

}