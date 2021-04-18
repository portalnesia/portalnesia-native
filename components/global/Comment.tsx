import React from 'react'
import {Dimensions,View,ImageProps, TextProps, Animated,LayoutAnimation,UIManager,Alert} from 'react-native'
import {useTheme,Layout as Lay, Text,Input,Divider,Icon,Menu,MenuItem} from '@ui-kitten/components'
import {openBrowserAsync} from 'expo-web-browser'
import {useLinkTo} from '@react-navigation/native'
import {gql} from 'graphql-request'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import {AxiosRequestConfig} from 'axios'
import {Modalize} from 'react-native-modalize'
import {Portal} from '@gorhom/portal'

import ListItem from './ListItem'
import Pressable from '@pn/components/global/Pressable';
import Backdrop from '@pn/components/global/Backdrop';
import useClipboard,{copyTextType} from '@pn/utils/clipboard'
import {URL} from '@env'
import Button from '@pn/components/global/Button'
import Avatar from '@pn/components/global/Avatar'
import useAPI from '@pn/utils/API'
import i18n from 'i18n-js'
import { AuthContext } from '@pn/provider/Context'
import {Ktruncate, ucwords} from '@pn/utils/Main'
import { FlatList } from 'react-native-gesture-handler'
import {ListSkeleton as Skeleton} from './Skeleton'
import Recaptcha from '@pn/components/global/Recaptcha'

const CloseIcon=(props?:Partial<ImageProps>)=><Icon {...props} name='close' />
const OptionIcon=(props: Partial<ImageProps> | undefined)=> <Icon {...props} name="more-vertical" />
const SendIcon=(props: Partial<ImageProps> | undefined)=> <Icon {...props} name="paper-plane-outline" />
const {width,height} = Dimensions.get('window')

type OnDeleteType={
    type: 'comment'|'reply',
    id: number,
    parentId?: number
}
type CommentsType='chord'|'news'|'twitter_thread'|'pages'|'jadwal';
type ErrorResult={
    response:{
        msg: string
    }
}
type UserResult={
    user_login: string|null,
    user_nama: string|null,
    gambar: string|null
}
type ReplyResult={
    komentar: string,
    id: number,
    login: boolean,
    tanggal: string,
    delete_token: string|null,
    nama: string,
    user: UserResult
}
interface DataResult extends ReplyResult{
    total_reply: number,
    reply: Array<ReplyResult>|null
}
interface SuccessResult{
    comments:{
        total: number,
        data: Array<DataResult>
    }
}
interface SuccessReplyResult{
    comments_replies:{
        total: number,
        data: Array<ReplyResult>
    }
}
type ReplyValueType={
    id: number,
    parent?: number,
    username: string,
    message: string
}|null;
type LoginType={
    name: string,
    email: string
}
type SendType={
    message: string,
    type: CommentsType,
    reply_to?: number,
    parent?: number,
    posid: number,
    posurl: string,
    name?: string,
    email?: string,
    recaptcha?: string
}
interface PostSuccess<T> {
    error: number;
    msg: string;
    data: T;
}
type CommentType={
    recaptcha: string,
    data: DataResult|ReplyResult,
    parentId?: number,
    children?: React.ReactNode,
    onLoading:()=>void,
    onStopLoading:()=>void,
    isLoading: boolean,
    copyText: copyTextType,
    type: 'comment'|'reply',
    onReply: (params: ReplyValueType)=>void,
    anyReply: boolean,
    onDelete: (params: OnDeleteType)=>void,
    theme: Record<string,string>,
    PNpost:<R = any>(url: string, data?: {[key: string]: any;} | undefined, formData?: AxiosRequestConfig | undefined) => Promise<R>,
    linkTo:(path: string)=>void,
    totalReply?: number,
    setNotif:(type: boolean | "error" | "success" | "info", title: string, msg?: string | undefined, data?: { [key: string]: any;} | undefined) => void
}
export interface CommentsProps {
    /**
     * Type of content
     */
    type: CommentsType,
    /**
     * ID of content
     */
    posId: number,
    comment_id?: number,
    posUrl: string
}

const captchaRef =React.createRef<Recaptcha>();

