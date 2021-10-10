import React from 'react'
import {View,Dimensions} from 'react-native'
import {Layout as Lay, Text,Input,useTheme,Divider} from '@ui-kitten/components'
import i18n from 'i18n-js'
import Modal from 'react-native-modal'
import {Portal} from '@gorhom/portal'

import Button from "@pn/components/global/Button";
import { verifyAuthentication } from '@pn/utils/Biometrics';
import { AuthContext } from '@pn/provider/Context'

const {width} = Dimensions.get('window')

interface IState {
    password: string;
    show: boolean
}

interface PasswordData {
    password?: string;
    payload?: string;
    [key: string]: any;
}

export interface PasswordProps {
    onSubmit:(data: PasswordData)=>void;
    supported: boolean;
    fingerprint?:boolean;
}

interface PassworddProps extends PasswordProps {
    theme: Record<string,string>;
    loading?:boolean;
    setNotif:(type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data?: {[key: string]: any})=>void
}

class PasswordClass extends React.PureComponent<PassworddProps,IState> {
    constructor(props: PassworddProps) {
        super(props);

        this.state = {
            password:'',
            show:false
        }
        this.verify = this.verify.bind(this);
        this.closeModal=this.closeModal.bind(this)
    }

    static defaultProps = {
        fingerprint:true
    }

    async verify(){
        const {supported,setNotif,onSubmit,fingerprint} = this.props;
        try {
            if(!supported || fingerprint===false) return this.setState({show:true})

            const prompt = await verifyAuthentication();
            if(!prompt.success) return this.setState({show:true})

            onSubmit({password:prompt.signature,payload:prompt.payload})
        } catch(e: any){
            console.log(e)
            if(e?.message) setNotif(true,"Error",e?.message);
            return this.setState({show:true})
        }
    }

    closeModal(){
        this.setState({show:false,password:''})
    }

    private _handleSubmit() {
        const {onSubmit} = this.props;
        const {password} = this.state

        onSubmit({password});
    }
    
    render() {
        const {show,password} = this.state
        const {theme,loading} =this.props;

        return (
            <Portal>
                <Modal
                    isVisible={show}
                    style={{margin:0,justifyContent:'center',alignItems:'center'}}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    coverScreen={false}
                >
                    <Lay style={{padding:10,width:width-60,borderRadius:10,paddingVertical:15}}>
                        <View style={{marginBottom:15}}>
                            <Text category="h5" style={{paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{`Verify Your Account`}</Text>
                        </View>

                        <View>
                            <Input
                                value={password}
                                onChangeText={(pass)=>this.setState({password:pass})}
                                secureTextEntry
                                label="Password"
                                onSubmitEditing={()=>this._handleSubmit()}
                                returnKeyType="go"
                                blurOnSubmit={false}
                            />
                        </View>

                        <Divider style={{backgroundColor:theme['border-text-color'],marginTop:10}} />

                        <View style={{marginTop:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <Button status="danger" disabled={loading} onPress={()=>this.setState({show:false})}>{i18n.t('cancel')}</Button>
                            <Button disabled={loading} loading={loading} onPress={()=>this._handleSubmit()}>Submit</Button>
                        </View>
                    </Lay>
                </Modal>
            </Portal>
        )
    }
}

const Password = React.forwardRef<InstanceType<typeof PasswordClass>,PasswordProps>((props,ref)=>{
    const theme = useTheme();
    const context = React.useContext(AuthContext);
    const {setNotif} = context;

    return <PasswordClass ref={ref} {...props} theme={theme} setNotif={setNotif} />
})

export default Password