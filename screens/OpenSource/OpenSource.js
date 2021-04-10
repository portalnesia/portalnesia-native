import React from 'react'
import {FlatList} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,ListItem, Icon} from '@ui-kitten/components'
import {openBrowserAsync} from 'expo-web-browser'
import {Constants} from 'react-native-unimodules'

import Layout from '@pn/components/global/Layout'
import {default as licenseArr} from '../../licenses.json';

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const renderDesc=(item)=>(props)=>(
    <React.Fragment>
        <Text {...props}>{`v${item?.version}`}</Text>
        { item?.license?.length > 0 && <Text {...props}>{`License ${item?.license}`}</Text>}
    </React.Fragment>
)
const RenderItem=React.memo(({item,index,navigation})=>{
    const onPress=()=>{
        if(item?.url?.match(/LICENSE$/) !== null) {
            const url = item?.url?.replace('github.com','raw.githubusercontent.com').replace('raw/','');
            navigation.navigate("OpenSourceDetail",{title:item?.title,url})
        } else {
            openBrowserAsync(item?.url,{
                enableDefaultShare:true,
                toolbarColor:'#2f6f4e',
                showTitle:true
            })
        }
    }
    return (
        <ListItem
            key={index.toString()}
            title={item?.title}
            description={renderDesc(item)}
            accessoryRight={ForwardIcon}
            onPress={onPress}
        />
    )
})

const RenderHeader=React.memo(()=>{
    return (
        <Lay level="2" style={{paddingVertical:50,alignItems:'center'}}>
            <Text category="h5">Portalnesia on Android</Text>
            <Text appearance="hint">{`v${Constants.nativeAppVersion}`}</Text>
        </Lay>
    )
})

export default function OpenSourceScreen({navigation}){

    const licenses=React.useMemo(()=>{
        return Object.keys(licenseArr).map((it)=>{
            const version = it.match(/\d+(\.\d+)*/);
            const title = it.replace(/(?:@)/gi,'').replace(version ? version[0] : '','');
            return {
                title,
                version: version ? version[0] : '',
                url: licenseArr[it]?.licenseUrl,
                license: licenseArr[it]?.licenses
            }
        })
    },[])

    return (
        <Layout navigation={navigation} withBack title="Open Source Libraries">
            <Lay>
                <FlatList
                    ListHeaderComponent={RenderHeader}
                    data={licenses}
                    renderItem={(props)=> <RenderItem {...props} navigation={navigation} />}
                    ItemSeparatorComponent={Divider}
                    keyExtractor={(item)=>item.title}
                />
            </Lay>
        </Layout>
    )
}