import React, {
    Children,
    cloneElement,
    useState,
    useRef,
  } from "react";
  import { Animated, TouchableOpacity, View } from "react-native";
  import LightboxOverlay from "./overlay";
  
  const Lightbox = (props) => {
    const layoutOpacity = useRef(new Animated.Value(1));
    const _root = useRef();
  
    const [isOpen, setIsOpen] = useState(false);
    const [origin, setOrigin] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  
    getContent = () => {
      if (props.renderContent) {
        return props.renderContent;
      } else if (props.activeProps) {
        return cloneElement(Children.only(props.children), props.activeProps);
      }
      return props.children;
    };
  
    getOverlayProps = () => ({
      isOpen: isOpen,
      origin: origin,
      renderHeader: props.renderHeader,
      swipeToDismiss: props.swipeToDismiss,
      springConfig: props.springConfig,
      backgroundColor: props.backgroundColor,
      children: getContent(),
      didOpen: props.didOpen,
      willClose: props.willClose,
      onClose: onClose,
      renderContent:props.renderContent
    });
  
    open = () => {
      _root.current.measure((ox, oy, width, height, px, py) => {
        props.onOpen();
  
        setIsOpen(props.navigator ? true : false);
        setOrigin({
          width,
          height,
          x: px,
          y: py,
        });
  
        props.didOpen();
  
        setIsOpen(true);
  
        setTimeout(() => {
          _root && _root.current && layoutOpacity.current.setValue(0);
        });
      });
    };
  
    close = () => {
      throw new Error(
        "Lightbox.close method is deprecated. Use renderHeader(close) prop instead."
      );
    };
  
    onClose = () => {
      layoutOpacity.current.setValue(1);
  
      setIsOpen(false);
  
      props.onClose && props.onClose();
    };
  
    return (
      <View ref={_root} style={props.style} onLayout={props.onLayout}>
        <Animated.View style={{ opacity: layoutOpacity.current }}>
          <TouchableOpacity
            underlayColor={props.underlayColor}
            onPress={open}
            onLongPress={props.onLongPress}
            activeOpacity={0.7}
          >
            {props.children}
          </TouchableOpacity>
        </Animated.View>
         <LightboxOverlay {...getOverlayProps()} />
      </View>
    );
  };
  
  Lightbox.defaultProps = {
    swipeToDismiss: true,
    onOpen: () => {},
    didOpen: () => {},
    willClose: () => {},
    onClose: () => {},
    onLongPress: null, // in andriod mobile, e.g HuaWei Nova5 Plus+, onPress will not work well
    onLayout: () => {}
  };
  
  export default Lightbox;
  