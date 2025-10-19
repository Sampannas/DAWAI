// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DEFAULT_BEATS } from './defaultBeats.js';

const THEME = {
  gradientBackground: ['#0a0e27', '#1a1f3a'],
  primary: '#00d4ff',
  accent: '#ff2e63',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  cardBackground: 'rgba(30, 39, 66, 0.8)',
  tamu: '#500000',
  tamuGold: '#998542',
};

const STORAGE_KEY = '@rhythm_studio_beats';

const BeatCard = ({ beat, onPlay, onEdit, isDefault = false }) => {
  const navigation = useNavigation();
  
  const handlePlay = () => {
    // Navigate to Create screen with the beat loaded
    navigation.navigate('Create', { loadBeat: beat, autoPlay: true });
  };
  
  const handleEdit = () => {
    // Navigate to Create screen with the beat loaded
    navigation.navigate('Create', { loadBeat: beat, autoPlay: false });
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={[styles.cardColorBar, { backgroundColor: beat.color || THEME.primary }]} />
        <View style={styles.cardDetails}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{beat.name}</Text>
            {isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardAuthor}>by {beat.author || 'Unknown'}</Text>
          <Text style={styles.cardMeta}>
            {beat.tempo} BPM • {beat.numSteps} steps
            {!isDefault && beat.timestamp && ` • ${new Date(beat.timestamp).toLocaleDateString()}`}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={styles.actionButton} onPress={handlePlay}>
          <Feather name="play" size={18} color={THEME.primary} />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleEdit}>
          <Feather name="edit-2" size={18} color={THEME.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [savedBeats, setSavedBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadSavedBeats();
  }, []);

  // Reload beats when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedBeats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSavedBeats = async () => {
    try {
      setIsLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const beats = data ? JSON.parse(data) : [];
      setSavedBeats(beats);
    } catch (error) {
      console.error('Error loading saved beats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigation.navigate('Create');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rhythm Studio</Text>
          <Text style={styles.headerSubtitle}>Your personal beat dashboard</Text>
        </View>

        <Pressable style={styles.createButton} onPress={handleCreateNew}>
          <LinearGradient
            colors={[THEME.primary, THEME.primary + 'dd']}
            style={styles.createButtonGradient}
          >
            <Feather name="plus" size={24} color={THEME.textPrimary} />
            <Text style={styles.createButtonText}>Create New Beat</Text>
          </LinearGradient>
        </Pressable>

        {savedBeats.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Saved Beats</Text>
              <Text style={styles.sectionCount}>{savedBeats.length}</Text>
            </View>
            {savedBeats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TAMU Collection</Text>
            <View style={styles.tamuBadge}>
              <Text style={styles.tamuBadgeText}>AGGIES</Text>
            </View>
          </View>
          {DEFAULT_BEATS.map((beat) => (
            <BeatCard key={beat.id} beat={beat} isDefault />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    paddingTop: 80, 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: THEME.textPrimary, 
    marginBottom: 5 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: THEME.textSecondary 
  },
  createButton: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  createButtonText: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  section: { 
    marginBottom: 30 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: THEME.textPrimary, 
  },
  sectionCount: {
    fontSize: 14,
    color: THEME.textSecondary,
    backgroundColor: THEME.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tamuBadge: {
    backgroundColor: THEME.tamu,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.tamuGold,
  },
  tamuBadgeText: {
    color: THEME.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  cardColorBar: { 
    width: 4, 
    height: 50, 
    borderRadius: 2, 
    marginRight: 15 
  },
  cardDetails: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: THEME.textPrimary 
  },
  cardAuthor: { 
    fontSize: 12, 
    color: THEME.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  defaultBadge: {
    backgroundColor: THEME.tamu,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: THEME.textPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  cardActions: { 
    flexDirection: 'row', 
    gap: 10 
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});