export function Comments(props: CommentsProps){
    const {type,posId,comment_id,posUrl} = props
    const {PNgraph,PNpost} = useAPI();
    const context = React.useContext(AuthContext);
    const {setNotif,state} = context;
    const linkTo = useLinkTo();
    const theme = useTheme();
    const {copyText} = useClipboard();
    const com_id=comment_id||0;
    const {user} = state;
    const [reachEnd,setReachEnd]=React.useState<boolean>(false)
    const [loading,setLoading]=React.useState<string|number|null>('global')
    const [data,setData]=React.useState<Array<DataResult>>([]);
    const [loadingCom,setLoadingCom]=React.useState<string|number|null>(null)
    const [expand,setExpand]=React.useState<string|number|null>(null)
    const [recaptcha,setRecaptcha] = React.useState<string>("")
    const textRef=React.useRef<Input>(null)
    const textNameRef=React.useRef<Input>(null)
    const textEmailRef=React.useRef<Input>(null)
    const [value,setValue]=React.useState("")
    const [reply,setReply]=React.useState<ReplyValueType>(null)
    const [unLogin,setUnlogin]=React.useState<LoginType>({name:'',email:''});
    const modalRef = React.useRef<Modalize>();
    //const collapRef: React.Ref<CollapseClass> = React.useRef()

    const onReceiveToken=(token: string)=>{
        setRecaptcha(token)
    }

    const getComment=(lastid?: number)=>{
        setLoading('global')
        PNgraph<SuccessResult>("/graphql",gql`{
            comments(jenis:"${type}",id:"${posId}",last_id:${lastid||0},comment_id:${com_id}){
                total,
                data{
                    id,
                    komentar,
                    tanggal,
                    login,
                    delete_token,
                    total_reply,
                    nama,
                    user{
                        user_login,
                        user_nama,
                        gambar
                    },
                    reply{
                        komentar,
                        id,
                        login,
                        tanggal,
                        delete_token,
                        nama,
                        user{
                            user_nama,
                            user_login,
                            gambar
                        }
                    }
                }
            }
        }`).then((res: SuccessResult)=>{
            setLoading(null)
            const a: Array<DataResult> = typeof lastid==='undefined' ? [] : data;
            const server = res.comments.data.reverse();
            const b = Object.keys(server).map((index)=>{
                const i=Number(index);
                const reply = server[i].reply;
                server[i].reply = reply !== null ? reply.reverse() : null;
                return server[i];
            })
            //const b = res.comments.data.reverse();
            const c = a.concat(b);
            setReachEnd(res?.comments?.total === c?.length)
            setData(c);
        }).catch((err)=>{
            console.log(err)
        })
        .finally(()=>setLoading(null))
    }

    const getReplies=(comment_id: number,lastid?: number)=>{
        setLoading(`comment-${comment_id}`)
        PNgraph<SuccessReplyResult>(`/graphql`,gql`{
            comments_replies(jenis:"${type}",id:"${posId}",last_id:${lastid||0},comments_id:${comment_id}){
                total,
                data {
                    id,
                    komentar,
                    tanggal,
                    login,
                    delete_token,
                    nama,
                    user{
                        user_login,
                        user_nama,
                        gambar
                    }
                }
            }
        }`).then((res)=>{
            setLoading(null)
            const index=data.findIndex(item=>item?.id===comment_id);
            if(index !== -1) {
                const rep=data[index].reply
                const b = rep !==null ? rep : [];
                const c = res?.comments_replies?.data.reverse();
                const d = b.concat(c)
                let a=[...data];
                a[index]={
                    ...a[index],
                    total_reply:res?.comments_replies?.total,
                    reply:d
                }
                setData(a);
            }
        }).catch((err)=>{
            
        })
        .finally(()=>setLoading(null))
    }

    const handleReply=(params: ReplyValueType)=>{
        if(user===false) setNotif(true,"Error","Login to reply a comment")
        else {
            setReply(params)
            modalRef.current?.open('top');
            setTimeout(()=>{
                textRef?.current?.focus()
            },200)
        }
    }

    const handleSubmit=()=>{
        if(value?.match(/\S+/) === null) {
            setNotif(true,"Error","Comment cannot be empty");
        } else if((user===false || user===null) && (unLogin.name.length === 0 || unLogin.email.length === 0)) {
            setNotif(true,"Error","Name and email cannot be empty");
        } else {
            const send: SendType={
                message: value,
                type: type,
                posid: posId,
                posurl: posUrl
            }
            if(reply!==null){
                send.reply_to=reply.id;
                if(typeof reply.parent !== 'undefined') send.parent=reply?.parent
            }
            if(user===false||user===null){
                send.name= unLogin?.name;
                send.email=  unLogin?.email;
            }
            setLoading('send')
            if(reply===null) processComment(send)
            else processReply(send)
        }
    }

    const processComment=(send: SendType)=>{
        const dataInput = {
            ...send,
            recaptcha
        }
        PNpost<PostSuccess<DataResult>>(`/comments/add`,dataInput)
        .then(res=>{
            if(res.error===1) {
                setTimeout(()=>textRef?.current?.focus(),200);
            }
            else {
                setValue("")
                setReply(null)
                const b = [...data];
                b.unshift(res.data)
                setData(b);
                modalRef.current?.close('alwaysOpen')
            }
        })
        .catch(()=>{
            setTimeout(()=>textRef?.current?.focus(),200);
        }).finally(()=>{
            setLoading(null)
            captchaRef.current?.refreshToken()
        })
    }

    const processReply=(send: SendType)=>{
        const dataInput = {
            ...send,
            recaptcha
        }
        PNpost<PostSuccess<DataResult>>(`/comments/add`,dataInput)
        .then(res=>{
            if(res.error===1) {
                setTimeout(()=>textRef?.current?.focus(),200);
            }
            else {
                const id=reply!==null ? (typeof reply.parent !== 'undefined' ? reply.parent : reply.id) : 0;
                const index=data.findIndex(item=>item?.id===id);
                if(index!==-1) {
                    let c=[...data];
                    const rep=data[index].reply
                    const a: ReplyResult[]=rep !==null ? rep : [];
                    a.unshift(res.data)
                    c[index]={
                        ...c[index],
                        total_reply:c[index].total_reply+1,
                        reply:a
                    }
                    setData(c)
                    setValue("")
                    setReply(null)
                    modalRef.current?.close('alwaysOpen')
                }
            }
        })
        .catch(()=>{
            setTimeout(()=>textRef?.current?.focus(),200);
        }).finally(()=>{
            setLoading(null)
            captchaRef.current?.refreshToken()
        })
    }

    const handleDelete=(params: OnDeleteType)=>{
        if(params.type==='reply' && typeof params.parentId !== 'undefined') {
            const aa = params.parentId||0
            const ind=data.findIndex(item=>item?.id===aa);
            let b = data[ind].reply
            if(b!==null) {
                const index=b.findIndex(item=>item?.id===params.id);
                if(index!==-1) {
                    let a=[...data];
                    if(b.length===1) b=null;
                    else b.splice(index,1);
                    a[ind]={
                        ...a[ind],
                        total_reply:a[ind].total_reply-1,
                        reply:b
                    }
                    //console.log(a,b)
                    setData(a)
                }
            }
        } else {
            const index=data.findIndex(item=>item?.id===params.id);
            if(index!==-1) {
                let a = [...data];
                a.splice(index,1)
                setData(a)
            }
            
        }
    }

    React.useEffect(()=>{
        getComment();
    },[])

    const renderChild=({data,item,index, ii}: {data: DataResult,item:ReplyResult,index: number,ii: number})=>{

        return (
            <Comment 
                key={`reply-${ii}-${index}`}
                type='reply'
                data={item}
                isLoading={loadingCom===`reply-${ii}-${index}`}
                onLoading={()=>setLoadingCom(`reply-${ii}-${index}`)}
                onStopLoading={()=>setLoadingCom(null)}
                parentId={data?.id}
                onReply={handleReply}
                anyReply={false}
                onDelete={handleDelete}
                linkTo={linkTo}
                theme={theme}
                PNpost={PNpost}
                setNotif={setNotif}
                recaptcha={recaptcha}
                copyText={copyText}
            />
        )
    }
    const renderItem=({item,index} : {item: DataResult,index: number})=>{

        return (
            <Comment 
                key={`comment-${index}`}
                type='comment'
                data={item} 
                isLoading={loadingCom===`comment-${index}`}
                onLoading={()=>setLoadingCom(`comment-${index}`)}
                onStopLoading={()=>setLoadingCom(null)}
                onReply={handleReply}
                anyReply={item?.reply!==null}
                onDelete={handleDelete}
                linkTo={linkTo}
                theme={theme}
                PNpost={PNpost}
                setNotif={setNotif}
                recaptcha={recaptcha}
                copyText={copyText}
                totalReply={item.total_reply}
            >
                <FlatList
                    data={item.reply === null ? [] : item.reply}
                    renderItem={(props)=>renderChild({...props,ii:index,data: item})}
                    ListFooterComponent={()=><RenderHeaderChild item={item} />}
                    ListEmptyComponent={renderEmptyChild}
                    ItemSeparatorComponent={Divider}
                    keyExtractor={(item)=>item.id.toString()}
                />
            </Comment>
        )
    }

    const renderHeader=()=>{
        if(loading==='global') {
            return (
                <View>
                    <Skeleton imageSize={45} image number={data.length > 0 ? 4 : 12} height={data.length > 0 ? 300 : (height-50)} />
                </View>
            )
        } else if(!reachEnd) {
            return (
                <Pressable style={{padding:5}} disabled={loading !== null} onPress={()=>getComment(data[data.length-1].id)}>
                    <View style={{alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:12,color:theme['text-hint-color']}}>{i18n.t('load_more')}</Text>
                    </View>
                </Pressable>
            )
        }
        return null;
    }

    const RenderHeaderChild=({item}: {item: DataResult})=>{
        if(loading===`comment-${item.id}`) {
            return (
                <View style={{marginLeft:55}}>
                    <Skeleton imageSize={40} image number={2} height={200} />
                </View>
            )
        } else if(item?.reply!==null && item?.reply?.length < item?.total_reply) {
            return (
                <Pressable style={{padding:5}} disabled={loading !== null} onPress={()=>getReplies(item?.id,(item?.reply !== null ? item?.reply[item?.reply.length-1].id : 0))}>
                    <View style={{alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:12,color:theme['text-hint-color']}}>{i18n.t('load_more')}</Text>
                    </View>
                </Pressable>
            )
        }
        return null;
    }

    const renderEmptyChild=()=>(
        <View style={{alignItems:'center',paddingVertical:10}}>
            <Text style={{fontSize:13}} appearance="hint">{i18n.t('no_reply')}</Text>
        </View>
    )

    const renderEmpty=()=>{
        if(loading===null) {
            return (
                <View style={{alignItems:'center',paddingVertical:10}}>
                    <Text style={{fontSize:13}} appearance="hint">{i18n.t('no_comment')}</Text>
                </View>
            )
        }
        return null;
    }

    const onClose=()=>{
        textRef.current?.blur();
        textEmailRef.current?.blur();
        textNameRef.current?.blur();
        setReply(null)
    }

    const onPositionChange=(position: "top" | "initial")=>{
        if(position==='initial') {
            setReply(null)
        }
    }

    return (
        <>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item)=>item.id.toString()}
                ListFooterComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ItemSeparatorComponent={Divider}
                contentContainerStyle={{paddingBottom:55}}
                ListFooterComponentStyle={{paddingBottom:55}}
            />
            <Modalize 
                ref={modalRef}
                withHandle={false}
                modalStyle={{
                    backgroundColor:theme['background-basic-color-1'],
                    borderTopLeftRadius:15,borderTopRightRadius:15
                }}
                adjustToContentHeight
                alwaysOpen={54}
                onClosed={onClose}
                keyboardAvoidingBehavior="height"
                onPositionChange={onPositionChange}
                disableScrollIfPossible={false}
                scrollViewProps={{
                    keyboardShouldPersistTaps:'handled'
                }}
            >
                <Lay style={{borderTopLeftRadius:15,borderTopRightRadius:15}}>
                    <RenderHeader onSubmit={handleSubmit} modalRef={modalRef} reply={reply} setReply={setReply} value={value} setValue={setValue} unLogin={unLogin} setUnlogin={setUnlogin} loading={loading} textRef={textRef} textEmailRef={textEmailRef} textNameRef={textNameRef} />
                </Lay>
            </Modalize>
            <Recaptcha ref={captchaRef} onReceiveToken={onReceiveToken} />
        </>
    )
}

