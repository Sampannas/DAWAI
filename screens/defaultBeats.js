// defaultBeats.js

const TOTAL_TRACKS = 48;
const NUM_STEPS = 30;

// Helper to create an empty array for a track
const emptyTrack = () => Array(NUM_STEPS).fill(false);

export const DEFAULT_BEATS = [
  {
    id: 'jingle-bells',
    name: 'Jingle Bells',
    author: 'Rhythm Studio',
    color: '#e63946',
    tempo: 140,
    numSteps: NUM_STEPS,
    timestamp: Date.now(),
    grid: [
      // Drums & Percussion
      [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, true, false, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false], // Clap
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat C
      ...Array(6).fill(null).map(() => emptyTrack()), // Fill empty tracks

      // Piano (Melody in Octave 5)
      emptyTrack(), // C5
      emptyTrack(), // C#5
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false], // D5
      emptyTrack(), // D#5
      [true, false, true, false, false, false, false, false, true, false, true, false, false, false, false, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // E5
      emptyTrack(), // F5
      emptyTrack(), // F#5
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false], // G5
      ...Array(4).fill(null).map(() => emptyTrack()), // Fill empty piano tracks
      ...Array(TOTAL_TRACKS - 21).fill(null).map(() => emptyTrack()), // Rest of instruments are silent
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(null).map(() => ({ groupId: null }))),
    channelStates: {
      drums: { muted: false, solo: false, volume: 0.8, expanded: false },
      percussion: { muted: false, solo: false, volume: 0.7, expanded: false },
      piano: { muted: false, solo: false, volume: 0.9, expanded: true },
      bass: { muted: true, solo: false, volume: 0.7, expanded: false },
      synth: { muted: true, solo: false, volume: 0.5, expanded: false },
      fx: { muted: true, solo: false, volume: 0.4, expanded: false }
    },
    octaveSettings: {
      piano: 5
    }
  },
  {
    id: 'twinkle-twinkle',
    name: 'Twinkle Twinkle',
    author: 'Rhythm Studio',
    color: '#fca311',
    tempo: 100,
    numSteps: NUM_STEPS,
    timestamp: Date.now(),
    grid: [
      // Drums
      [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // Snare
      ...Array(7).fill(null).map(() => emptyTrack()),
      // Piano (Melody in Octave 4)
      [true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false], // C4
      ...Array(6).fill(null).map(() => emptyTrack()),
      [false, false, false, false, true, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // G4
      emptyTrack(),
      [false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // A4
      ...Array(TOTAL_TRACKS - 20).fill(null).map(() => emptyTrack()),
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(null).map(() => ({ groupId: null }))),
    channelStates: {
      drums: { muted: false, solo: false, volume: 0.9, expanded: false },
      percussion: { muted: true, solo: false, volume: 0.9, expanded: false },
      piano: { muted: false, solo: false, volume: 1.0, expanded: true },
      bass: { muted: true, solo: false, volume: 0.7, expanded: false },
      synth: { muted: true, solo: false, volume: 0.6, expanded: false },
      fx: { muted: true, solo: false, volume: 0.5, expanded: false }
    },
    octaveSettings: {
      piano: 4
    }
  },
  {
    id: 'mary-had-a-little-lamb',
    name: 'Mary Had a Little Lamb',
    author: 'Rhythm Studio',
    color: '#14213d',
    tempo: 120,
    numSteps: NUM_STEPS,
    timestamp: Date.now(),
    grid: [
      // Drums
      [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // Snare
      ...Array(7).fill(null).map(() => emptyTrack()),
      // Piano (Melody in Octave 4)
      [false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // C4
      emptyTrack(),
      [false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // D4
      emptyTrack(),
      [true, false, false, false, false, false, false, false, true, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // E4
      ...Array(TOTAL_TRACKS - 14).fill(null).map(() => emptyTrack()),
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(null).map(() => ({ groupId: null }))),
    channelStates: {
      drums: { muted: false, solo: false, volume: 0.9, expanded: false },
      percussion: { muted: true, solo: false, volume: 0.8, expanded: false },
      piano: { muted: false, solo: false, volume: 0.9, expanded: true },
      bass: { muted: true, solo: false, volume: 0.7, expanded: false },
      synth: { muted: true, solo: false, volume: 0.5, expanded: false },
      fx: { muted: true, solo: false, volume: 0.6, expanded: false }
    },
    octaveSettings: {
      piano: 4
    }
  },
  {
    id: 'simple-beat',
    name: 'Simple Drum Loop',
    author: 'Rhythm Studio',
    color: '#00d4ff',
    tempo: 90,
    numSteps: NUM_STEPS,
    timestamp: Date.now(),
    grid: [
      // Basic hip-hop style drum beat
      [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, true, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-hat
      ...Array(TOTAL_TRACKS - 3).fill(null).map(() => emptyTrack()),
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(null).map(() => ({ groupId: null }))),
    channelStates: {
      drums: { muted: false, solo: false, volume: 1.0, expanded: true },
      percussion: { muted: false, solo: false, volume: 0.7, expanded: false },
      piano: { muted: true, solo: false, volume: 0.6, expanded: false },
      bass: { muted: false, solo: false, volume: 0.9, expanded: false },
      synth: { muted: true, solo: false, volume: 0.5, expanded: false },
      fx: { muted: true, solo: false, volume: 0.4, expanded: false }
    },
    octaveSettings: {
      piano: 4
    }
  }
];