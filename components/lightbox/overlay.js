import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {PanGestureHandler,State,GestureHandlerRootView} from 'react-native-gesture-handler'

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;
const DRAG_DISMISS_THRESHOLD = 150;
const isIOS = Platform.OS === "ios";

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  open: {
    position: "absolute",
    flex: 1,
    justifyContent: "center",
    // Android pan handlers crash without this declaration:
    backgroundColor: "transparent",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    backgroundColor: "transparent",
  },
  closeButton: {
    fontSize: 35,
    color: "white",
    lineHeight: 60,
    width: 70,
    textAlign: "center",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 1.5,
    shadowColor: "black",
    shadowOpacity: 0.8,
  },
});

//const WrapperView = gestureHandlerRootHOC(Modal)

const LightboxOverlay = (props) => {
  const _panResponder = useRef();
  const pan = useRef(new Animated.Value(0));
  const openVal = useRef(new Animated.Value(0));

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [target, setTarget] = useState({
    x: 0,
    y: 0,
    opacity: 1,
  });

  useEffect(() => {
    _panResponder.current = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => !isAnimating,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => !isAnimating,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !isAnimating,

      onPanResponderGrant: (evt, gestureState) => {
        pan.current.setValue(0);
        setIsPanning(true);
      },
      onPanResponderMove: (evt,gestureState)=>{
        const touch = evt.nativeEvent.touches
        if(touch?.length === 1) {
          return Animated.event([null, { dy: pan.current }], {
            useNativeDriver: false,
          })(evt,gestureState)
        } else {
          return false
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > DRAG_DISMISS_THRESHOLD) {
          setIsPanning(false);
          setTarget({
            y: gestureState.dy,
            x: gestureState.dx,
            opacity: 1 - Math.abs(gestureState.dy / WINDOW_HEIGHT),
          });

          close();
        } else {
          Animated.spring(pan.current, {
            toValue: 0,
            ...props.springConfig,
            useNativeDriver: false,
          }).start(() => setIsPanning(false));
        }
      },
    });
  }, []);

  useEffect(() => {
    if (props.isOpen) {
      open();
    }
  }, [props.isOpen]);

  open = () => {
    if (isIOS) {
      StatusBar.setHidden(true, "fade");
    }

    pan.current.setValue(0);

    setIsAnimating(true);
    setTarget({
      x: 0,
      y: 0,
      opacity: 1,
    });

    Animated.spring(openVal.current, {
      toValue: 1,
      ...props.springConfig,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false);
      props.didOpen();
    });
  };

  close = () => {
    props.willClose();
    if (isIOS) {
      StatusBar.setHidden(false, "fade");
    }

    setIsAnimating(true);
    Animated.spring(openVal.current, {
      toValue: 0,
      ...props.springConfig,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false);
    });

    // TODO delay when close
    setTimeout(props.onClose, 200);
  };

  const lightboxOpacityStyle = {
    opacity: openVal.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0, target.opacity],
    }),
  };

  let handlers;
  if (props.swipeToDismiss && _panResponder.current) {
    handlers = _panResponder.current.panHandlers;
  }

  let dragStyle;
  if (isPanning) {
    dragStyle = {
      top: pan.current,
    };
    lightboxOpacityStyle.opacity = pan.current.interpolate({
      inputRange: [-WINDOW_HEIGHT, 0, WINDOW_HEIGHT],
      outputRange: [0, 1, 0],
    });
  }

  const openStyle = [
    styles.open,
    {
      left: openVal.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.origin.x, target.x],
      }),
      top: openVal.current.interpolate({
        inputRange: [0, 1],
        outputRange: [
          props.origin.y,
          target.y,
        ],
      }),
      width: openVal.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.origin.width, WINDOW_WIDTH],
      }),
      height: openVal.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.origin.height, WINDOW_HEIGHT],
      }),
    },
  ];

  const background = (
    <Animated.View
      style={[
        styles.background,
        { backgroundColor: props.backgroundColor },
        lightboxOpacityStyle,
      ]}
    ></Animated.View>
  );
  const header = (
    <Animated.View style={[styles.header, lightboxOpacityStyle]}>
      {props.renderHeader ? (
        props.renderHeader(close)
      ) : (
        <TouchableOpacity onPress={close}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
  
  const content = (
    <Animated.View style={[openStyle, dragStyle]} {...handlers}>
        {props.renderContent}
    </Animated.View>
  );

  return (
    <Modal
        visible={props.isOpen}
        transparent={true}
        onRequestClose={() => close()}
        
    >
        <GestureHandlerRootView>
            {background}
            {content}
            {header}
        </GestureHandlerRootView>
    </Modal>
  );
};

LightboxOverlay.defaultProps = {
  springConfig: { tension: 30, friction: 7 },
  backgroundColor: "black",
};

export default LightboxOverlay;
