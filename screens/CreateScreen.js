import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Animated, Dimensions, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Configuration ---
const NUM_STEPS = 30; // Using 30 steps as per your last request
const INITIAL_BPM = 120;
const TRACK_HEIGHT = 50;

// Channel Configuration
const CHANNELS = [
  {
    id: 'drums',
    name: 'Drums',
    icon: 'disc',
    color: '#ff6b6b',
    samples: [
      { name: 'Kick', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav' },
      { name: 'Snare', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav' },
      { name: 'Hi-Hat C', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav' },
      { name: 'Hi-Hat O', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav' },
    ]
  },
  {
    id: 'percussion',
    name: 'Percussion',
    icon: 'target',
    color: '#4ecdc4',
    samples: [
      { name: 'Clap', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav' },
      { name: 'Tom', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tom.wav' },
      { name: 'Ride', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/ride.wav' },
    ]
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: 'bar-chart-2',
    color: '#45b7d1',
    samples: [
      { name: 'Bass C2', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/casio/C2.mp3' },
      { name: 'Bass E2', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/casio/E2.mp3' },
      { name: 'Bass G2', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/casio/G2.mp3' },
    ]
  },
  {
    id: 'synth',
    name: 'Synths',
    icon: 'activity',
    color: '#feca57',
    samples: [
      { name: 'Synth Am', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/synth-chord-am.mp3' },
      { name: 'Synth C', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/synth-chord-c.mp3' },
      { name: 'Synth G', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/synth-chord-g.mp3' },
    ]
  },
  {
    id: 'keys',
    name: 'Keys',
    icon: 'music',
    color: '#9b59b6',
    samples: [
       { name: 'EPiano C4', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/casio/C4.mp3' },
       { name: 'EPiano G4', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/casio/G4.mp3' },
    ]
  },
  {
    id: 'fx',
    name: 'FX',
    icon: 'zap',
    color: '#e67e22',
    samples: [
      { name: 'Tink', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav' },
    ]
  }
];

// Flatten all samples for easy access
const ALL_SAMPLES = CHANNELS.flatMap(channel => 
  channel.samples.map(sample => ({ ...sample, channelId: channel.id, channelColor: channel.color }))
);

// This function groups consecutive active steps together
const groupConsecutiveSteps = (pattern) => {
  const groups = [];
  let currentGroup = [];
  pattern.forEach((isActive, index) => {
    if (isActive) {
      currentGroup.push(index);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [];
    }
  });
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
};


// --- Pattern Block Component (Renders a single consecutive block) ---
const PatternBlock = ({ group, stepWidth, trackColor, isPlaying, activeStep }) => {
  if (!group || group.length === 0) return null;

  const startStep = group[0];
  const endStep = group[group.length - 1];
  const blockWidth = ((endStep - startStep + 1) * stepWidth) - 4;
  const blockLeft = startStep * stepWidth + 2;

  return (
    <View style={[ styles.patternBlock, { left: blockLeft, width: blockWidth, backgroundColor: trackColor + '40', borderColor: trackColor } ]}>
      <View style={styles.patternDots}>
        {group.map((stepIndex) => {
          const dotLeft = (stepIndex - startStep) * stepWidth + stepWidth / 2 - 3;
          const isCurrentlyPlaying = isPlaying && activeStep === stepIndex;
          return (
            <View key={stepIndex} style={[ styles.patternDot, { left: dotLeft, backgroundColor: trackColor, opacity: isCurrentlyPlaying ? 1 : 0.7, transform: [{ scale: isCurrentlyPlaying ? 1.5 : 1 }] } ]}/>
          );
        })}
      </View>
    </View>
  );
};

// --- Channel Header Component ---
const ChannelHeader = ({ channel, isMuted, isSolo, volume, onMute, onSolo, onVolumeChange, isExpanded, onToggleExpand }) => {
  return (
    <View style={[styles.channelHeader, { backgroundColor: channel.color + '15' }]}>
      <Pressable style={styles.channelInfo} onPress={onToggleExpand}>
        <Feather name={isExpanded ? 'chevron-down' : 'chevron-right'} size={16} color={THEME.textSecondary} />
        <View style={[styles.channelIcon, { backgroundColor: channel.color + '33' }]}>
          <Feather name={channel.icon} size={14} color={channel.color} />
        </View>
        <Text style={styles.channelName}>{channel.name}</Text>
        <Text style={styles.channelTrackCount}>({channel.samples.length})</Text>
      </Pressable>
      
      <View style={styles.channelControls}>
        <Pressable style={[styles.channelButton, isSolo && styles.channelButtonActive]} onPress={onSolo}>
          <Text style={[styles.channelButtonText, isSolo && styles.channelButtonTextActive]}>S</Text>
        </Pressable>
        <Pressable style={[styles.channelButton, isMuted && styles.channelButtonMuted]} onPress={onMute}>
          <Feather name={isMuted ? 'volume-x' : 'volume-2'} size={12} color={isMuted ? THEME.accent : THEME.textSecondary} />
        </Pressable>
        <View style={styles.volumeControl}>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={onVolumeChange}
            minimumTrackTintColor={channel.color}
            maximumTrackTintColor={THEME.stepOff}
            thumbTintColor={channel.color}
          />
          <Text style={styles.volumeText}>{Math.round(volume * 100)}</Text>
        </View>
      </View>
    </View>
  );
};


// --- Main Create Screen Component ---
export default function CreateScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [tempo, setTempo] = useState(INITIAL_BPM);
  const [isLoading, setIsLoading] = useState(true);
  const [grid, setGrid] = useState(
    Array(ALL_SAMPLES.length).fill(null).map(() => Array(NUM_STEPS).fill(false))
  );
  
  const [channelStates, setChannelStates] = useState(
    CHANNELS.reduce((acc, channel) => ({
      ...acc,
      [channel.id]: { muted: false, solo: false, volume: 0.8, expanded: true }
    }), {})
  );
  
  const soundObjects = useRef([]);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const playlistScrollRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playlistScrollRef.current && activeStep >= 0) {
      const stepWidth = 50;
      const offset = activeStep * stepWidth - (SCREEN_WIDTH - 180) / 2;
      playlistScrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true });
    }
  }, [activeStep]);

  const loadSounds = async () => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const loadedSounds = await Promise.all(
      ALL_SAMPLES.map(async (sample) => {
        const { sound } = await Audio.Sound.createAsync({ uri: sample.url });
        return sound;
      })
    );
    soundObjects.current = loadedSounds;
    setIsLoading(false);
  };

  useEffect(() => {
    loadSounds();
    return () => {
      soundObjects.current.forEach(sound => sound && sound.unloadAsync());
    };
  }, []);

  const shouldPlayTrack = (trackIndex) => {
    const sample = ALL_SAMPLES[trackIndex];
    const channelState = channelStates[sample.channelId];
    const anySolo = Object.values(channelStates).some(state => state.solo);
    if (anySolo) return channelState.solo && !channelState.muted;
    return !channelState.muted;
  };

  useEffect(() => {
    if (isPlaying && !isLoading) {
      intervalRef.current = setInterval(() => {
        const nextStep = (activeStep + 1) % NUM_STEPS;
        grid.forEach((track, trackIndex) => {
          if (track[nextStep] && soundObjects.current[trackIndex] && shouldPlayTrack(trackIndex)) {
            const sample = ALL_SAMPLES[trackIndex];
            const volume = channelStates[sample.channelId].volume;
            soundObjects.current[trackIndex].setVolumeAsync(volume);
            soundObjects.current[trackIndex].replayAsync();
          }
        });
        setActiveStep(nextStep);
      }, (60 * 1000) / tempo / 4);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setActiveStep(-1);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isLoading, tempo, grid, activeStep, channelStates]);

  const handlePressCell = (trackIndex, stepIndex) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
  };

  const clearPattern = () => setGrid(Array(ALL_SAMPLES.length).fill(null).map(() => Array(NUM_STEPS).fill(false)));
  const randomizePattern = () => setGrid(Array(ALL_SAMPLES.length).fill(null).map(() => Array(NUM_STEPS).fill(false).map(() => Math.random() > 0.75)));
  const handleChannelMute = (channelId) => setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], muted: !p[channelId].muted } }));
  const handleChannelSolo = (channelId) => setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], solo: !p[channelId].solo } }));
  const handleChannelVolume = (channelId, volume) => setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], volume } }));
  const toggleChannelExpand = (channelId) => setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], expanded: !p[channelId].expanded } }));

  const stepWidth = 50;

  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.compactHeader, Platform.OS !== 'web' && styles.compactHeaderMobile]}>
        <View style={styles.headerLeft}>
          <Feather name="music" size={24} color={THEME.primary} />
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.compactTitle, Platform.OS !== 'web' && styles.compactTitleMobile]}>Rhythm Studio</Text>
            <Text style={styles.compactSubtitle}>{tempo.toFixed(0)} BPM</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton} onPress={randomizePattern}><Feather name="shuffle" size={18} color={THEME.textSecondary} /></Pressable>
          <Pressable style={styles.headerButton} onPress={clearPattern}><Feather name="trash-2" size={18} color={THEME.textSecondary} /></Pressable>
          
          {/* --- SAVE BUTTON (MOCKUP) --- */}
          <Pressable style={styles.headerButton} onPress={() => alert('Save functionality coming soon!')}>
            <Feather name="save" size={18} color={THEME.textSecondary} />
          </Pressable>

          {isLoading ? <ActivityIndicator color={THEME.primary} size="small" /> : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable style={[styles.compactPlayButton, isPlaying && styles.compactPlayButtonActive]} onPress={() => setIsPlaying(!isPlaying)}>
                <Feather name={isPlaying ? 'pause' : 'play'} size={20} color={THEME.textPrimary} />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>

      <View style={styles.tempoSliderContainer}>
        <Slider style={styles.tempoSlider} minimumValue={60} maximumValue={180} value={tempo} onValueChange={setTempo} minimumTrackTintColor={THEME.primary} maximumTrackTintColor={THEME.stepOff} thumbTintColor={THEME.primary} />
      </View>

      <View style={styles.playlistContainer}>
        <View style={styles.timelineHeader}>
          <View style={styles.trackListHeader}><Text style={styles.trackListHeaderText}>Tracks</Text></View>
          <ScrollView ref={playlistScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
            <View style={styles.timelineSteps}>
              {Array(NUM_STEPS).fill(0).map((_, i) => (
                <View key={i} style={[styles.timelineStep, { width: stepWidth }]}>
                  <Text style={[styles.timelineStepNumber, activeStep === i && styles.timelineStepNumberActive]}>{i + 1}</Text>
                  <View style={[styles.timelineMarker, (i + 1) % 4 === 0 && styles.timelineMarkerAccent, activeStep === i && styles.timelineMarkerActive]} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView style={styles.playlistScroll} showsVerticalScrollIndicator={true}>
          <View style={styles.playlistContent}>
            {CHANNELS.map((channel) => {
              const channelState = channelStates[channel.id];
              const channelTracks = ALL_SAMPLES.map((sample, index) => ({ sample, index })).filter(({ sample }) => sample.channelId === channel.id);
              
              return (
                <View key={channel.id} style={styles.channelSection}>
                  <ChannelHeader channel={channel} isMuted={channelState.muted} isSolo={channelState.solo} volume={channelState.volume} onMute={() => handleChannelMute(channel.id)} onSolo={() => handleChannelSolo(channel.id)} onVolumeChange={(vol) => handleChannelVolume(channel.id, vol)} isExpanded={channelState.expanded} onToggleExpand={() => toggleChannelExpand(channel.id)} />
                  {channelState.expanded && channelTracks.map(({ sample, index }) => {
                    const isMuted = channelState.muted || (Object.values(channelStates).some(s => s.solo) && !channelState.solo);
                    return (
                      <View key={index} style={styles.playlistTrack}>
                        <View style={styles.trackLabelContainer}>
                          <View style={[styles.trackColorBar, { backgroundColor: sample.channelColor }]} />
                          <Text style={[styles.trackName, isMuted && styles.trackNameMuted]}>{sample.name}</Text>
                        </View>
                        <View style={styles.trackPatternArea}>
                          <View style={styles.gridLines}>
                            {Array(NUM_STEPS).fill(0).map((_, i) => (<View key={i} style={[styles.gridLine, { left: i * stepWidth, backgroundColor: (i + 1) % 4 === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)' }]} />))}
                          </View>
                          <View style={styles.stepButtons}>
                            {grid[index].map((_, stepIndex) => (<Pressable key={stepIndex} style={[styles.stepButton, { width: stepWidth - 4, left: stepIndex * stepWidth + 2 }]} onPress={() => handlePressCell(index, stepIndex)} />))}
                          </View>
                          {groupConsecutiveSteps(grid[index]).map((group, groupIndex) => (
                            <PatternBlock key={groupIndex} group={group} stepWidth={stepWidth} trackColor={sample.channelColor} isPlaying={isPlaying} activeStep={activeStep} />
                          ))}
                          {activeStep >= 0 && !isMuted && (<View style={[styles.playheadLine, { left: activeStep * stepWidth + stepWidth / 2, backgroundColor: sample.channelColor }]} />)}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

// --- Theme ---
const THEME = {
  background: '#0a0e27',
  gradientBackground: ['#0a0e27', '#1a1f3a', '#0a0e27'],
  primary: '#00d4ff',
  accent: '#ff2e63',
  secondary: '#1e2742',
  cardBackground: 'rgba(30, 39, 66, 0.6)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  stepOff: 'rgba(255, 255, 255, 0.08)',
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  compactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitleContainer: { marginLeft: 12 },
  compactTitle: { color: THEME.textPrimary, fontSize: 20, fontWeight: '800' },
  compactSubtitle: { color: THEME.textSecondary, fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.cardBackground, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  compactPlayButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center' },
  compactPlayButtonActive: { backgroundColor: THEME.accent },
  compactHeaderMobile: { paddingVertical: 5, paddingHorizontal: 15 },
  compactTitleMobile: { fontSize: 18 },
  tempoSliderContainer: { paddingHorizontal: 20, paddingVertical: 5 },
  tempoSlider: { width: '100%', height: 30 },
  playlistContainer: { flex: 1, backgroundColor: THEME.secondary + '40' },
  timelineHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: THEME.secondary },
  trackListHeader: { width: 170, paddingVertical: 10, paddingHorizontal: 15, justifyContent: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.1)' },
  trackListHeaderText: { color: THEME.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  timelineScroll: { flex: 1 },
  timelineSteps: { flexDirection: 'row', paddingVertical: 10 },
  timelineStep: { alignItems: 'center', justifyContent: 'center' },
  timelineStepNumber: { color: THEME.textSecondary, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  timelineStepNumberActive: { color: THEME.primary, fontWeight: '800' },
  timelineMarker: { width: 2, height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 1 },
  timelineMarkerAccent: { height: 12, width: 3, backgroundColor: THEME.primary + '60' },
  timelineMarkerActive: { backgroundColor: THEME.primary, height: 16 },
  playlistScroll: { flex: 1 },
  playlistContent: { paddingBottom: 20 },
  channelSection: { marginBottom: 5 },
  channelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  channelInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  channelIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  channelName: { color: THEME.textPrimary, fontSize: 14, fontWeight: '700', marginRight: 6 },
  channelTrackCount: { color: THEME.textSecondary, fontSize: 11 },
  channelControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  channelButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  channelButtonActive: { backgroundColor: THEME.primary + '33' },
  channelButtonMuted: { backgroundColor: THEME.accent + '33' },
  channelButtonText: { color: THEME.textSecondary, fontSize: 11, fontWeight: '800' },
  channelButtonTextActive: { color: THEME.primary },
  volumeControl: { flexDirection: 'row', alignItems: 'center' },
  volumeSlider: { width: 70, height: 20 },
  volumeText: { color: THEME.textSecondary, fontSize: 9, width: 22, textAlign: 'right' },
  playlistTrack: { flexDirection: 'row', height: TRACK_HEIGHT, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
  trackLabelContainer: { width: 170, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: THEME.background + '80', borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.05)' },
  trackColorBar: { width: 3, height: 30, borderRadius: 2, marginRight: 10 },
  trackName: { color: THEME.textPrimary, fontSize: 13, fontWeight: '600' },
  trackNameMuted: { color: THEME.textSecondary, opacity: 0.4 },
  trackPatternArea: { flex: 1, position: 'relative' },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  stepButtons: { position: 'absolute', top: 0, left: 0, bottom: 0, width: NUM_STEPS * 50 },
  stepButton: { position: 'absolute', top: 0, bottom: 0 },
  patternBlock: { position: 'absolute', top: 8, height: TRACK_HEIGHT - 16, borderRadius: 6, borderWidth: 2, overflow: 'hidden' },
  patternDots: { flex: 1, position: 'relative' },
  patternDot: { position: 'absolute', top: '50%', marginTop: -3, width: 6, height: 6, borderRadius: 3 },
  playheadLine: { position: 'absolute', top: 0, bottom: 0, width: 2, opacity: 0.8 },
});