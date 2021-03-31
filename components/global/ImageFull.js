import React from "react";
import {
  Image,
  View,
  StyleSheet,
  TouchableHighlight,
  Animated
} from "react-native";
import {Text,useTheme} from '@ui-kitten/components'
import {PinchGestureHandler,State} from 'react-native-gesture-handler'
import FastImage from 'react-native-fast-image'

const AnimImage = Animated.createAnimatedComponent(FastImage)

const defaultImageStyle = { resizeMode: "cover" };
const emptyObject = {};

const styles = StyleSheet.create({
  image: { resizeMode: "cover" },
  errorBox: {
    borderWidth: 1,
    borderColor: "lightgray",
    overflow: "hidden",
    justifyContent: "center",
  },
  errorText: { textAlign: "center", fontStyle: "italic" },
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  imageOverlay:{
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0
  }
});

function extractImgStyleProps({ resizeMode, tintColor, overlayColor }) {
  return {
    resizeMode,
    tintColor,
    overlayColor,
  };
}

function attemptParseFloat(value) {
  const result = parseFloat(value);
  return Number.isNaN(result) ? null : result;
}

function normalizeSize(dimension, options = {}) {
  const containerDimension = options.containerDimension || null;
  const enablePercentWidth = options.enablePercentWidth || false;
  if (
    dimension === null ||
    dimension === undefined ||
    Number.isNaN(dimension)
  ) {
    return null;
  }
  if (typeof dimension === "number") {
    return dimension;
  }
  if (typeof dimension === "string") {
    if (
      dimension.search("%") !== -1 &&
      enablePercentWidth &&
      typeof containerDimension === "number"
    ) {
      const parsedFloat = attemptParseFloat(dimension);
      if (parsedFloat === null || Number.isNaN(parsedFloat)) {
        return null;
      }
      return (parsedFloat * containerDimension) / 100;
    } else if (dimension.trim().match(/^[\d.]+$/)) {
      return attemptParseFloat(dimension);
    }
  }
  return null;
}

function extractHorizontalSpace({
  marginHorizontal,
  leftMargin,
  rightMargin,
  margin,
} = {}) {
  const realLeftMargin = leftMargin || marginHorizontal || margin || 0;
  const realRightMargin = rightMargin || marginHorizontal || margin || 0;
  return realLeftMargin + realRightMargin;
}

function derivePhysicalDimensionsFromProps({
  width,
  height,
  contentWidth,
  enableExperimentalPercentWidth: enablePercentWidth,
}) {
  const normalizeOptionsWidth = {
    enablePercentWidth,
    containerDimension: contentWidth,
  };
  const normalizeOptionsHeight = {
    enablePercentWidth: false,
  };
  const widthProp = normalizeSize(width, normalizeOptionsWidth);
  const heightProp = normalizeSize(height, normalizeOptionsHeight);
  return {
    width: widthProp,
    height: heightProp,
  };
}

function deriveRequiredDimensionsFromProps({
  enablePercentWidth,
  contentWidth,
  flatStyle,
  physicalDimensionsFromProps,
}) {
  const normalizeOptionsWidth = {
    enablePercentWidth,
    containerDimension: contentWidth,
  };
  const normalizeOptionsHeight = {
    enablePercentWidth: false,
  };
  const styleWidth = normalizeSize(flatStyle.width, normalizeOptionsWidth);
  const styleHeight = normalizeSize(flatStyle.height, normalizeOptionsHeight);
  return {
    width:
      typeof styleWidth === "number"
        ? styleWidth
        : physicalDimensionsFromProps.width,
    height:
      typeof styleHeight === "number"
        ? styleHeight
        : physicalDimensionsFromProps.height,
  };
}

function scaleUp(minDimensions, desiredDimensions) {
  const aspectRatio = desiredDimensions.width / desiredDimensions.height;
  if (desiredDimensions.width < minDimensions.width) {
    return scaleUp(minDimensions, {
      width: minDimensions.width,
      height: minDimensions.width / aspectRatio,
    });
  }
  if (desiredDimensions.height < minDimensions.height) {
    return scaleUp(minDimensions, {
      height: minDimensions.height,
      width: minDimensions.height * aspectRatio,
    });
  }
  return desiredDimensions;
}

