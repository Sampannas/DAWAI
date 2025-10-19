import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Animated, Dimensions, Platform, Modal, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Tone from 'tone';
import { useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Configuration ---
const INITIAL_NUM_STEPS = 30;
const INITIAL_BPM = 120;
const TRACK_HEIGHT = 50;
const MAX_STEPS = 50;
const MIN_STEPS = 8;
const STORAGE_KEY = '@rhythm_studio_beats';

// --- EXPANDED CHANNEL CONFIGURATION ---
const CHANNELS = [
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
      { name: 'Crash', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/Bongos/snare.mp3' },
    ]
  },
  {
    id: 'percussion',
    name: 'Percussion',
    icon: 'target',
    color: '#4ecdc4',
    type: 'sample',
    samples: [
      { name: 'Clap', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav' },
      { name: 'Tom', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tom.wav' },
      { name: 'Ride', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/ride.wav' },
      { name: 'Cowbell', url: 'https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/Cowbell/808.mp3' },
    ]
  },
  {
    id: 'piano',
    name: 'Piano',
    icon: 'edit-3',
    color: '#f1f2f6',
    type: 'synth',
    synthType: 'piano',
    hasOctaveControl: true,
    defaultOctave: 4,
    samples: [
      { name: 'C', baseNote: 'C', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'C#', baseNote: 'C#', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'D', baseNote: 'D', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'D#', baseNote: 'D#', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'E', baseNote: 'E', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'F', baseNote: 'F', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'F#', baseNote: 'F#', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'G', baseNote: 'G', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'G#', baseNote: 'G#', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'A', baseNote: 'A', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'A#', baseNote: 'A#', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
      { name: 'B', baseNote: 'B', synthSettings: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } } },
    ]
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: 'bar-chart-2',
    color: '#45b7d1',
    type: 'synth',
    synthType: 'bass',
    samples: [
      { name: 'C1', note: 'C1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'C#1', note: 'C#1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'D1', note: 'D1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'D#1', note: 'D#1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'E1', note: 'E1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'F1', note: 'F1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'F#1', note: 'F#1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'G1', note: 'G1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'G#1', note: 'G#1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'A1', note: 'A1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'A#1', note: 'A#1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'B1', note: 'B1', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
      { name: 'C2', note: 'C2', synthSettings: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 } } },
    ]
  },
  {
    id: 'synth',
    name: 'Synths',
    icon: 'activity',
    color: '#feca57',
    type: 'synth',
    synthType: 'lead',
    samples: [
      { name: 'C3', note: 'C3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'C#3', note: 'C#3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'D3', note: 'D3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'D#3', note: 'D#3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'E3', note: 'E3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'F3', note: 'F3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'F#3', note: 'F#3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'G3', note: 'G3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'G#3', note: 'G#3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'A3', note: 'A3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'A#3', note: 'A#3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'B3', note: 'B3', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
      { name: 'C4', note: 'C4', synthSettings: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.8 } } },
    ]
  },
  {
    id: 'fx',
    name: 'FX',
    icon: 'zap',
    color: '#00d2d3',
    type: 'sample',
    samples: [
      { name: 'Tink', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav' },
    ]
  }
];

// Helper functions
const createAllSamples = (octaveSettings = {}) => {
  return CHANNELS.flatMap(channel => {
    if (channel.hasOctaveControl) {
      const octave = octaveSettings[channel.id] || channel.defaultOctave;
      return channel.samples.map(sample => ({
        ...sample,
        note: `${sample.baseNote}${octave}`,
        channelId: channel.id,
        channelColor: channel.color,
        channelType: channel.type,
        synthType: channel.synthType
      }));
    }
    return channel.samples.map(sample => ({
      ...sample,
      channelId: channel.id,
      channelColor: channel.color,
      channelType: channel.type,
      synthType: channel.synthType
    }));
  });
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

const calculateNoteDuration = (groupLength, tempo) => {
  const sixteenthNoteDuration = 60 / tempo / 4;
  return sixteenthNoteDuration * groupLength;
};

// --- Optimized Pattern Block Component ---
const PatternBlock = memo(({ group, stepWidth, trackColor, isPlaying, activeStep, isSynth }) => {
  if (!group || !group.steps || group.steps.length === 0) return null;
  
  const startStep = group.steps[0];
  const endStep = group.steps[group.steps.length - 1];
  const blockWidth = ((endStep - startStep + 1) * stepWidth) - 4;
  const blockLeft = startStep * stepWidth + 2;
  
  const showDashed = isSynth && group.isDragged;
  
  return (
    <View pointerEvents="none" style={[
      styles.patternBlock, 
      { 
        left: blockLeft, 
        width: blockWidth, 
        backgroundColor: trackColor + '40', 
        borderColor: trackColor,
        borderStyle: showDashed ? 'dashed' : 'solid',
        borderWidth: showDashed ? 3 : 2,
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
      {isSynth && group.steps.length > 1 && group.isDragged && (
        <View style={styles.durationIndicator}>
          <Text style={styles.durationText}>{group.steps.length}/16</Text>
        </View>
      )}
      {showDashed && (
        <View style={styles.dragIndicator}>
          <Feather name="link" size={10} color={trackColor} />
        </View>
      )}
    </View>
  );
});

// --- Optimized Channel Preview Component ---
const ChannelPreview = memo(({ channel, grid, allSamples, numSteps }) => {
  const channelTracks = useMemo(() => 
    allSamples
      .map((sample, index) => ({ sample, index }))
      .filter(({ sample }) => sample.channelId === channel.id),
    [allSamples, channel.id]
  );
  
  const stepWidth = 3;
  
  return (
    <View style={styles.channelPreview}>
      {channelTracks.map(({ index }) => (
        <View key={index} style={styles.previewTrack}>
          {grid[index].map((isActive, stepIndex) => (
            <View
              key={stepIndex}
              style={[
                styles.previewStep,
                {
                  width: stepWidth,
                  backgroundColor: isActive ? channel.color : 'transparent',
                  opacity: isActive ? 0.8 : 0.3,
                }
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

// --- Optimized Channel Header Component ---
const ChannelHeader = memo(({ channel, isMuted, isSolo, volume, onMute, onSolo, onVolumeChange, isExpanded, onToggleExpand, octave, onOctaveChange, showPreview, grid, allSamples, numSteps }) => {
  return (
    <View style={[styles.channelHeader, { backgroundColor: channel.color + '15' }]}>
      <Pressable style={styles.channelInfoFull} onPress={onToggleExpand}>
        <View style={styles.channelMainInfo}>
          <Feather name={isExpanded ? 'chevron-down' : 'chevron-right'} size={16} color={THEME.textSecondary} />
          <View style={[styles.channelIcon, { backgroundColor: channel.color + '33' }]}>
            <Feather name={channel.icon} size={14} color={channel.color} />
          </View>
          <View style={styles.channelNameContainer}>
            <Text style={styles.channelName}>{channel.name}</Text>
            <Text style={styles.channelTrackCount}>({channel.samples.length})</Text>
          </View>
          {channel.type === 'synth' && (
            <View style={styles.synthBadge}>
              <Feather name="zap" size={10} color={channel.color} />
              <Text style={[styles.synthBadgeText, { color: channel.color }]}>SYNTH</Text>
            </View>
          )}
          {channel.type === 'sample' && (
            <View style={styles.sampleBadge}>
              <Feather name="disc" size={10} color={channel.color} />
              <Text style={[styles.sampleBadgeText, { color: channel.color }]}>SAMPLE</Text>
            </View>
          )}
        </View>
        
        {!isExpanded && showPreview && (
          <ChannelPreview 
            channel={channel} 
            grid={grid} 
            allSamples={allSamples}
            numSteps={numSteps}
          />
        )}
      </Pressable>
      
      <View style={styles.channelControls}>
        {channel.hasOctaveControl && (
          <View style={styles.octaveControl}>
            <Pressable 
              style={styles.octaveButton} 
              onPress={() => onOctaveChange(Math.max(1, octave - 1))}
            >
              <Feather name="minus" size={12} color={THEME.textSecondary} />
            </Pressable>
            <Text style={styles.octaveText}>Oct {octave}</Text>
            <Pressable 
              style={styles.octaveButton} 
              onPress={() => onOctaveChange(Math.min(7, octave + 1))}
            >
              <Feather name="plus" size={12} color={THEME.textSecondary} />
            </Pressable>
          </View>
        )}
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
});

// --- Save Modal Component ---
const SaveModal = memo(({ visible, onClose, onSave }) => {
  const [beatName, setBeatName] = useState('');
  
  const handleSave = () => {
    if (beatName.trim()) {
      onSave(beatName.trim());
      setBeatName('');
      onClose();
    } else {
      Alert.alert('Error', 'Please enter a name for your beat');
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Save Beat</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter beat name..."
            placeholderTextColor={THEME.textSecondary}
            value={beatName}
            onChangeText={setBeatName}
            autoFocus
            maxLength={30}
          />
          <View style={styles.modalButtons}>
            <Pressable style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSave}>
              <Text style={styles.modalButtonTextPrimary}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// --- Load Modal Component ---
const LoadModal = memo(({ visible, onClose, savedBeats, onLoad, onDelete }) => {
  const renderBeatItem = ({ item }) => (
    <View style={styles.beatItem}>
      <Pressable style={styles.beatItemContent} onPress={() => onLoad(item)}>
        <View>
          <Text style={styles.beatItemName}>{item.name}</Text>
          <Text style={styles.beatItemInfo}>
            {item.tempo} BPM • {item.numSteps} steps • {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
      <Pressable style={styles.beatItemDelete} onPress={() => onDelete(item.id)}>
        <Feather name="trash-2" size={16} color={THEME.accent} />
      </Pressable>
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.modalContentLarge]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Load Beat</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </Pressable>
          </View>
          {savedBeats.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="music" size={48} color={THEME.textSecondary} />
              <Text style={styles.emptyStateText}>No saved beats yet</Text>
            </View>
          ) : (
            <FlatList
              data={savedBeats}
              renderItem={renderBeatItem}
              keyExtractor={item => item.id}
              style={styles.beatList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
});

// --- Storage Functions ---
const Storage = {
  async saveBeats(beats) {
    try {
      const jsonString = JSON.stringify(beats);
      console.log(jsonString);
      // Define the file path

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(beats));
      return true;
    } catch (error) {
      console.error('Error saving beats:', error);
      return false;
    }
  },
  
  async loadBeats() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading beats:', error);
      return [];
    }
  },
  
  async saveBeat(beatData) {
    try {
      const beats = await this.loadBeats();
      const newBeat = {
        ...beatData,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      beats.push(newBeat);
      await this.saveBeats(beats);
      return newBeat;
    } catch (error) {
      console.error('Error saving beat:', error);
      return null;
    }
  },
  
  async deleteBeat(beatId) {
    try {
      const beats = await this.loadBeats();
      const filteredBeats = beats.filter(beat => beat.id !== beatId);
      await this.saveBeats(filteredBeats);
      return true;
    } catch (error) {
      console.error('Error deleting beat:', error);
      return false;
    }
  }
};

// --- Main Create Screen Component ---
export default function CreateScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [tempo, setTempo] = useState(INITIAL_BPM);
  const [isLoading, setIsLoading] = useState(true);
  const [numSteps, setNumSteps] = useState(INITIAL_NUM_STEPS);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedBeats, setSavedBeats] = useState([]);
  const route = useRoute();


  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragTrackIndex, setDragTrackIndex] = useState(null);
  
  const [octaveSettings, setOctaveSettings] = useState(
    CHANNELS.filter(c => c.hasOctaveControl).reduce((acc, channel) => ({
      ...acc,
      [channel.id]: channel.defaultOctave
    }), {})
  );
  
  const [ALL_SAMPLES, setALL_SAMPLES] = useState(createAllSamples(octaveSettings));
  
  const [grid, setGrid] = useState(
    Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(false))
  );
  
  const [stepMetadata, setStepMetadata] = useState(
    Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(null).map(() => ({ groupId: null })))
  );
  
  const [channelStates, setChannelStates] = useState(
    CHANNELS.reduce((acc, channel) => ({
      ...acc,
      [channel.id]: { muted: false, solo: false, volume: 0.8, expanded: true }
    }), {})
  );
  
  const soundObjects = useRef([]);
  const activeNotes = useRef({});
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const playlistScrollRef = useRef(null);
  const trackScrollRefs = useRef({}); // ADD THIS LINE
  const toneStarted = useRef(false);
  const groupIdCounter = useRef(0);
  useEffect(() => {
    if (route.params?.loadBeat) {
      const beat = route.params.loadBeat;
      
      // Load the beat data
      setGrid(beat.grid);
      setStepMetadata(beat.stepMetadata);
      setChannelStates(beat.channelStates);
      setOctaveSettings(beat.octaveSettings);
      setTempo(beat.tempo);
      setNumSteps(beat.numSteps);
      
      // Auto-play if requested
      if (route.params?.autoPlay) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 1000); // Give time for sounds to load
      }
    }
  }, [route.params]);
  // Load saved beats on mount
  useEffect(() => {
    loadSavedBeats();
  }, []);
  const handleTimelineScroll = useCallback((event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    Object.values(trackScrollRefs.current).forEach(ref => {
      if (ref) {
        // Sync each track's scroll position with the header
        ref.scrollTo({ x: scrollX, animated: false });
      }
    });
  }, []);
  const loadSavedBeats = async () => {
    const beats = await Storage.loadBeats();
    setSavedBeats(beats);
  };

  const handleSaveBeat = async (name) => {
    const beatData = {
      name,
      grid,
      stepMetadata,
      channelStates,
      octaveSettings,
      tempo,
      numSteps
    };
    
    const saved = await Storage.saveBeat(beatData);
    if (saved) {
      Alert.alert('Success', 'Beat saved successfully!');
      loadSavedBeats();
    } else {
      Alert.alert('Error', 'Failed to save beat');
    }
  };

  const handleLoadBeat = useCallback((beat) => {
    setGrid(beat.grid);
    setStepMetadata(beat.stepMetadata);
    setChannelStates(beat.channelStates);
    setOctaveSettings(beat.octaveSettings);
    setTempo(beat.tempo);
    setNumSteps(beat.numSteps);
    setShowLoadModal(false);
    Alert.alert('Success', `Loaded "${beat.name}"`);
  }, []);

  const handleDeleteBeat = useCallback(async (beatId) => {
    Alert.alert(
      'Delete Beat',
      'Are you sure you want to delete this beat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const deleted = await Storage.deleteBeat(beatId);
            if (deleted) {
              loadSavedBeats();
            }
          }
        }
      ]
    );
  }, []);

  useEffect(() => {
    setGrid(prevGrid => {
      return prevGrid.map(track => {
        if (track.length > numSteps) {
          return track.slice(0, numSteps);
        } else if (track.length < numSteps) {
          return [...track, ...Array(numSteps - track.length).fill(false)];
        }
        return track;
      });
    });
    
    setStepMetadata(prevMeta => {
      return prevMeta.map(track => {
        if (track.length > numSteps) {
          return track.slice(0, numSteps);
        } else if (track.length < numSteps) {
          return [...track, ...Array(numSteps - track.length).fill(null).map(() => ({ groupId: null }))];
        }
        return track;
      });
    });
  }, [numSteps]);

  useEffect(() => {
    const newSamples = createAllSamples(octaveSettings);
    setALL_SAMPLES(newSamples);
    
    if (!isLoading) {
      loadSounds();
    }
  }, [octaveSettings]);

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

  const loadSounds = useCallback(async () => {
    setIsLoading(true);
    
    soundObjects.current.forEach(obj => {
      if (obj.type === 'sample' && obj.sound) {
        obj.sound.unloadAsync();
      } else if (obj.type === 'synth' && obj.synth) {
        obj.synth.dispose();
      }
    });
    
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    const loadedObjects = await Promise.all(
      ALL_SAMPLES.map(async (sample) => {
        if (sample.channelType === 'sample') {
          const { sound } = await Audio.Sound.createAsync({ uri: sample.url });
          return { type: 'sample', sound };
        } else {
          const synth = new Tone.Synth(sample.synthSettings).toDestination();
          synth.volume.value = -10;
          return { type: 'synth', synth, note: sample.note };
        }
      })
    );
    
    soundObjects.current = loadedObjects;
    setIsLoading(false);
  }, [ALL_SAMPLES]);

  useEffect(() => {
    loadSounds();
    return () => {
      soundObjects.current.forEach(obj => {
        if (obj.type === 'sample' && obj.sound) {
          obj.sound.unloadAsync();
        } else if (obj.type === 'synth' && obj.synth) {
          obj.synth.dispose();
        }
      });
      
      Object.values(activeNotes.current).forEach(noteId => {
        if (noteId) Tone.Transport.clear(noteId);
      });
    };
  }, []);

  const shouldPlayTrack = useCallback((trackIndex) => {
    const sample = ALL_SAMPLES[trackIndex];
    const channelState = channelStates[sample.channelId];
    const anySolo = Object.values(channelStates).some(state => state.solo);
    if (anySolo) return channelState.solo && !channelState.muted;
    return !channelState.muted;
  }, [ALL_SAMPLES, channelStates]);

  const startTone = async () => {
    if (!toneStarted.current) {
      await Tone.start();
      Tone.Transport.bpm.value = tempo;
      toneStarted.current = true;
    }
  };

  useEffect(() => {
    if (isPlaying && !isLoading) {
      startTone();
      
      intervalRef.current = setInterval(() => {
        const nextStep = (activeStep + 1) % numSteps;
        
        grid.forEach((track, trackIndex) => {
          if (shouldPlayTrack(trackIndex)) {
            const obj = soundObjects.current[trackIndex];
            const sample = ALL_SAMPLES[trackIndex];
            const volume = channelStates[sample.channelId].volume;
            
            if (sample.channelType === 'sample') {
              if (track[nextStep]) {
                obj.sound.setVolumeAsync(volume);
                obj.sound.replayAsync();
              }
            } else {
              const groups = groupConsecutiveSteps(track, stepMetadata[trackIndex]);
              const currentGroup = groups.find(group => group.steps[0] === nextStep);
              
              if (currentGroup) {
                const duration = calculateNoteDuration(currentGroup.steps.length, tempo);
                
                if (activeNotes.current[trackIndex]) {
                  obj.synth.triggerRelease();
                }
                
                obj.synth.volume.value = Tone.gainToDb(volume);
                obj.synth.triggerAttackRelease(obj.note, duration);
                
                activeNotes.current[trackIndex] = true;
                
                setTimeout(() => {
                  activeNotes.current[trackIndex] = null;
                }, duration * 1000);
              }
            }
          }
        });
        
        setActiveStep(nextStep);
      }, (60 * 1000) / tempo / 4);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setActiveStep(-1);
      
      Object.keys(activeNotes.current).forEach(trackIndex => {
        const obj = soundObjects.current[trackIndex];
        if (obj && obj.type === 'synth' && activeNotes.current[trackIndex]) {
          obj.synth.triggerRelease();
        }
      });
      activeNotes.current = {};
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isLoading, tempo, grid, activeStep, channelStates, numSteps, stepMetadata, shouldPlayTrack, ALL_SAMPLES]);

  useEffect(() => {
    if (toneStarted.current) {
      Tone.Transport.bpm.value = tempo;
    }
  }, [tempo]);

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

  const handlePressMove = useCallback((trackIndex, stepIndex) => {
    if (!isDragging || dragTrackIndex !== trackIndex || dragStart === stepIndex) return;
    
    const newGrid = grid.map(row => [...row]);
    const newMeta = stepMetadata.map(row => [...row]);
    const start = Math.min(dragStart, stepIndex);
    const end = Math.max(dragStart, stepIndex);
    
    const newGroupId = ++groupIdCounter.current;
    
    for (let i = start; i <= end; i++) {
      newGrid[trackIndex][i] = true;
      newMeta[trackIndex][i] = { groupId: newGroupId };
    }
    
    setGrid(newGrid);
    setStepMetadata(newMeta);
  }, [isDragging, dragTrackIndex, dragStart, grid, stepMetadata]);

  const handlePressOut = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragTrackIndex(null);
  }, []);

  const clearPattern = useCallback(() => {
    setGrid(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(false)));
    setStepMetadata(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(null).map(() => ({ groupId: null }))));
  }, [ALL_SAMPLES.length, numSteps]);
  
  const randomizePattern = useCallback(() => {
    setGrid(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(false).map(() => Math.random() > 0.75)));
    setStepMetadata(Array(ALL_SAMPLES.length).fill(null).map(() => Array(numSteps).fill(null).map(() => ({ groupId: null }))));
  }, [ALL_SAMPLES.length, numSteps]);
  
  const handleChannelMute = useCallback((channelId) => {
    setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], muted: !p[channelId].muted } }));
  }, []);

  const handleChannelSolo = useCallback((channelId) => {
    setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], solo: !p[channelId].solo } }));
  }, []);

  const handleChannelVolume = useCallback((channelId, volume) => {
    setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], volume } }));
  }, []);

  const toggleChannelExpand = useCallback((channelId) => {
    setChannelStates(p => ({ ...p, [channelId]: { ...p[channelId], expanded: !p[channelId].expanded } }));
  }, []);
  
  const handleOctaveChange = useCallback((channelId, newOctave) => {
    setOctaveSettings(prev => ({
      ...prev,
      [channelId]: newOctave
    }));
  }, []);

  const stepWidth = 50;

  return (
    <LinearGradient colors={THEME.gradientBackground} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.compactHeader, Platform.OS !== 'web' && styles.compactHeaderMobile]}>
        <View style={styles.headerLeft}>
          <Feather name="music" size={24} color={THEME.primary} />
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.compactTitle, Platform.OS !== 'web' && styles.compactTitleMobile]}>Rhythm Studio</Text>
            <Text style={styles.compactSubtitle}>{tempo.toFixed(0)} BPM • {numSteps} Steps</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton} onPress={randomizePattern}>
            <Feather name="shuffle" size={18} color={THEME.textSecondary} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={clearPattern}>
            <Feather name="trash-2" size={18} color={THEME.textSecondary} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={() => setShowSaveModal(true)}>
            <Feather name="save" size={18} color={THEME.textSecondary} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={() => setShowLoadModal(true)}>
            <Feather name="folder" size={18} color={THEME.textSecondary} />
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

      <View style={styles.playlistContainer}>
        <View style={styles.timelineHeader}>
          <View style={styles.trackListHeader}>
            <Text style={styles.trackListHeaderText}>Tracks</Text>
          </View>
          <ScrollView 
    ref={playlistScrollRef} 
    horizontal 
    showsHorizontalScrollIndicator={false} 
    style={styles.timelineScroll}
    onScroll={handleTimelineScroll}
    scrollEventThrottle={16}
