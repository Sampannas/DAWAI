import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const THEME = {
  gradientBackground: ['#0a0e27', '#1a1f3a'],
  primary: '#00d4ff',
  accent: '#ff2e63',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  cardBackground: 'rgba(30, 39, 66, 0.8)',
};

const SelectableBeat = ({ title, selected }) => (
  <View style={styles.selectableItem}>
    <Feather name={selected ? 'check-square' : 'square'} size={20} color={selected ? THEME.primary : THEME.textSecondary} />
    <Text style={[styles.selectableText, selected && { color: THEME.primary }]}>{title}</Text>
  </View>
);

export default function AIScreen() {
  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>AI Beat Generation</Text>
        <Text style={styles.headerSubtitle}>Create new patterns from your work</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Your Beats</Text>
          <Text style={styles.sectionDescription}>Choose 1-3 beats to influence the AI.</Text>
          <View style={styles.card}>
            <SelectableBeat title="Midnight Vibe" selected={true} />
            <SelectableBeat title="Morning Coffee" selected={false} />
            <SelectableBeat title="Classic House" selected={true} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Set Parameters</Text>
          <View style={styles.card}>
            <Text style={styles.parameterLabel}>Genre Influence: Lo-fi</Text>
            <Text style={styles.parameterLabel}>Creativity Level: 75%</Text>
          </View>
        </View>
        
        <Pressable style={styles.generateButton}>
          <Feather name="cpu" size={20} color={THEME.textPrimary} />
          <Text style={styles.generateButtonText}>Generate New Beat</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: THEME.textPrimary, marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: THEME.textSecondary, marginBottom: 30 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary, marginBottom: 5 },
  sectionDescription: { color: THEME.textSecondary, marginBottom: 15 },
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectableItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  selectableText: { color: THEME.textSecondary, fontSize: 16, marginLeft: 15 },
  parameterLabel: { color: THEME.textPrimary, fontSize: 16, marginBottom: 10 },
  generateButton: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});