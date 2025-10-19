import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Animated, Dimensions, Platform, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Tone from 'tone';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Configuration ---
const INITIAL_NUM_STEPS = 16;
const INITIAL_BPM = 120;
const TRACK_HEIGHT = 50;
const MAX_STEPS = 64;
const MIN_STEPS = 8;

// Tutorial Story with 5 levels for drums
const TUTORIAL_STORY = [
  // Level 0: Basic Kick Pattern
  {
    character: 'DJ Riff',
    dialogue: "Welcome to the DAW! Let's start with the foundation of all beats: the kick drum. Tap the squares to place a kick on beats 1, 5, 9, and 13.",
    image: require('../assets/dj_riff.png'),
    level: 0,
    check: (grid) => {
      const kickTrack = grid[0];
      return kickTrack[0] && kickTrack[4] && kickTrack[8] && kickTrack[12];
    },
    highlight: [0],
  },
  {
    character: 'DJ Riff',
    dialogue: "Perfect! The kick drum is the heartbeat of your track. It provides the low-end punch that makes people want to move. Now let's add a snare at 4 and 11!",
    image: require('../assets/dj_riff.png'),
    level: 0,
    check: (grid) => {
      const snareTrack = grid[1];
      return snareTrack[3] && snareTrack[10];
    },
    highlight: [1],
  },
  {
    character: 'DJ Riff',
    dialogue: "Excellent! The snare on the 3 and 11 beats creates a classic backbeat. Now add closed hi-hats on every other beat (2, 4, 6, 8, 10, 12, 14, 16) to add rhythm.",
    image: require('../assets/dj_riff.png'),
    level: 0,
    check: (grid) => {
      const hihatTrack = grid[2];
      return hihatTrack[1] && hihatTrack[3] && hihatTrack[5] && hihatTrack[7] && 
             hihatTrack[9] && hihatTrack[11] && hihatTrack[13] && hihatTrack[15];
    },
    highlight: [2],
  },
  
  // Level 1: Advanced Hi-Hat Patterns
  {
    character: 'DJ Riff',
    dialogue: "Amazing work! Now you've unlocked advanced drum patterns. Let's experiment with open hi-hats to add variation. Try placing open hi-hats on beats 8 and 16.",
    image: require('../assets/dj_riff.png'),
    level: 1,
    check: (grid) => {
      const openHihatTrack = grid[3];
      return openHihatTrack[7] && openHihatTrack[15];
    },
    highlight: [3],
  },
  {
    character: 'DJ Riff',
    dialogue: "Great! Open hi-hats add brightness and anticipation. They're perfect for transitions. Now let's add some groove with the clap!",
    image: require('../assets/dj_riff.png'),
    level: 1,
    check: (grid) => {
      const clapTrack = grid[4];
      return clapTrack.some(step => step);
    },
    highlight: [4],
  },
  
  // Level 2: Percussion Mastery
  {
    character: 'DJ Riff',
    dialogue: "You're becoming a rhythm master! Percussion adds flavor and character to your beats. Try layering a clap with your snare on beats 4 and 11 for extra punch.",
    image: require('../assets/dj_riff.png'),
    level: 2,
    check: (grid) => {
      const clapTrack = grid[4];
      return clapTrack[4] && clapTrack[12];
    },
    highlight: [4],
  },
  {
    character: 'DJ Riff',
    dialogue: "Powerful! Now add some tom fills. Toms are great for building energy. Try placing toms on beats 7, 8, 15, and 16 to create a fill.",
    image: require('../assets/dj_riff.png'),
    level: 2,
    check: (grid) => {
      const tomTrack = grid[5];
      return tomTrack[6] && tomTrack[7] && tomTrack[14] && tomTrack[15];
    },
    highlight: [5],
  },
  
  // Level 3: Syncopation and Complex Rhythms
  {
    character: 'DJ Riff',
    dialogue: "Outstanding! You've mastered basic patterns. Now let's explore syncopation - the art of placing beats in unexpected places. Try adding kicks on beats 3, 7, and 11.",
    image: require('../assets/dj_riff.png'),
    level: 3,
    check: (grid) => {
      const kickTrack = grid[0];
      return kickTrack[2] && kickTrack[6] && kickTrack[10];
    },
    highlight: [0],
  },
  {
    character: 'DJ Riff',
    dialogue: "Yes! That off-beat groove creates movement and anticipation. Syncopation is what makes rhythms interesting and danceable. Experiment more!",
    image: require('../assets/dj_riff.png'),
    level: 3,
    check: (grid) => {
      // Check if user has experimented with at least 20 total active steps
      const totalSteps = grid.slice(0, 6).reduce((sum, track) => 
        sum + track.filter(step => step).length, 0);
      return totalSteps >= 20;
    },
    highlight: [0, 1, 2, 3, 4, 5],
  },
  
  // Level 4: Full Creative Freedom
  {
    character: 'DJ Riff',
    dialogue: "You're a true beatmaker now! You understand rhythm, texture, and groove. Feel free to create any drum pattern you can imagine. The only limit is your creativity!",
    image: require('../assets/dj_riff.png'),
    level: 4,
  },
];

