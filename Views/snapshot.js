import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Constants from 'expo-constants';
import {Camera, CameraType} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './button';
import {FileSystem} from 'react-native-unimodules';
import appStyles from "../Style/app";
import {useNavigation} from '@react-navigation/native';
import {manipulateAsync} from 'expo-image-manipulator';
import {launchImageLibraryAsync} from "expo-image-picker";


const Snapshot = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  // Demander la permission d'accès à la caméra
  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  const getGallery = async () => {
    try {
      const response = await launchImageLibraryAsync(
          {
            mediaType: 'photo',
            quality: 0.8,
          },
      );
      console.log('Image sélectionnée :', response);

      if (!response.canceled) {
        // Compression de l'image sélectionnée
        await compressImage(response.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const compressImage = async (uri) => {
    try {
      const compressedImage = await manipulateAsync(
          uri,
          [{resize: {width: 800, height: 800}}],
          {format: 'jpeg', compress: 0.8}
      );
      setImage(compressedImage.uri);
    } catch (error) {
      console.log(error);
    }
  };


  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        compressImage(data.uri);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const codePicture = async () => {
    if (image) {
      try {
        const uri = image;

        const base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Naviguer vers la page UserList avec l'image compressée en base64
        navigation.navigate('UserList', { base64Image, onNavigateBack: () => {
          setImage(null);
          } });

      } catch (error) {
        console.log(error);
      }
    }
  };

  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        alert('Picture saved! 🎉');
        console.log('saved successfully');
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (hasCameraPermission === false) {
    return <Text>Please grant us access to the camera first</Text>;
  }

  return (
      <View style={styles.container}>
        <TouchableOpacity
            style={[appStyles.button, appStyles.profileButton]}
            onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[appStyles.buttonText, appStyles.center]}>Profil</Text>
        </TouchableOpacity>
        {!image ? (
            <Camera
                style={styles.camera}
                type={type}
                ref={cameraRef}
                flashMode={flash}
            >
              <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 30,
                  }}
              >
                <Button
                    title=""
                    icon="retweet"
                    onPress={() => {
                      setType(
                          type === CameraType.back ? CameraType.front : CameraType.back
                      );
                    }}
                />
                <Button
                    onPress={() =>
                        setFlash(
                            flash === Camera.Constants.FlashMode.off
                                ? Camera.Constants.FlashMode.on
                                : Camera.Constants.FlashMode.off
                        )
                    }
                    icon="flash"
                    color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#fff'}
                />
              </View>
            </Camera>
        ) : (
          image !== null && <Image source={{ uri: image }} style={styles.camera} />
        )}

        <View style={styles.controls}>
          {image ? (
              <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 50,
                  }}
              >
                <Button title="Re-take" onPress={() => setImage(null)} icon="retweet" />
                <Button title="Save" onPress={savePicture} icon="check" />
                <Button title="Send" onPress={codePicture} icon="send" />
              </View>
          ) : (
              <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 50,
              }}
              >
              <Button title="Take a picture" onPress={takePicture} icon="camera" />
              <Button title="Gallery" onPress={getGallery} icon="photo" />
              </View>
          )}
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
    padding: 8,
  },
  controls: {
    flex: 0.5,
  },
  button: {
    height: 40,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E9730F',
    marginLeft: 10,
  },
  camera: {
    flex: 5,
    borderRadius: 20,
  },
  topControls: {
    flex: 1,
  },
});

export default Snapshot;
