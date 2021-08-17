import {StyleSheet} from 'react-native'

const s = StyleSheet.create({
    content__header:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        zIndex:10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        height:77,
        paddingHorizontal:20,
        paddingBottom:3
    },
    content__cover:{
        position:"relative",
        zIndex:5,
        shadowRadius:18,
        shadowOpacity:0.35,
        width:300,
        height:300,
        //shadowOffset:{width:0,height:4},
        //marginTop:-50,
        //marginLeft:-50,
    }
})

export default s;