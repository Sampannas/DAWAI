import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const THEME = {
  gradientBackground: ['#0a0e27', '#1a1f3a'],
  primary: '#00d4ff',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  cardBackground: 'rgba(30, 39, 66, 0.8)',
};

const BeatCard = ({ title, author, color }) => (
  <View style={styles.card}>
    <View style={styles.cardInfo}>
      <View style={[styles.cardColorBar, { backgroundColor: color }]} />
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardAuthor}>{author}</Text>
      </View>
    </View>
    <View style={styles.cardActions}>
      <Pressable style={styles.actionButton}>
        <Feather name="play" size={18} color={THEME.primary} />
      </Pressable>
      <Pressable style={styles.actionButton}>
        <Feather name="edit-2" size={18} color={THEME.textSecondary} />
      </Pressable>
    </View>
  </View>
);

export default function HomeScreen() {
  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Home</Text>
        <Text style={styles.headerSubtitle}>Your personal beat dashboard</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Saved Beats</Text>
          <BeatCard title="Midnight Vibe" author="by Sampanna" color="#9b59b6" />
          <BeatCard title="Morning Coffee" author="by Sampanna" color="#feca57" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Patterns</Text>
          <BeatCard title="Classic House" author="by Rhythm Studio" color="#ff6b6b" />
          <BeatCard title="Lo-fi Chill" author="by Rhythm Studio" color="#4ecdc4" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: THEME.textPrimary, marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: THEME.textSecondary, marginBottom: 30 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary, marginBottom: 15 },
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
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  cardColorBar: { width: 4, height: 30, borderRadius: 2, marginRight: 15 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: THEME.textPrimary },
  cardAuthor: { fontSize: 12, color: THEME.textSecondary },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});