type HeaderProps = {
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    unLogin: LoginType,
    setUnlogin: React.Dispatch<React.SetStateAction<LoginType>>
    setReply: React.Dispatch<React.SetStateAction<ReplyValueType>>
    loading: string|number|null,
    textRef: React.RefObject<Input>,
    textNameRef: React.RefObject<Input>,
    textEmailRef: React.RefObject<Input>
    reply: ReplyValueType,
    modalRef: React.MutableRefObject<Modalize|undefined>
    onSubmit:()=>void
}
const RenderHeader=React.memo((props: HeaderProps)=>{
    const {value,setValue,unLogin,setUnlogin,loading,textRef,textEmailRef,textNameRef,reply,setReply,modalRef,onSubmit} = props;
    const context = React.useContext(AuthContext);
    const {state} = context;
    const {user} = state;
    const theme = useTheme();

    return (
        <Lay style={{borderTopLeftRadius:15,borderTopRightRadius:15}}>
                <Pressable default onPress={()=>modalRef?.current?.open("top")}>
                    <View style={{paddingHorizontal:15,paddingVertical:15,paddingBottom:25,justifyContent:'center',borderTopLeftRadius:15,borderTopRightRadius:15}}>
                        <Text>{i18n.t('add_type',{type:i18n.t('comments')})}</Text>
                    </View>
                </Pressable>
                {/*(
                    <View style={{backgroundColor:theme['color-primary-500'],paddingVertical:10}}>
                        <View style={{paddingHorizontal:15, flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                            <View>
                                <Text style={{color:'#fff'}}>{`@${reply.username}: ${Ktruncate(reply.message,50)}`}</Text>
                            </View>
                            <View>
                                <Text style={{color:'#fff'}}>X</Text>
                            </View>
                        </View>
                    </View>
                )*/}
                <View style={{paddingHorizontal:15,paddingBottom:20}}>
                    {user === false || user === null ? (
                        <React.Fragment>
                            <View>
                                <Input
                                    ref={textNameRef}
                                    value={unLogin?.name||''}
                                    onChangeText={(val)=>setUnlogin(prev=>({...prev,name:val}))}
                                    returnKeyType="next"
                                    label={i18n.t('form.name')}
                                    disabled={loading!==null}
                                    autoCompleteType="name"
                                    placeholder="John Doe"
                                    textContentType="name"
                                    enablesReturnKeyAutomatically
                                    blurOnSubmit={false}
                                    onSubmitEditing={()=>textEmailRef?.current?.focus()}
                                />
                            </View>
                            <View>
                                <Input
                                    ref={textEmailRef}
                                    value={unLogin?.email||''}
                                    onChangeText={(val)=>setUnlogin(prev=>({...prev,email:val}))}
                                    returnKeyType="next"
                                    label={i18n.t('form.email')}
                                    disabled={loading!==null}
                                    keyboardType="email-address"
                                    autoCompleteType="email"
                                    enablesReturnKeyAutomatically
                                    placeholder="example@portalnesia.com"
                                    textContentType="emailAddress"
                                    blurOnSubmit={false}
                                    onSubmitEditing={()=>textRef?.current?.focus()}
                                />
                            </View>
                        </React.Fragment>
                    ) : (
                        <View>
                            <Text>Commented as <Text>{`@${user.username}`}</Text></Text>
                        </View>
                    )}
                        <View style={{flexDirection:'row',alignItems:'flex-start'}}>
                            <View style={{marginRight:10,flex:1}}>
                                <Input
                                    ref={textRef}
                                    value={value}
                                    label={i18n.t('comments')}
                                    onChangeText={(val)=>setValue(val)}
                                    disabled={loading!==null}
                                    textStyle={{minHeight:100,maxHeight:100}}
                                    textAlignVertical="top"
                                    multiline
                                    autoCompleteType="off"
                                    textContentType="none"
                                    placeholder={reply !== null ? `Reply to @${reply.username}: ${Ktruncate(reply.message,50)}` :"Hello, John Doe. Type your comments here"}
                                />
                            </View>
                            <View>
                                <Button style={{marginTop:22}} disabled={loading!==null||value.match(/\S+/)===null} loading={loading==='send'} onPress={onSubmit} accessoryLeft={SendIcon} />
                                {reply !== null && <Button disabled={loading!==null} status="danger" style={{marginTop:5}} accessoryLeft={CloseIcon} onPress={()=>setReply(null)} /> }
                            </View>
                        </View>
                </View>
        </Lay>
    )
})

