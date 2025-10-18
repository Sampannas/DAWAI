import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

// --- Configuration ---
const NUM_STEPS = 16;
const INITIAL_BPM = 120;

// Here we use direct URLs to drum samples hosted on GitHub.
// This is the simplest way to avoid local files.
const DRUM_SAMPLES = [
  { name: 'Kick 🥁', color: '#ff6b6b', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav' },
  { name: 'Snare 🥁', color: '#feca57', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav' },
  { name: 'Hi-Hat (C) 🥁', color: '#4ecdc4', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav' },
  { name: 'Hi-Hat (O) 🥁', color: '#45b7d1', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav' },
];
const NUM_TRACKS = DRUM_SAMPLES.length;

// --- The Main App Component ---
export default function DrumMachine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [tempo, setTempo] = useState(INITIAL_BPM);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  const [grid, setGrid] = useState(
    Array(NUM_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(false))
  );

  // Use a ref to hold sound objects and the interval
  const soundObjects = useRef([]);
  const intervalRef = useRef(null);

  // --- Audio Handling ---

  // Function to load all sounds into memory
  const loadSounds = async () => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); // Allows audio to play on silent mode (iOS)
    const loadedSounds = await Promise.all(
      DRUM_SAMPLES.map(async (sample) => {
        const { sound } = await Audio.Sound.createAsync({ uri: sample.url });
        return sound;
      })
    );
    soundObjects.current = loadedSounds;
    setIsLoading(false);
  };

  // Load sounds only once when the app starts
  useEffect(() => {
    loadSounds();
    // Cleanup: unload sounds when the component is removed
    return () => {
      soundObjects.current.forEach(sound => sound.unloadAsync());
    };
  }, []);


  // --- Playback Logic ---

  useEffect(() => {
    if (isPlaying && !isLoading) {
      intervalRef.current = setInterval(() => {
        // Play sounds for the upcoming step
        const nextStep = (activeStep + 1) % NUM_STEPS;
        grid.forEach((track, trackIndex) => {
          if (track[nextStep] && soundObjects.current[trackIndex]) {
            soundObjects.current[trackIndex].replayAsync();
          }
        });
        // Advance the playhead
        setActiveStep(nextStep);
      }, (60 * 1000) / tempo / 4);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setActiveStep(-1);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isLoading, tempo, grid, activeStep]);


  const handlePressCell = (trackIndex, stepIndex) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Drum Machine</Text>
        {isLoading ? (
          <ActivityIndicator color="#61dafb" />
        ) : (
          <Pressable
            style={[styles.button, isPlaying ? styles.stopButton : styles.playButton]}
            onPress={() => setIsPlaying(!isPlaying)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isPlaying ? 'Stop' : 'Play'}</Text>
          </Pressable>
        )}
      </View>

      {/* Sequencer Grid */}
      <View style={styles.sequencerContainer}>
        {/* Track Labels */}
        <View style={styles.trackLabelsContainer}>
          {DRUM_SAMPLES.map((sample) => (
            <View key={sample.name} style={styles.trackLabelWrapper}>
              <Text style={styles.trackLabel}>{sample.name}</Text>
            </View>
          ))}
        </View>

        {/* The Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {grid.map((track, trackIndex) => (
              <View key={trackIndex} style={styles.trackRow}>
                {track.map((isStepOn, stepIndex) => (
                  <Pressable
                    key={stepIndex}
                    style={[
                      styles.step,
                      isStepOn && { backgroundColor: DRUM_SAMPLES[trackIndex].color, opacity: 1 },
                      activeStep === stepIndex && styles.playhead,
                    ]}
                    onPress={() => handlePressCell(trackIndex, stepIndex)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// --- Styles (mostly unchanged) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    padding: 10,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  playButton: {
    backgroundColor: '#2ecc71',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sequencerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  trackLabelsContainer: {
    paddingRight: 10,
  },
  trackLabelWrapper: {
    height: 50,
    justifyContent: 'center',
    marginBottom: 5,
  },
  trackLabel: {
    color: '#aaa',
  },
  gridContainer: {
    flex: 1,
  },
  trackRow: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 5,
    alignItems: 'center',
  },
  step: {
    width: 40,
    height: 40,
    backgroundColor: '#3a3f4b',
    margin: 2,
    borderRadius: 4,
    opacity: 0.6,
  },
  playhead: {
    borderWidth: 2,
    borderColor: '#61dafb',
  },
});