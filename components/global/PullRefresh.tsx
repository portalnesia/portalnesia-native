import React from 'react'
import { View, ViewStyle } from 'react-native'
import {Layout,Text} from '@ui-kitten/components'
import { AuthContext } from '@pn/provider/Context';
import LottieView from 'lottie-react-native';
import PullToRefresh,{PullToRefreshHeaderProps,Props as PullToRefreshProps} from 'react-native-pull-to-refresh-custom'

export interface PullRefreshProps {
    refreshing: boolean;
    onRefresh(): void;
}

type HeaderState = {
    pullDistance: number,
    percent: number
}

interface HeaderClassProps extends PullToRefreshHeaderProps {
    theme: string
}

class HeaderClass extends React.PureComponent<HeaderClassProps,HeaderState> {
    lottie = React.createRef<LottieView>();

    constructor(props: HeaderClassProps) {
        super(props);
        this.state = {
            pullDistance:props.pullDistance,
            percent: props.percent
        }
    }

    componentDidUpdate(prevProps: HeaderClassProps) {
        if(prevProps.pullDistance !== this.props.pullDistance) {
            this.setState({pullDistance:this.props.pullDistance})
        }
        if(prevProps.percent !== this.props.percent) {
            this.setState({percent:this.props.percent})
        }
        if(prevProps.refreshing !== this.props.refreshing) {
            if(this.props.refreshing) {
                this.lottie.current?.play();
            }
        }
    }

    setProgress({pullDistance,percent}: {pullDistance:number,percent:number}) {
        this.setState({
            pullDistance,
            percent
        })
    }

    render() {
        const {theme} = this.props;
        const {percent,pullDistance} = this.state

        //const progress = (0.4*percent)/1
        //console.log(progress)

        return (
            <Layout level="2" style={{justifyContent:'center',alignItems: 'center'}}>
                <LottieView
                    ref={this.lottie}
                    style={{height:100}}
                    source={theme==='dark' ? require('@pn/assets/animation/spinner-dark.json') : require('@pn/assets/animation/spinner-light.json')}
                />
            </Layout>
        )
    }
}

const Header=React.forwardRef<HeaderClass,PullToRefreshHeaderProps>((props,ref)=>{
    const context = React.useContext(AuthContext);
    const {theme} = context;

    return <HeaderClass ref={ref} {...props} theme={theme} />
})

function PullRefreshComp({...props}: PullToRefreshProps) {
    return (
        <PullToRefresh
            HeaderComponent={Header}
            headerHeight={100}
            style={{flex:1}}
            {...props}
        />
    )
}

const PullRefresh = React.memo(PullRefreshComp);
export default PullRefresh;