>            <View style={styles.timelineSteps}>
              {Array(numSteps).fill(0).map((_, i) => (
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
                  <ChannelHeader 
                    channel={channel} 
                    isMuted={channelState.muted} 
                    isSolo={channelState.solo} 
                    volume={channelState.volume} 
                    onMute={() => handleChannelMute(channel.id)} 
                    onSolo={() => handleChannelSolo(channel.id)} 
                    onVolumeChange={(vol) => handleChannelVolume(channel.id, vol)} 
                    isExpanded={channelState.expanded} 
                    onToggleExpand={() => toggleChannelExpand(channel.id)}
                    octave={octaveSettings[channel.id]}
                    onOctaveChange={(oct) => handleOctaveChange(channel.id, oct)}
                    showPreview={true}
                    grid={grid}
                    allSamples={ALL_SAMPLES}
                    numSteps={numSteps}
                  />
                  {channelState.expanded && channelTracks.map(({ sample, index }) => {
                    const isMuted = channelState.muted || (Object.values(channelStates).some(s => s.solo) && !channelState.solo);
                    const isSynth = sample.channelType === 'synth';
                    
                    return (
                      <View key={index} style={styles.playlistTrack}>
                          <View style={styles.trackLabelContainer}>
                              <View style={[styles.trackColorBar, { backgroundColor: sample.channelColor }]} />
                              <Text style={[styles.trackName, isMuted && styles.trackNameMuted]}>
                                  {sample.name}
                              </Text>
                              {sample.note && (
                              <View style={styles.noteIndicator}>
                                  <Text style={styles.noteText}>{sample.note}</Text>
                              </View>
                              )}
                          </View>
                          <ScrollView
                              ref={(ref) => (trackScrollRefs.current[index] = ref)}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              scrollEnabled={false} // Prevents user from scrolling individual tracks out of sync
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
                                      onMouseEnter={() => isDragging && handlePressMove(index, stepIndex)}
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
                                      isSynth={isSynth}
                                  />
                                  ))}
                                  {activeStep >= 0 && !isMuted && (
                                  <View style={[styles.playheadLine, { left: activeStep * stepWidth + stepWidth / 2, backgroundColor: sample.channelColor }]} />
                                  )}
                              </View>
                          </ScrollView>
                      </View>
                  );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <SaveModal 
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBeat}
      />

      <LoadModal
        visible={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        savedBeats={savedBeats}
        onLoad={handleLoadBeat}
        onDelete={handleDeleteBeat}
      />
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
  synthBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  synthBadgeText: { fontSize: 9, fontWeight: '800', marginLeft: 3 },
  sampleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  sampleBadgeText: { fontSize: 9, fontWeight: '800', marginLeft: 3 },
  channelPreview: { flex: 1, flexDirection: 'column', height: 30, marginLeft: 10, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 4, padding: 2 },
  previewTrack: { flex: 1, flexDirection: 'row', marginVertical: 1 },
  previewStep: { height: '100%', marginHorizontal: 0.5 },
  channelControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  octaveControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 4 },
  octaveButton: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  octaveText: { color: THEME.textPrimary, fontSize: 10, fontWeight: '700', marginHorizontal: 6 },
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
  trackName: { color: THEME.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 },
  trackNameMuted: { color: THEME.textSecondary, opacity: 0.4 },
  noteIndicator: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  noteText: { color: THEME.textSecondary, fontSize: 9, fontWeight: '700' },
  trackPatternArea: { position: 'relative', height: '100%' },  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  stepButtons: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  stepButton: { position: 'absolute', top: 0, bottom: 0 },
  patternBlock: { position: 'absolute', top: 8, height: TRACK_HEIGHT - 16, borderRadius: 6, overflow: 'hidden' },
  patternDots: { flex: 1, position: 'relative' },
  patternDot: { position: 'absolute', top: '50%', marginTop: -3, width: 6, height: 6, borderRadius: 3 },
  durationIndicator: { position: 'absolute', top: 2, right: 4, backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  durationText: { color: THEME.textPrimary, fontSize: 8, fontWeight: '700' },
  dragIndicator: { position: 'absolute', top: 2, left: 4, backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  playheadLine: { position: 'absolute', top: 0, bottom: 0, width: 2, opacity: 0.8 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: THEME.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContentLarge: {
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: THEME.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: THEME.cardBackground,
    color: THEME.textPrimary,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: THEME.cardBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonPrimary: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  modalButtonText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  beatList: {
    maxHeight: 400,
  },
  beatItem: {
    flexDirection: 'row',
    backgroundColor: THEME.cardBackground,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  beatItemContent: {
    flex: 1,
    padding: 15,
  },
  beatItemName: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  beatItemInfo: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
  beatItemDelete: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: THEME.textSecondary,
    fontSize: 14,
    marginTop: 10,
  },
});