const MemoAvatar=React.memo(({item,type}: {item: DataResult|ReplyResult,type: 'comment'|'reply'})=>(
    <Avatar style={{marginRight:10,marginTop:5}} {...(item?.user?.gambar !== null ? {src:`${item?.user?.gambar}&size=40&watermark=no`} : {name:ucwords(item?.nama)})} size={40} />
))

//{data:dt,children,isLoading,type,isExpanded,parentId,onExpand,onReply,anyReply,onDelete,linkTo,setNotif,theme,PNpost}
type CommentState = {
    open: string|number|null,
    loading: boolean,
    expand: boolean
}
class Comment extends React.PureComponent<CommentType,CommentState>{
    swipeRef = React.createRef<Swipeable>();
    menu: Record<string,string>[] = [{type:"reply",title:i18n.t('reply')},{type:'copy',title:i18n.t('copy')}]
    modalRef = React.createRef<Modalize>();

    constructor(props: CommentType){
        super(props);
        
        this.state={
            open:null,
            loading:false,
            expand:false
        }
    }

    handleButton(){
        
    }

    onClose(){
        this.setState({open:null})
    }

    dialogDelete(){
        const {data:dt} = this.props;
        Alert.alert(
            "Are you sure?",
            `Delete ${Ktruncate(dt.komentar,50)}`,
            [{
                text:"Cancel",
                onPress:()=>{}
            },{
                text:"Delete",
                onPress:()=>this.handleDelete()
            }]
        )
    }

