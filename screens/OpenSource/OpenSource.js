import React from 'react'
import {FlatList} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,Icon} from '@ui-kitten/components'
import {Constants} from 'react-native-unimodules'

import Layout from '@pn/components/global/Layout'
import {default as licenseArr} from '../../licenses.json';
import ListItem from '@pn/components/global/ListItem'
import { openBrowser } from '@pn/utils/Main'

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const getURL=(urls,title)=>{
    let url = urls?.licenseUrl;
    if(title.match(/^\@react\-native\-firebase\/+/)) {
        url = url?.replace(/raw\/master\//,'').replace(/tree/,'raw')
    } else if(title.match(/\^@react\-navigation\/+/)) {
        const pack = title.split("/");
        url = url?.replace(/master\//,`main/packages/${pack[1]}/`).replace(/tree/,'raw')
    } else if(title.match(/^(\@ui\-kitten\/|\@eva\-design\/)/)) {
        url = `${url}/raw/master/LICENSE.txt`
    } else if(title.match(/^react-native-unimodules/)) {
        url = url?.replace(/\.md$/,'')
    } else if(title.match(/^(firebase$|hermes\-engine|react\-native\-syntax\-highlighter|use\-count\-up|react\-native\-web$|\@native\-html\/table\-plugin)/)) {
        url = `${url}/raw/master/LICENSE`
    } else if(title.match(/^(expo)/)) {
        url = `${urls?.repository}/raw/master/LICENSE`;
    } else if(title.match(/^(\@portalnesia\/)/)) {
        url = `${urls?.repository}/raw/main/LICENSE`;
    } else if(title.match(/^(react\-native\-dotenv|react\-native\-print)/)) {
        url = url?.replace(/github\:/,"https://github.com/")
        url = `${url}/raw/master/LICENSE`
    } else if(title.match(/^\@react\-native\-community\//)) {
        if(title.match(/slider$/)) {
            url = `${url}/raw/master/LICENSE.md`
        }
        else if(!title.match(/netinfo$/)) {
            url = `${url}/raw/master/LICENSE`
        }
    }
    return url;
}

const renderDesc=(item)=>(props)=>(
    <React.Fragment>
        <Text {...props}>{`v${item?.version}`}</Text>
        { item?.license?.length > 0 && <Text {...props}>{`License ${item?.license}`}</Text>}
    </React.Fragment>
)
const RenderItem=React.memo(({item,index,navigation})=>{
    const onPress=()=>{
        if(item?.url?.match(/LICENSE(.txt|.md)?$/i) !== null) {
            const url = item?.url?.replace('github.com','raw.githubusercontent.com').replace('raw/','');
            navigation.navigate("OpenSourceDetail",{title:item?.title,url})
        } else {
            openBrowser(item?.url,false)
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

const isHermes = !!global.HermesInternal
const RenderHeader=React.memo(()=>{
    return (
        <Lay level="2" style={{paddingVertical:50,alignItems:'center'}}>
            <Text category="h5">Portalnesia on Android</Text>
            <Text appearance="hint">{`Native version v${Constants.nativeAppVersion}`}</Text>
            <Text appearance="hint">{`Bundle version v${Constants.manifest.version}`}</Text>
            <Text appearance="hint">{`Hermes ${isHermes ? 'enabled' : 'disabled'}`}</Text>
        </Lay>
    )
})

export default function OpenSourceScreen({navigation}){

    const licenses=React.useMemo(()=>{
        return Object.keys(licenseArr).map((it,iii)=>{
            let version = it.match(/@\d+(\.\d+)*/);
            version = version ? version[0]?.substring(1) : '';
            const title = it.replace(version,'').replace(/(?:@$)/gi,'');
            const url = getURL(licenseArr[it],title);
            return {
                title,
                version: version,
                url,
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
                    contentContainerStyle={{paddingBottom:65}}
                />
            </Lay>
        </Layout>
    )
}