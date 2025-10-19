import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from "firebase/firestore";

const THEME = {
  background: '#0a0e27',
  gradientBackground: ['#0a0e27', '#1a1f3a', '#0a0e27'],
  primary: '#00d4ff',
  accent: '#ff2e63',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  cardBackground: 'rgba(30, 39, 66, 0.8)',
};

const LoginModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleAction = () => {
    setLoading(true);
    if (activeTab === 'Login') {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('Login successful:', userCredential.user.uid);
          onClose();
        })
        .catch(error => {
          Alert.alert('Login Error', error.message);
        })
        .finally(() => setLoading(false));
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('Sign Up successful:', userCredential.user.uid);
          const user = userCredential.user;
          const userDocRef = doc(db, "users", user.uid);
          setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date()
          })
          .then(() => {
            onClose();
          })
          .catch((error) => {
            Alert.alert('Firestore Error', error.message);
          });
        })
        .catch(error => {
          Alert.alert('Sign Up Error', error.message);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient colors={THEME.gradientBackground} style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{activeTab}</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color={THEME.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={THEME.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={THEME.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={THEME.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color={THEME.textSecondary} />
            </Pressable>
          </View>

          {activeTab === 'Sign Up' && (
            <Text style={styles.passwordHint}>
              Password must be at least 6 characters and include a capital letter, a number, and a special character.
            </Text>
          )}

          <Pressable style={styles.actionButton} onPress={handleAction} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={THEME.textPrimary} />
            ) : (
              <Text style={styles.actionButtonText}>{activeTab}</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {activeTab === 'Login' ? "Don't have an account? " : "Already have an account? "}
              <Text 
                style={styles.footerLink} 
                onPress={() => setActiveTab(activeTab === 'Login' ? 'Sign Up' : 'Login')}
              >
                {activeTab === 'Login' ? 'Sign Up' : 'Login'}
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: THEME.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBackground,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: THEME.textPrimary,
    fontSize: 16,
  },
  passwordHint: {
    color: THEME.textSecondary,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: THEME.textSecondary,
  },
  footerLink: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
});

export default LoginModal;
