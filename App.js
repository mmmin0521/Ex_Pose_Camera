import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import Svg, { Image } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withTiming } from 'react-native-reanimated';

export default function App() {
{/*카메라*/}
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  {/*배경 애니메이션 */}
  const { height, width } = Dimensions.get("window");
  const imagePosition = useSharedValue(1);

  {/*배경 올라오기*/}
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0,1], [-height/4,0])
    return {
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}]
    }
  })

  {/*원래 화면 내려가기*/}
  const buttonsAnimatedStyle = useAnimatedStyle(()=> {
    const interpolation = interpolate(imagePosition.value, [0,1],[250,0])
    return {
      opacity: withTiming(imagePosition.value, {duration: 500}),
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}]
    };
  });
  
  const bgHandler = () => {
    imagePosition.value = 0 
  }
  
  useEffect (() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []) 

  const takePicture = async () => {
    if(cameraRef) {
      try{
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
      } catch(e) {
        console.log(e);
      }
    }
  }  

  const saveImage = async()=> {
    if(image) {
      try{
        await MediaLibrary.createAssetAsync(image);
        alert('저장되었습니다')
        setImage(null);
      } catch(e) {
        console.log(e)
      }
    }
  }

  if(hasCameraPermission === false) {
    return <Text>카메라 접근 실패</Text>
  }
  
  return (
    <View style={styles.container}>
      {!image ?
      <Camera
      style={styles.camera}
      type={type}
      flashMode={flash}
      ref={cameraRef}
      >
        <View style={{ 
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 30,
        }}>
          <Button icon={'retweet'} onPress={() => {
            setType(type === CameraType.back ? CameraType.front : CameraType.back)
          }} />
          <Button icon={'flash'} 
          color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#f1f1f1'}
          onPress={() => {
            setFlash(flash===Camera.Constants.FlashMode.off
              ? Camera.Constants.FlashMode.on
              : Camera.Constants.FlashMode.off
            )
          }} />




</View>
      </Camera>
      :
      <Image source={{uri: image}} style={styles.camera}/>
      }

      <View>
        {image ?
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 50
        }}>
          <Button title={"뒤로"} icon="back" onPress={() => setImage(null)}/>
          <Button title={"저장"} icon="check" onPress={saveImage}/>
        </View>
        :
        <View>
        <Animated.View style={buttonsAnimatedStyle}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal:  30
        }}>
        <Button title={'갤러리'} icon="" onPress={takePicture}/>
        <Button title={'촬영'} icon="camera" onPress={takePicture}/>
        <Button title={'포즈'} icon="" onPress={bgHandler}/>
        </View>
        </Animated.View>
        </View>
        }
        </View>

     <View style={styles.background}>
      <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
        <Svg height={height} width={width}>
          <Image
          href={require("./assets/background.png")}
          width={width}
          height={height}
          preserveASpectRatio="xMidYMid slice"/>
        </Svg>
{/*
        <Image
      href={require("./assets/test1.png")}
      width= {40}
      height={40}/> */}
{/*
        <View style={styles.closebutton}> 닫힘 버튼이 아이콘,텍스트 다 안됨...
          <Text>X</Text>
        </View>*/}
      </Animated.View>

      
      </View>
{/*
      <View>
<Image
      href={require("./assets/test1.png")}
      width={width}
      height={height}/> </View>  */}
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom: 20
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  }
});

