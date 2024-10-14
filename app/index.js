import { Text, Image, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Image style={{ width: 200, height: 200 }} source={require('../assets/bird.png')} />
      <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 40, fontWeight: 'bold' }}>
        Nero
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 16, paddingTop: 10, paddingBottom: 40 }}>
        O Nero é um aplicativo simples de captura de fotos, projetado para fornecer uma experiência
        intuitiva e rápida ao usuário. Ele permite que o usuário tire fotos de forma fácil e
        apresente informações essenciais como localização, data e hora da captura.
      </Text>
      <Link
        href="/camera/"
        style={{
          width: '75%',
          height: 50,
          borderRadius: 60,
          backgroundColor: 'black',
          marginTop: 20,
          paddingTop: 13,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
        }}>
        Experimentar
      </Link>
    </View>
  );
}
