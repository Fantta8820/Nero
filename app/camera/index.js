import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Camera } from 'expo-camera/legacy';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Link } from 'expo-router';

export default function App() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [hasPermissionCamera, setHasPermissionCamera] = useState(null);
  const [hasPermissionMedia, setHasPermissionMedia] = useState(null);
  const [hasPermissionLocation, setHasPermissionLocation] = useState(null);
  const [photoInfo, setPhotoInfo] = useState(null);
  const [open, setOpen] = useState(null);
  const [infoOpen, setInfoOpen] = useState(null);
  const [location, setLocation] = useState(null);
  const [infoLocation, setInfoLocation] = useState(null);
  const camRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermissionCamera(status === 'granted');
    })();

    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermissionMedia(status === 'granted');
    })();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermissionLocation(status === 'granted');
    })();
  }, []);

  if (hasPermissionCamera === null || hasPermissionMedia === null || hasPermissionLocation === null) {
    return <View />;
  }

  if (!hasPermissionCamera || !hasPermissionMedia || !hasPermissionLocation) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 30 }}>Acesso Negado!</Text>
        <Link href="../" style={{paddingTop: 20}}>
          <Entypo name="home" size={32} color="black" />
        </Link>
      </View>
    );
  }

  async function takePicture() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      setPhotoInfo(data);

      setOpen(true);
    }
  }

  async function savePicture() {
    const asset = await MediaLibrary.createAssetAsync(photoInfo.uri)
      .then(() => {
        Alert.alert('Nero', 'Salvo com sucesso!');
      })
      .catch((error) => {
        console.log('err', error);
      });
  }

  async function moreInfo() {
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`err: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setInfoLocation(data);
    } catch (error) {
      console.error('err', error.message);
      return null;
    }

    setInfoOpen(true);    
  }

  function zoomIn(value) {
    if (zoom < 1) {
      setZoom(value);
    }
  }

  function zoomOut(value) {
    if (zoom > 0) {
      setZoom(value);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={{ flex: 1 }}
        type={type}
        flashMode={flashMode}
        zoom={zoom}
        ref={camRef}
        ratio="16:9">
        <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, left: 20 }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <AntDesign name="swap" size={30} color="white" />
          </TouchableOpacity>

          <Link
            href="../"
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: [{ translateX: -12 }],
            }}>
            <Entypo name="home" size={24} color="white" />
          </Link>

          <TouchableOpacity
            style={{ position: 'absolute', top: 20, right: 25 }}
            onPress={() => {
              setFlashMode(
                flashMode === Camera.Constants.FlashMode.off
                  ? Camera.Constants.FlashMode.on
                  : Camera.Constants.FlashMode.off
              );
            }}>
            <Entypo
              name="flashlight"
              size={24}
              color={flashMode === Camera.Constants.FlashMode.on ? 'gray' : 'white'}
            />
          </TouchableOpacity>
        </View>
      </Camera>

      <TouchableOpacity
        style={{ position: 'absolute', bottom: 30, left: '35%', transform: [{ translateX: -30 }] }}
        onPress={() => zoomOut(zoom - 0.1)}>
        <AntDesign name="minus" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePicture}></TouchableOpacity>

      <TouchableOpacity
        style={{ position: 'absolute', bottom: 30, left: '65%', transform: [{ translateX: 0 }] }}
        onPress={() => zoomIn(zoom + 0.1)}>
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      {photoInfo && (
        <Modal animationType="slide" transparent={false} visible={open}>
          <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              style={{ width: '100%', height: '85%', borderRadius: 20 }}
              source={{ uri: photoInfo.uri }}
            />

            <View style={{ margin: 10, flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  width: 125,
                  height: 50,
                  borderRadius: 20,
                  backgroundColor: 'gray',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  margin: 5,
                }}
                onPress={() => setOpen(false)}>
                <Ionicons name="exit" size={24} color="white" />
                <Text style={{ color: 'white' }}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: 125,
                  height: 50,
                  borderRadius: 20,
                  backgroundColor: 'black',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  margin: 5,
                }}
                onPress={savePicture}>
                <FontAwesome name="upload" size={20} color="white" />
                <Text style={{ color: 'white' }}>Salvar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                width: '70%',
                height: 50,
                borderRadius: 20,
                backgroundColor: 'gray',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
              onPress={() => moreInfo()}>
              <Entypo name="info" size={20} color="white" />
              <Text style={{ color: 'white' }}>Mais informações</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {photoInfo && infoOpen && (
        <Modal animationType="slide" transparent={false} visible={open}>
          <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Image style={{ width: 200, height: 200 }} source={require('../../assets/bird.png')} />
            <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 40, fontWeight: 'bold' }}>
              Nero
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 20 }}>
              Informações da foto
            </Text>
            <Text>Largura: {photoInfo.width} pixels</Text>
            <Text>Altura: {photoInfo.height} pixels</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 15 }}>
              Informações da câmera
            </Text>
            <Text>
              Tipo de câmera: {type === Camera.Constants.Type.front ? 'Frontal' : 'Traseira'}
            </Text>
            <Text>Zoom: {zoom.toFixed(2)}x</Text>
            <Text>
              Flash ativado: {flashMode === Camera.Constants.FlashMode.on ? 'Sim' : 'Não'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 15 }}>
              Informações adicionais
            </Text>
            <Text>Data e hora: {new Date(location.timestamp).toLocaleString()}</Text>
            <Text>
              Local: {infoLocation.address.city === undefined ? infoLocation.address.city_district : infoLocation.address.city}, {infoLocation.address.country}
            </Text>
            <Text>Latitude: {location.coords.latitude}</Text>
            <Text>Longitude: {location.coords.longitude}</Text>
            <Text>Altitude: {location.coords.altitude}</Text>

            <View style={{ margin: 10, flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  width: '75%',
                  height: 50,
                  borderRadius: 20,
                  backgroundColor: 'gray',
                  margin: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
                onPress={() => setInfoOpen(false)}>
                <Ionicons name="exit" size={24} color="white" />
                <Text style={{ color: 'white' }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  button: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -25 }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 40,
    width: 50,
    height: 50,
  },
});