function scaleDown(maxDimensions, desiredDimensions) {
  const aspectRatio = desiredDimensions.width / desiredDimensions.height;
  if (desiredDimensions.width > maxDimensions.width) {
    return scaleDown(maxDimensions, {
      width: maxDimensions.width,
      height: maxDimensions.width / aspectRatio,
    });
  }
  if (desiredDimensions.height > maxDimensions.height) {
    return scaleDown(maxDimensions, {
      height: maxDimensions.height,
      width: maxDimensions.height * aspectRatio,
    });
  }
  return desiredDimensions;
}

function scale({ minBox, maxBox }, originalBox) {
  return scaleDown(maxBox, scaleUp(minBox, originalBox));
}

function sourcesAreEqual(source1, source2) {
  return (
    (source1 && source2 && source1.uri === source2.uri) || source1 === source2
  );
}

function identity(arg) {
  return arg;
}

function computeImageBoxDimensions(params) {
  const {
    computeImagesMaxWidth,
    contentWidth,
    flattenStyles,
    imagePhysicalWidth,
    imagePhysicalHeight,
    requiredWidth,
    requiredHeight,
  } = params;
  const horizontalSpace = extractHorizontalSpace(flattenStyles);
  const {
    maxWidth = Infinity,
    maxHeight = Infinity,
    minWidth = 0,
    minHeight = 0,
  } = flattenStyles;
  const imagesMaxWidth =
    typeof contentWidth === "number"
      ? computeImagesMaxWidth(contentWidth)
      : Infinity;
  const minBox = {
    width: minWidth,
    height: minHeight,
  };
  const maxBox = {
    width:
      Math.min(
        imagesMaxWidth,
        maxWidth,
        typeof requiredWidth === "number" ? requiredWidth : Infinity
      ) - horizontalSpace,
    height: Math.min(
      typeof requiredHeight === "number" ? requiredHeight : Infinity,
      maxHeight
    ),
  };
  if (typeof requiredWidth === "number" && typeof requiredHeight === "number") {
    return scale(
      { minBox, maxBox },
      {
        width: requiredWidth,
        height: requiredHeight,
      }
    );
  }
  if (imagePhysicalWidth != null && imagePhysicalHeight != null) {
    return scale(
      { minBox, maxBox },
      {
        width: imagePhysicalWidth,
        height: imagePhysicalHeight,
      }
    );
  }
  return null;
}

