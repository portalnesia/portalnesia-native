import React from 'react';
import { View } from 'react-native';
import {Layout as Lay,Icon,TopNavigationAction,useTheme,Text,Divider} from '@ui-kitten/components'
import {Modalize} from 'react-native-modalize'

import {Portal} from '@gorhom/portal'
import styles from '@pn/components/global/style'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'

const SupportIcon = (props)=> <Icon {...props} name="question-mark-circle-outline" />

const penjelasan=[
    {
        title:"Why am i seeing this?",
        description:"You are seeing this because what you are looking for is not available on our system, or"
    },
    {
        title:"Why can't i find this page, even though it's available on the website?",
        description:"If you can find it on our website, it means that we have not implemented it in this application version. Please make sure you are using the last version of the application.\n\nThank you for your patience. We are constantly working hard to make it available as soon as possible."
    }
];

export default function NotFoundScreen({navigation}){
    const theme=useTheme();
    const ref = React.useRef(null);

    const Header = React.useMemo(()=>(
        <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
            <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
        </View>
    ),[theme])

    return (
        <>
            <Layout navigation={navigation} withBack title="Not Found" menu={()=><TopNavigationAction icon={SupportIcon} onPress={()=>ref?.current?.open()} />} >
                <NotFound status={404} />
            </Layout>
            <Portal>
                <Modalize
                    ref={ref}
                    withHandle={false}
                    modalStyle={{
                        backgroundColor:theme['background-basic-color-1'],
                    }}
                    adjustToContentHeight
                >
                    <Lay style={{borderTopLeftRadius:20,
                        borderTopRightRadius:20}}>
                        {Header}
                        <View style={{marginVertical:5}}>
                            {penjelasan?.map((dt,i)=>(
                                <View key={i.toString()} style={{marginTop:10,marginVertical:20}}>
                                    <View style={styles.container}>
                                        <Text category="h6">{dt?.title}</Text>
                                    </View>
                                    <Divider style={{backgroundColor:theme['border-text-color'],marginVertical:5}} />
                                    <View style={styles.container}>
                                        <Text>{dt?.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Lay>
                </Modalize>
            </Portal>
        </>
    )
}