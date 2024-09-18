/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  useCameraDevices,
  useMicrophonePermission,
  Camera,
} from 'react-native-vision-camera';

function App(): JSX.Element {
  const {hasPermission, requestPermission} = useCameraPermission();

  useEffect(() => {
    requestPermission().then(res => {
      if (res) {
        console.log('user has given permission');
      } else {
        console.log('permisiion denied');
      }
    });
  }, []);

  const device: any = useCameraDevice('back');
  if (device === null) return <View />;

  return (
    <View>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
    </View>
  );
}

export default App;
