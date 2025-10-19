import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import LoginModal from './LoginModal';

const THEME = {
  gradientBackground: ['#0a0e27', '#1a1f3a'],
  primary: '#00d4ff',
  accent: '#ff2e63',
  textPrimary: '#ffffff',
};

export default function LoginScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <View style={styles.content}>
        <Feather name="music" size={100} color={THEME.primary} />
        <Text style={styles.title}>Rhythm Studio</Text>
        <Text style={styles.subtitle}>Create, Share, and Discover Beats</Text>
        <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
      <LoginModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: THEME.textPrimary,
    marginTop: 10,
    marginBottom: 40,
  },
  button: {
    backgroundColor: THEME.accent,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