// Only drums channel for Learn mode
let LEARN_CHANNELS = [
  {
    id: 'drums',
    name: 'Drums',
    icon: 'disc',
    color: '#ff6b6b',
    type: 'sample',
    samples: [
      { name: 'Kick', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav' },
      { name: 'Snare', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav' },
      { name: 'Hi-Hat C', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav' },
      { name: 'Hi-Hat O', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav' },
      { name: 'Clap', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav' },
      { name: 'Tom', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tom.wav' },
    ]
  },

];

// Helper functions
const createAllSamples = (channels) => {
  return channels.flatMap(channel => 
    channel.samples.map(sample => ({
      ...sample,
      channelId: channel.id,
      channelColor: channel.color,
      channelType: channel.type,
    }))
  );
};

const groupConsecutiveSteps = (pattern, stepMetadata = []) => {
  const groups = [];
  let currentGroup = [];
  let currentGroupId = null;
  
  pattern.forEach((isActive, index) => {
    if (isActive) {
      const groupId = stepMetadata[index]?.groupId;
      
      if (currentGroup.length > 0 && groupId !== currentGroupId) {
        groups.push({ steps: currentGroup, isDragged: currentGroupId !== null });
        currentGroup = [];
      }
      
      currentGroup.push(index);
      currentGroupId = groupId;
    } else {
      if (currentGroup.length > 0) {
        groups.push({ steps: currentGroup, isDragged: currentGroupId !== null });
        currentGroup = [];
        currentGroupId = null;
      }
    }
  });
  
  if (currentGroup.length > 0) {
    groups.push({ steps: currentGroup, isDragged: currentGroupId !== null });
  }
  
  return groups;
};

// Pattern Block Component
const PatternBlock = memo(({ group, stepWidth, trackColor, isPlaying, activeStep }) => {
  if (!group || !group.steps || group.steps.length === 0) return null;
  
  const startStep = group.steps[0];
  const endStep = group.steps[group.steps.length - 1];
  const blockWidth = ((endStep - startStep + 1) * stepWidth) - 4;
  const blockLeft = startStep * stepWidth + 2;
  
  return (
    <View pointerEvents="none" style={[
      styles.patternBlock, 
      { 
        left: blockLeft, 
        width: blockWidth, 
        backgroundColor: trackColor + '40', 
        borderColor: trackColor,
        borderWidth: 2,
      }
    ]}>
      <View style={styles.patternDots}>
        {group.steps.map((stepIndex) => {
          const dotLeft = (stepIndex - startStep) * stepWidth + stepWidth / 2 - 3;
          const isCurrentlyPlaying = isPlaying && activeStep === stepIndex;
          return (
            <View 
              key={stepIndex} 
              style={[
                styles.patternDot, 
                { 
                  left: dotLeft, 
                  backgroundColor: trackColor, 
                  opacity: isCurrentlyPlaying ? 1 : 0.7, 
                  transform: [{ scale: isCurrentlyPlaying ? 1.5 : 1 }] 
                }
              ]} 
            />
          );
        })}
      </View>
    </View>
  );
});

// Channel Header Component
const ChannelHeader = memo(({ channel, isMuted, volume, onMute, onVolumeChange }) => {
  return (
    <View style={[styles.channelHeader, { backgroundColor: channel.color + '15' }]}>
      <View style={styles.channelInfoFull}>
        <View style={styles.channelMainInfo}>
          <View style={[styles.channelIcon, { backgroundColor: channel.color + '33' }]}>
            <Feather name={channel.icon} size={14} color={channel.color} />
          </View>
          <View style={styles.channelNameContainer}>
            <Text style={styles.channelName}>{channel.name}</Text>
            <Text style={styles.channelTrackCount}>({channel.samples.length})</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.channelControls}>
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
});

// Main Learn Screen Component
export default function LearnScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [tempo, setTempo] = useState(INITIAL_BPM);
  const [isLoading, setIsLoading] = useState(true);
  const [numSteps, setNumSteps] = useState(INITIAL_NUM_STEPS);
  const [storyIndex, setStoryIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(new Set([0]));

  const currentStory = TUTORIAL_STORY[storyIndex];
  const currentLevel = currentStory.level;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragTrackIndex, setDragTrackIndex] = useState(null);
  
  const ALL_SAMPLES = useMemo(() => createAllSamples(LEARN_CHANNELS), []);
  
  const [grid, setGrid] = useState(
    Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(false))
  );
  
  const [stepMetadata, setStepMetadata] = useState(
    Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(null).map(() => ({ groupId: null })))
  );
  
  const [channelStates, setChannelStates] = useState({
    drums: { muted: false, volume: 0.8 }
  });
  
  const soundObjects = useRef([]);
  const activeNotes = useRef({});
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const playlistScrollRef = useRef(null);
  const trackScrollRefs = useRef({});
  const toneStarted = useRef(false);
  const groupIdCounter = useRef(0);

  // Check if current objective is met
  useEffect(() => {
    if (currentStory.check && currentStory.check(grid)) {
      // Objective completed - user can proceed
    }
  }, [grid, currentStory]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar { height: 8px; }
        ::-webkit-scrollbar-track { background: ${THEME.secondary}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.primary}; border-radius: 4px; }
      `;
      document.head.append(style);
    }
  }, []);

  const handleTimelineScroll = useCallback((event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    Object.values(trackScrollRefs.current).forEach(ref => {
      if (ref) ref.scrollTo({ x: scrollX, animated: false });
    });
  }, []);

  const loadSounds = useCallback(async () => {
    setIsLoading(true);
    soundObjects.current.forEach(obj => obj.sound?.unloadAsync());
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    const loadedObjects = await Promise.all(
      ALL_SAMPLES.map(async (sample) => {
        const { sound } = await Audio.Sound.createAsync({ uri: sample.url });
        return { type: 'sample', sound };
      })
    );
    
    soundObjects.current = loadedObjects;
    setIsLoading(false);
  }, [ALL_SAMPLES]);

  useEffect(() => {
    loadSounds();
    return () => {
      soundObjects.current.forEach(obj => obj.sound?.unloadAsync());
    };
  }, [loadSounds]);

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
    if (isPlaying && !isLoading) {
      intervalRef.current = setInterval(() => {
        const nextStep = (activeStep + 1) % numSteps;
        
        grid.forEach((track, trackIndex) => {
          if (!channelStates.drums.muted && track[nextStep]) {
            const obj = soundObjects.current[trackIndex];
            obj.sound.setVolumeAsync(channelStates.drums.volume);
            obj.sound.replayAsync();
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
  }, [isPlaying, isLoading, tempo, grid, activeStep, channelStates, numSteps]);

  const handlePressIn = useCallback((trackIndex, stepIndex) => {
    setIsDragging(true);
    setDragStart(stepIndex);
    setDragTrackIndex(trackIndex);
    
    const newGrid = grid.map(row => [...row]);
    const newMeta = stepMetadata.map(row => [...row]);
    
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    newMeta[trackIndex][stepIndex] = { groupId: null };
    
    setGrid(newGrid);
    setStepMetadata(newMeta);
  }, [grid, stepMetadata]);

  const handlePressOut = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragTrackIndex(null);
  }, []);

  const clearPattern = useCallback(() => {
    setGrid(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(false)));
    setStepMetadata(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(null).map(() => ({ groupId: null }))));
  }, [ALL_SAMPLES.length, numSteps]);

  const handleChannelMute = useCallback(() => {
    setChannelStates(p => ({ drums: { ...p.drums, muted: !p.drums.muted } }));
  }, []);

  const handleChannelVolume = useCallback((volume) => {
    setChannelStates(p => ({ drums: { ...p.drums, volume } }));
  }, []);

  const handleNext = () => {
    // Check if user must complete objective before advancing
    if (currentStory.check && !currentStory.check(grid)) {
      Alert.alert(
        'Not Yet!',
        'Complete the current objective before moving to the next step.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if advancing to a new level
    if (storyIndex < TUTORIAL_STORY.length - 1) {
      const nextStory = TUTORIAL_STORY[storyIndex + 1];
      const nextLevel = nextStory.level;
      
      // Check if user has completed previous level
      if (nextLevel > currentLevel && !completedLevels.has(nextLevel)) {
        setCompletedLevels(prev => new Set([...prev, nextLevel]));
      }
      
      setStoryIndex(storyIndex + 1);
      
    
    }
  };

  const stepWidth = 50;
  const isObjectiveComplete = currentStory.check ? currentStory.check(grid) : true;

  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Tutorial Dialog Box */}
      <View style={styles.learnContainer}>
        <View style={styles.dialogueBox}>
          <View style={styles.characterSection}>
            <Image source={currentStory.image} style={styles.characterImage} />
            <Text style={styles.characterName}>{currentStory.character}</Text>
          </View>
          <Text style={styles.dialogueText}>{currentStory.dialogue}</Text>
          <View style={styles.progressIndicator}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {currentLevel + 1}</Text>
            </View>
            <Pressable 
              style={[
                styles.nextButton,
                !isObjectiveComplete && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!isObjectiveComplete}
            >
              {isObjectiveComplete ? (
                <>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Feather name="arrow-right" size={20} color={THEME.textPrimary} />
                </>
              ) : (
                <Text style={styles.nextButtonText}>Complete Objective</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Controls */}
      <View style={[styles.compactHeader, Platform.OS !== 'web' && styles.compactHeaderMobile]}>
        <View style={styles.headerLeft}>
          <Feather name="music" size={24} color={THEME.primary} />
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.compactTitle, Platform.OS !== 'web' && styles.compactTitleMobile]}>Learn Mode</Text>
            <Text style={styles.compactSubtitle}>{tempo.toFixed(0)} BPM • {numSteps} Steps</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton} onPress={clearPattern}>
            <Feather name="trash-2" size={18} color={THEME.textSecondary} />
          </Pressable>
          {isLoading ? (
            <ActivityIndicator color={THEME.primary} size="small" />
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable style={[styles.compactPlayButton, isPlaying && styles.compactPlayButtonActive]} onPress={() => setIsPlaying(!isPlaying)}>
                <Feather name={isPlaying ? 'pause' : 'play'} size={20} color={THEME.textPrimary} />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Tempo and Steps Controls */}
      <View style={styles.controlsRow}>
        <View style={styles.tempoSliderContainer}>
          <Text style={styles.controlLabel}>Tempo</Text>
          <Slider 
            style={styles.tempoSlider} 
            minimumValue={60} 
            maximumValue={180} 
            value={tempo} 
            onValueChange={setTempo} 
            minimumTrackTintColor={THEME.primary} 
            maximumTrackTintColor={THEME.stepOff} 
            thumbTintColor={THEME.primary} 
          />
        </View>
        
        <View style={styles.stepsControl}>
          <Text style={styles.controlLabel}>Steps</Text>
          <View style={styles.stepsButtons}>
            <Pressable style={styles.stepAdjustButton} onPress={() => setNumSteps(Math.max(MIN_STEPS, numSteps - 4))}>
              <Feather name="minus" size={16} color={THEME.textPrimary} />
            </Pressable>
            <Text style={styles.stepsValue}>{numSteps}</Text>
            <Pressable style={styles.stepAdjustButton} onPress={() => setNumSteps(Math.min(MAX_STEPS, numSteps + 4))}>
              <Feather name="plus" size={16} color={THEME.textPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Sequencer Grid */}
      <View style={styles.playlistContainer}>
        <View style={styles.timelineHeader}>
          <View style={styles.trackListHeader}>
            <Text style={styles.trackListHeaderText}>Tracks</Text>
          </View>
          <ScrollView 
            ref={playlistScrollRef} 
            horizontal 
            showsHorizontalScrollIndicator={true} 
            style={styles.timelineScroll}
            onScroll={handleTimelineScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.timelineSteps}>
              {Array(numSteps).fill(0).map((_, i) => (
                <View key={i} style={[styles.timelineStep, { width: stepWidth }]}>
                  <Text style={[styles.timelineStepNumber, activeStep === i && styles.timelineStepNumberActive]}>{i + 1}</Text>
                  <View style={[styles.timelineMarker, (i + 1) % 4 === 0 && styles.timelineMarkerAccent, activeStep === i && styles.timelineMarkerActive]} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView style={styles.playlistScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.playlistContent}>
            <View style={styles.channelSection}>
              <ChannelHeader 
                channel={LEARN_CHANNELS[0]} 
                isMuted={channelStates.drums.muted} 
                volume={channelStates.drums.volume} 
                onMute={handleChannelMute} 
                onVolumeChange={handleChannelVolume} 
              />
              {ALL_SAMPLES.map((sample, index) => {
                const isHighlighted = currentStory.highlight?.includes(index);
                
                return (
                  <View key={index} style={[
                    styles.playlistTrack,
                    isHighlighted && styles.playlistTrackHighlighted
                  ]}>
                    <View style={styles.trackLabelContainer}>
                      <View style={[styles.trackColorBar, { backgroundColor: sample.channelColor }]} />
                      <Text style={styles.trackName}>{sample.name}</Text>
                      {isHighlighted && (
                        <Feather name="arrow-right" size={16} color={THEME.accent} />
                      )}
                    </View>
                    <ScrollView
                      ref={(ref) => (trackScrollRefs.current[index] = ref)}
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      scrollEnabled={false}
                      style={{ flex: 1 }}
                    >
                      <View style={[styles.trackPatternArea, { width: numSteps * stepWidth }]}>
                        <View style={styles.gridLines}>
                          {Array(numSteps).fill(0).map((_, i) => (
                            <View key={i} style={[styles.gridLine, { left: i * stepWidth, backgroundColor: (i + 1) % 4 === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)' }]} />
                          ))}
                        </View>
                        <View style={styles.stepButtons}>
                          {grid[index].map((_, stepIndex) => (
                            <Pressable 
                              key={stepIndex} 
                              style={[styles.stepButton, { width: stepWidth - 4, left: stepIndex * stepWidth + 2 }]} 
                              onPressIn={() => handlePressIn(index, stepIndex)}
                              onPressOut={handlePressOut}
                            />
                          ))}
                        </View>
                        {groupConsecutiveSteps(grid[index], stepMetadata[index]).map((group, groupIndex) => (
                          <PatternBlock 
                            key={groupIndex} 
                            group={group} 
                            stepWidth={stepWidth} 
                            trackColor={sample.channelColor} 
                            isPlaying={isPlaying} 
                            activeStep={activeStep}
                          />
                        ))}
                        {activeStep >= 0 && !channelStates.drums.muted && (
                          <View style={[styles.playheadLine, { left: activeStep * stepWidth + stepWidth / 2, backgroundColor: sample.channelColor }]} />
                        )}
                      </View>
                    </ScrollView>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

// Theme
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  learnContainer: { padding: 15, paddingBottom: 10 },
  dialogueBox: { backgroundColor: THEME.cardBackground, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  characterSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  characterImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10, borderWidth: 2, borderColor: THEME.primary },
  characterName: { fontSize: 16, fontWeight: '700', color: THEME.primary },
  dialogueText: { color: THEME.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  progressIndicator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { backgroundColor: THEME.primary + '33', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  levelText: { color: THEME.primary, fontSize: 12, fontWeight: '700' },
  nextButton: { backgroundColor: THEME.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextButtonDisabled: { backgroundColor: THEME.textSecondary, opacity: 0.5 },
  nextButtonText: { color: THEME.textPrimary, fontSize: 14, fontWeight: '700' },
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
  controlsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, gap: 15 },
  tempoSliderContainer: { flex: 1 },
  controlLabel: { color: THEME.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 5, textTransform: 'uppercase' },
  tempoSlider: { width: '100%', height: 30 },
  stepsControl: { width: 120 },
  stepsButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.cardBackground, borderRadius: 12, padding: 5 },
  stepAdjustButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.primary, borderRadius: 8 },
  stepsValue: { color: THEME.textPrimary, fontSize: 16, fontWeight: '800', minWidth: 30, textAlign: 'center' },
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
  channelInfoFull: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  channelMainInfo: { flexDirection: 'row', alignItems: 'center' },
  channelIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  channelNameContainer: { flexDirection: 'row', alignItems: 'center' },
  channelName: { color: THEME.textPrimary, fontSize: 14, fontWeight: '700', marginRight: 6 },
  channelTrackCount: { color: THEME.textSecondary, fontSize: 11 },
  channelControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  channelButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  channelButtonMuted: { backgroundColor: THEME.accent + '33' },
  volumeControl: { flexDirection: 'row', alignItems: 'center' },
  volumeSlider: { width: 70, height: 20 },
  volumeText: { color: THEME.textSecondary, fontSize: 9, width: 22, textAlign: 'right' },
  playlistTrack: { flexDirection: 'row', height: TRACK_HEIGHT, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
  playlistTrackHighlighted: { backgroundColor: THEME.accent + '10', borderLeftWidth: 3, borderLeftColor: THEME.accent },
  trackLabelContainer: { width: 170, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: THEME.background + '80', borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.05)' },
  trackColorBar: { width: 3, height: 30, borderRadius: 2, marginRight: 10 },
  trackName: { color: THEME.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 },
  trackPatternArea: { position: 'relative', height: '100%' },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  stepButtons: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  stepButton: { position: 'absolute', top: 0, bottom: 0 },
  patternBlock: { position: 'absolute', top: 8, height: TRACK_HEIGHT - 16, borderRadius: 6, overflow: 'hidden' },
  patternDots: { flex: 1, position: 'relative' },
  patternDot: { position: 'absolute', top: '50%', marginTop: -3, width: 6, height: 6, borderRadius: 3 },
  playheadLine: { position: 'absolute', top: 0, bottom: 0, width: 2, opacity: 0.8 },
});