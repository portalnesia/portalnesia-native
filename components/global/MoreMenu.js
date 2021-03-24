import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import {Icon,TopNavigationAction,Layout,Text,useTheme,Menu,MenuItem} from '@ui-kitten/components'
import {Backdrop as BackDr} from 'react-native-backdrop'
import Modal from 'react-native-modal'

const MoreIcon=(props)=><Icon {...props} name="more-vertical" />

export const MenuToggle=({onPress})=><TopNavigationAction icon={MoreIcon} onPress={onPress} />

const MenuCont=({menu,visible,onClose,...props})=>{
    //const {width}=useWindowDimensions()
    const theme=useTheme()
    //const ref = React.useRef(null)
    const Header = (
        <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
            <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
        </View>
    )

    return (
        <BackDr
            visible={visible||false}
            header={Header}
            containerStyle={{
                backgroundColor:theme['background-basic-color-1'],
                borderTopLeftRadius:20,
                borderTopRightRadius:20,
            }}
            overlayColor="rgba(0, 0, 0, 0.52)"
            {...props}
        >
            <Layout>
                <Layout style={{marginBottom:10}}>
                    <Menu appearance="noDivider">
                        {menu?.map((dt,i)=>{
                            const onPress=dt?.onPress
                            return <MenuItem style={{paddingHorizontal:12,paddingVertical:12}} key={`${i}`} title={dt.title} onPress={onPress} />
                            
                        })}
                    </Menu>
                </Layout>
            </Layout>
        </BackDr>
    )
}
export const MenuContainer = React.memo(MenuCont)

/*
    <BackDr
            visible={visible||false}
            header={Header}
            containerStyle={{
                backgroundColor:theme['background-basic-color-1'],
                borderTopLeftRadius:20,
                borderTopRightRadius:20,
            }}
            overlayColor="rgba(0, 0, 0, 0.52)"
            {...props}
        >
            <Layout>
                <Layout style={{marginBottom:10}}>
                    <Menu appearance="noDivider">
                        {menu?.map((dt,i)=>{
                            const onPress=dt?.onPress
                            return <MenuItem style={{paddingHorizontal:12,paddingVertical:12}} key={`${i}`} title={dt.title} onPress={onPress} />
                            
                        })}
                    </Menu>
                </Layout>
            </Layout>
        </BackDr>
*/