    handleDelete(){
        const {PNpost,setNotif,data:dt,onDelete,type,parentId,recaptcha}=this.props
        this.setState({loading:true});
        
        PNpost(`/comments/delete`,{token:dt?.delete_token,recaptcha}).then((res: any)=>{
            if(!res.error) {
                const params: OnDeleteType={
                    type:type,
                    id: dt?.id
                }
                if(type==='reply') params.parentId=parentId
                onDelete(params)
            }
        }).catch((err: any)=>{
            
        })
        .finally(()=>{
            this.setState({loading:false})
            captchaRef.current?.refreshToken()
        })
    }

    handleSwipe(){
        const {parentId,type,onReply,data:dt} = this.props;
        this.swipeRef.current?.close();
        if(type==='reply' && typeof parentId==='undefined') return;
        const rep: ReplyValueType={id:dt?.id,username:(dt.user.user_login !== null ? dt.user.user_login : dt?.nama),message:dt?.komentar}
        if(type==='reply') rep.parent=parentId
        onReply(rep)
    }

    handleMenu(name: string){
        const {parentId,data:dt,type,onReply,copyText} = this.props

        this.modalRef.current?.close();
        if(name==='copy' && dt?.komentar!==null){
            copyText(dt.komentar,i18n.t('text'));
        }
        else if(name==='delete' && dt?.delete_token !==null) {
            this.dialogDelete();
        } 
        else if(name==='reply') {
            if(type==='reply' && typeof parentId==='undefined') return;
            const rep: ReplyValueType={id:dt?.id,username:dt?.nama,message:dt?.komentar}
            if(type==='reply') rep.parent=parentId
            onReply(rep)
        }
        /*else if(name==='report') {
            
        }*/
    }