const HTMLImageElement = class HTMLImageElement extends React.Component {
  __cachedFlattenStyles;
  __cachedRequirements;
  __cachedPhysicalDimensionsFromProps;
  mounted = false;

  thumbnailAnimated = new Animated.Value(0)
  imageAnimated = new Animated.Value(0)
  scaleZoom = new Animated.Value(1)

  constructor(props) {
    super(props);
    this.invalidateRequirements(props);
    const state = {
      imagePhysicalWidth: this.__cachedPhysicalDimensionsFromProps.width,
      imagePhysicalHeight: this.__cachedPhysicalDimensionsFromProps.height,
      requiredWidth: this.__cachedRequirements.width,
      requiredHeight: this.__cachedRequirements.height,
      imageBoxDimensions: null,
      error: false,
    };
    this.state = {
      ...state,
      imageBoxDimensions: this.computeImageBoxDimensions(props, state),
    };

  }

  static defaultProps = {
    enableExperimentalPercentWidth: false,
    computeImagesMaxWidth: identity,
    imagesInitialDimensions: {
      width: 100,
      height: 100,
    },
    thumbnail:undefined,
    style: {},
    zoomable:false,
    animated:true
  };

  invalidateRequirements(props) {
    const { contentWidth, enableExperimentalPercentWidth, style } = props;
    const physicalDimensionsFromProps = derivePhysicalDimensionsFromProps(
      props
    );
    this.__cachedFlattenStyles = StyleSheet.flatten(style) || emptyObject;
    this.__cachedPhysicalDimensionsFromProps = physicalDimensionsFromProps;
    this.__cachedRequirements = deriveRequiredDimensionsFromProps({
      contentWidth,
      enablePercentWidth: enableExperimentalPercentWidth,
      flatStyle: this.__cachedFlattenStyles,
      physicalDimensionsFromProps,
    });
  }

  computeImageBoxDimensions(props, state) {
    const { computeImagesMaxWidth, contentWidth } = props;
    const {
      imagePhysicalWidth,
      imagePhysicalHeight,
      requiredWidth,
      requiredHeight,
    } = state;
    const imageBoxDimensions = computeImageBoxDimensions({
      flattenStyles: this.__cachedFlattenStyles,
      computeImagesMaxWidth,
      contentWidth,
      imagePhysicalWidth,
      imagePhysicalHeight,
      requiredWidth,
      requiredHeight,
    });
    return imageBoxDimensions;
  }

  componentDidMount() {
    this.mounted = true;
    //this.fetchPhysicalImageDimensions();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const sourceHasChanged = !sourcesAreEqual(
      prevProps.source,
      this.props.source
    );
    const requirementsHaveChanged =
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.style !== this.props.style;
    const shouldRecomputeImageBox =
      requirementsHaveChanged ||
      this.state.imagePhysicalWidth !== prevState.imagePhysicalWidth ||
      this.state.imagePhysicalHeight !== prevState.imagePhysicalHeight ||
      this.props.contentWidth !== prevProps.contentWidth ||
      this.props.computeImagesMaxWidth !== prevProps.computeImagesMaxWidth;

    if (requirementsHaveChanged) {
      this.invalidateRequirements(this.props);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        requiredWidth: this.__cachedRequirements.width,
        requiredHeight: this.__cachedRequirements.height,
      });
    }
    /*if (sourceHasChanged) {
      if (
        this.__cachedRequirements.width === null ||
        this.__cachedRequirements.height === null
      ) {
        this.fetchPhysicalImageDimensions();
      }
    }*/
    if (shouldRecomputeImageBox) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((state, props) => ({
        imageBoxDimensions: this.computeImageBoxDimensions(props, state),
      }));
    }
  }

  onFastImageLoad(e){
    const {nativeEvent} = e
    //console.log(nativeEvent)
    const {width:imagePhysicalWidth,height:imagePhysicalHeight}=nativeEvent;
    this.setState({imagePhysicalHeight,imagePhysicalWidth,error:false});
  }

  fetchPhysicalImageDimensions(props = this.props) {
    const { source } = props;
    const shouldFetchFromImgAPI = !!source?.uri;
    if (
      this.__cachedPhysicalDimensionsFromProps.width != null &&
      this.__cachedPhysicalDimensionsFromProps.height != null
    ) {
      this.setState({
        imagePhysicalWidth: this.__cachedPhysicalDimensionsFromProps.width,
        imagePhysicalHeight: this.__cachedPhysicalDimensionsFromProps.height,
      });
    } else if (shouldFetchFromImgAPI) {
      Image.getSize(
        source.uri,
        (imagePhysicalWidth, imagePhysicalHeight) => {
          this.mounted &&
            this.setState({
              imagePhysicalWidth,
              imagePhysicalHeight,
              error: false,
            });
        },
        () => {
          this.mounted && this.setState({ error: true });
        }
      );
    } else {
        const {height:imagePhysicalHeight,width:imagePhysicalWidth} = Image.resolveAssetSource(source)
        if(this.mounted) {
            this.setState({
                imagePhysicalWidth,
                imagePhysicalHeight,
                error: false,
              });
        }
    }
  }

  shouldComponentUpdate(nextProps,nextState) {
    if(nextProps.source !== this.props.source) return true;
    if(nextState.imageBoxDimensions !== this.state.imageBoxDimensions
      || nextState.imagePhysicalWidth !== this.state.imagePhysicalWidth
      || nextState.imagePhysicalHeight !== this.state.imagePhysicalHeight
      || nextState.error !== this.state.error) return true;
    return false;
  }

  thumbnailLoaded=()=>{
    Animated.timing(this.thumbnailAnimated,{
      toValue:1,
      useNativeDriver:true
    }).start()
  }

  imageLoaded=()=>{
    const {imageBoxDimensions} = this.state
    if(imageBoxDimensions !== null) {
      Animated.timing(this.thumbnailAnimated,{
        toValue:0,
        useNativeDriver:true
      }).start(()=>{
        Animated.timing(this.imageAnimated,{
          toValue:1,
          useNativeDriver:true
        }).start()
      })
    }
  }

  onPinchEvent = Animated.event(
    [
      {
        nativeEvent:{scale:this.scaleZoom}
      }
    ],
    {
      useNativeDriver:true
    }
  )

  onPinchStateChange = event => {
    if(event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.scaleZoom,{
        toValue:1,
        useNativeDriver:true
      }).start()
    }
  }

  renderImage(imageStyles) {
    const { source,thumbnail,contentWidth,theme,zoomable,animated } = this.props;
    const {imageBoxDimensions} = this.state
    const withThumbnail=thumbnail && (imageBoxDimensions === null || (imageBoxDimensions !== null && imageBoxDimensions?.width >= contentWidth))
    if(withThumbnail) {
      return (
        <>
          <Animated.Image
            source={thumbnail}
            style={[defaultImageStyle, imageStyles,{...(imageBoxDimensions !== null ? {...imageBoxDimensions} : {width:contentWidth,height:contentWidth}),opacity:animated ? this.thumbnailAnimated : 1}]}
            testID="image-layout-thumbnail"
            blurRadius={5}
            onLoadStart={animated ? this.thumbnailLoaded : undefined}
          />
          {zoomable ? (
              <PinchGestureHandler
                onGestureEvent={this.onPinchEvent}
                onHandlerStateChange={this.onPinchStateChange}
              >
                <AnimImage
                  source={source}
                  onError={() => this.setState({ error: true })}
                  style={[styles.imageOverlay,defaultImageStyle, imageBoxDimensions, imageStyles,{opacity:this.imageAnimated,transform:[{scale:this.scaleZoom}]}]}
                  testID="image-layout"
                  onLoadEnd={()=>animated && this.imageLoaded()}
                  onLoad={(e)=>this.onFastImageLoad(e)}
                />
              </PinchGestureHandler>
            ) : (
              <AnimImage
                source={source}
                onError={() => this.setState({ error: true })}
                style={[styles.imageOverlay,defaultImageStyle, imageBoxDimensions, imageStyles,{opacity:animated ? this.imageAnimated : 1}]}
                testID="image-layout"
                onLoadEnd={()=>animated && this.imageLoaded()}
                onLoad={(e)=>this.onFastImageLoad(e)}
              />
            )}
        </>
      );
    } else {
      if(zoomable) {
        return (
            <AnimImage
              source={source}
              onError={() => this.setState({ error: true })}
              style={[defaultImageStyle, imageStyles,{...(imageBoxDimensions !== null ? {...imageBoxDimensions} : {width:contentWidth,height:contentWidth,backgroundColor:theme['background-basic-color-2']}),opacity:animated ? this.imageAnimated : 1}]}
              testID="image-layout"
              onLoadEnd={()=>animated && this.imageLoaded()}
              onLoad={(e)=>this.onFastImageLoad(e)}
            />
        )
      } else {
        return (
          <AnimImage
            source={source}
            onError={() => this.setState({ error: true })}
            style={[defaultImageStyle, imageStyles,{...(imageBoxDimensions !== null ? {...imageBoxDimensions} : {width:contentWidth,height:contentWidth,backgroundColor:theme['background-basic-color-2']}),opacity:animated ? this.imageAnimated : 1}]}
            testID="image-layout"
            onLoadEnd={()=>animated && this.imageLoaded()}
            onLoad={(e)=>this.onFastImageLoad(e)}
          />
        );
      }
    }
    
  }

  renderAlt() {
    const imageBoxDimensions = this.computeImageBoxDimensions(
      this.props,
      this.state
    );
    return (
      <View
        style={[
          styles.errorBox,
          {
            height:
              imageBoxDimensions?.height ||
              this.props.imagesInitialDimensions.height,
            width:
              imageBoxDimensions?.width ||
              this.props.imagesInitialDimensions.width,
          },
        ]}
        testID="image-error"
      >
        {this.props.alt ? (
          <Text style={[styles.errorText, { color: this.props.altColor }]}>
            {this.props.alt}
          </Text>
        ) : (
          false
        )}
      </View>
    );
  }

  /*renderPlaceholder() {
    return (
      <View
        style={this.props.imagesInitialDimensions}
        testID="image-placeholder"
      />
    );
  }*/

  renderContent(imgStyles) {
    const { error } = this.state;
    if (error) {
      return this.renderAlt();
    }
    return this.renderImage(imgStyles);
  }

  render() {
    const { width, height, ...remainingStyle } = this.__cachedFlattenStyles;
    const imgStyles = extractImgStyleProps(remainingStyle);
    const style = [styles.container, remainingStyle];
    if (this.props.onPress) {
      return (
        <TouchableHighlight onPress={this.props.onPress} style={style}>
          {this.renderContent(imgStyles)}
        </TouchableHighlight>
      );
    }
    return <View style={style}>{this.renderContent(imgStyles)}</View>;
  }
};

export default React.memo(function(props){
  const theme = useTheme();
  return <HTMLImageElement theme={theme} {...props} />
})