    leftSwipe(){
        const {theme} = this.props;
        return (
            <View style={{justifyContent:'center',alignItems:'center',width:width/2,paddingLeft:width/4,paddingRight:20,backgroundColor:theme['color-danger-500']}}>
                <Text style={{color:'#fff'}}>Reply</Text>
            </View>
        )
    }

    renderHeader(){
        const {theme} = this.props;
        return (
            <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
                <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
            </View>
        )
    }

    handleExpand(){
        //UIManager.setLayoutAnimationEnabledExperimental &&  UIManager.setLayoutAnimationEnabledExperimental(true)
        //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        this.setState(prev=>({...prev,expand:!prev.expand}));
    }

    render() {
        const {data:dt,isLoading,type,parentId,onReply,anyReply,onDelete,linkTo,setNotif,theme,PNpost,children,totalReply} = this.props
        const menu = [...this.menu];
        if(dt?.delete_token !== null) menu.splice(2,0,{type:'delete',title:i18n.t('delete')});
        return (
            <>
                <Swipeable
                    ref={this.swipeRef}
                    rightThreshold={(width/2)-50}
                    renderRightActions={this.leftSwipe.bind(this)}
                    onSwipeableRightOpen={()=>this.handleSwipe()}
                    overshootRight={false}
                >
                    <Lay>
                        <ListItem
                            style={{alignItems:'flex-start',...(type==='comment' ? {paddingVertical:12} : {paddingVertical:5,marginLeft:55})}}
                            accessoryLeft={()=><MemoAvatar item={dt} type={type} />}
                            title={(props?: TextProps)=>(
                                <View style={{alignItems:'flex-start'}}>
                                    <Text {...props} style={[props?.style,{fontSize:13,marginHorizontal:0,marginBottom:3,fontFamily:'Inter_SemiBold',textDecorationLine:"underline",...(dt?.user?.user_login !== null ? {color:theme['link-color']} : {})}]} {...(dt.user.user_login !== null ? {onPress:()=>linkTo(`/user/${dt.user.user_login}`)} : {})} >{dt.nama}</Text>
                                </View>
                            )}
                            description={(props?: TextProps)=>(
                                <View>
                                    <Text style={{fontSize:13}}>{dt?.komentar.replace(/&amp;/g, "\&")}</Text>
                                    <View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between'}}>
                                        <Text  {...props} style={[props?.style,{fontSize:10,marginHorizontal:0}]}>{dt.tanggal}</Text>
                                        {type==='comment' ? (
                                            <Text  {...props} style={[props?.style,{marginLeft:10,fontSize:10,marginHorizontal:0}]}>{`${totalReply} reply`}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            )}
                            accessoryRight={()=>(
                                <View style={{borderRadius:22,overflow:'hidden'}}>
                                    <Pressable style={{padding:10}} onPress={()=>this.modalRef.current?.open()}>
                                        <OptionIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                                    </Pressable>
                                </View>
                            )}
                            disabled={type==='reply'}
                            onPress={()=>type === 'comment' && this.handleExpand()}
                        />
                    </Lay>
                </Swipeable>
                {children && (
                    <Lay style={{paddingBottom:this.state.expand ? 12 : 0,height: this.state.expand ? undefined : 0,overflow:'hidden'}}>
                        {children}
                    </Lay>
                )}

                <Portal>
                    <Modalize
                        ref={this.modalRef}
                        withHandle={false}
                        modalStyle={{
                            backgroundColor:theme['background-basic-color-1'],
                        }}
                        adjustToContentHeight
                    >
                        <Lay style={{borderTopLeftRadius:20,borderTopRightRadius:20}}>
                            {this.renderHeader()}
                            <Lay style={{marginBottom:10}}>
                                <Menu appearance="noDivider">
                                    {menu.map((it,i)=>{
                                       return (
                                            <MenuItem style={{paddingHorizontal:12,paddingVertical:12}} key={`${i}`} title={ucwords(it.title)} onPress={()=>this.handleMenu(it.type)} />
                                        )
                                    })}
                                </Menu>
                            </Lay>
                        </Lay>
                    </Modalize>
                    <Backdrop loading visible={this.state.loading} />
                </Portal>
            </>
        )
    }
}

export type CommentButtonProps = {
    total: number,
    /**
     * Type of content
     */
    type: CommentsType,
     /**
      * ID of content
      */
    posId: number|string,
    comment_id?: number,
    posUrl: string,
    navigation: any,

}

export default class CommentButton extends React.PureComponent<CommentButtonProps> {
    constructor(props: CommentButtonProps){
        super(props)

        this.open=this.open.bind(this);
    }

    open(){
        const {navigation,type,posId,posUrl,comment_id} = this.props
        navigation.navigate("Comments",{type,posId,posUrl:`${URL}/${posUrl}`,comment_id})
    }

    render(){
        const {total} = this.props;

        return (
            <Pressable onPress={this.open} style={{paddingVertical:10,paddingHorizontal:15}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <Text category="h6">{i18n.t('comments')}</Text>
                    <Text>{total}</Text>
                </View>
            </Pressable>
        )
    }
}