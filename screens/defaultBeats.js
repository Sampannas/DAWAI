// defaultBeats.js

const TOTAL_TRACKS = 48;
const NUM_STEPS = 30;

// Helper to create an empty array for a track
const emptyTrack = () => Array(NUM_STEPS).fill(false);

export const DEFAULT_BEATS = [
 
 
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
  },

 
 
  {
    id: '1760860551660',
    name: 'Old MacDonald Simple',
    author: 'Rhythm Studio',
    color: '#fab1a0',
    tempo: 120,
    numSteps: 50,
    timestamp: 1760860551660,
    grid: [
      // Drums & Percussion (Tracks 0-10) are empty
      ...Array(11).fill(null).map(() => emptyTrack(50)),

      // Piano Section (Octave 4)
      [false,false,false,false,false,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,true,true,true,true,false,false], // D4
      emptyTrack(50), // D#4
      [false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false], // E4
      emptyTrack(50), // F4
      emptyTrack(50), // F#4
      [true,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,false,false,true,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false], // G4
      emptyTrack(50), // G#4
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // A4
      emptyTrack(50), // A#4
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // B4
      
      // The rest of the instruments are empty
      ...Array(TOTAL_TRACKS - 21).fill(null).map(() => emptyTrack(50)),
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(50).fill(null).map(() => ({ groupId: null }))),
    channelStates: {"drums":{"muted":true,"solo":false,"volume":0.7,"expanded":false},"percussion":{"muted":true,"solo":false,"volume":0.8,"expanded":false},"piano":{"muted":false,"solo":false,"volume":0.9,"expanded":true},"bass":{"muted":true,"solo":false,"volume":0.7,"expanded":false},"synth":{"muted":true,"solo":false,"volume":0.5,"expanded":false},"fx":{"muted":true,"solo":false,"volume":0.6,"expanded":false}},
    octaveSettings: { piano: 4 }
  } , 
   {
    id: 'old-macdonald',
    name: 'Old MacDonald Modern',
    author: 'Rhythm Studio',
    color: '#5e548e',
    tempo: 120,
    numSteps: 50,
    timestamp: Date.now(),
    grid: [
      // Drums
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat C
      ...Array(6).fill(null).map(() => Array(50).fill(false)),

      // Piano (Melody in Octave 4)
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // C4, C#4
      // D4
      [false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // D#4
      // E4
      [false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // F4, F#4
      // G4
      [true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // G#4
      // A4
      [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // A#4
      // B4
      [false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      
      // Bass (following piano)
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // C1, C#1
      [false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // D1
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // D#1
      [false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // E1
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // F1, F#1
      [true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false], // G1
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // G#1
      [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // A1
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // A#1
      [false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // B1
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // C2

      // Synth (following piano)
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // C3, C#3
      [false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // D3
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // D#3
      [false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // E3
      ...Array(2).fill(null).map(() => Array(50).fill(false)), // F3, F#3
      [true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false], // G3
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // G#3
      [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // A3
      ...Array(1).fill(null).map(() => Array(50).fill(false)), // A#3
      [false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // B3
      ...Array(TOTAL_TRACKS - 46).fill(null).map(() => Array(50).fill(false)),
    ],
    stepMetadata: Array(TOTAL_TRACKS).fill(null).map(() => Array(50).fill(null).map(() => ({ groupId: null }))),
    channelStates: {
      drums: { muted: false, solo: false, volume: 0.7, expanded: false },
      percussion: { muted: true, solo: false, volume: 0.8, expanded: false },
      piano: { muted: false, solo: false, volume: 0.9, expanded: true },
      bass: { muted: false, solo: false, volume: 0.7, expanded: false },
      synth: { muted: false, solo: false, volume: 0.5, expanded: false },
      fx: { muted: true, solo: false, volume: 0.6, expanded: false }
    },
    octaveSettings: {
      piano: 4
    }
  } ,
  
  
  
  {
    id: 'synth-way-hym',
    name: 'War HYM Synth',
    author: 'Rhythm Studio',
    color: '#500000',
    tempo: 180,
    numSteps: 92,
    timestamp: 1760864241532,
    grid: [
      // Row 0 (C2)
      [true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(32).fill(null).map(() => Array(92).fill(false)),
      // Row 33 (A4)
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, false, false, false, false, true, true, false, false, false, false, false, false, false, false, true, true, false, false, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      // Row 34 (G4)
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(1).fill(null).map(() => Array(92).fill(false)),
      // Row 36 (E4)
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(1).fill(null).map(() => Array(92).fill(false)),
      // Row 38 (C4)
      [true, true, true, true, true, true, true, true, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(3).fill(null).map(() => Array(92).fill(false)),
      // Row 42 (G3)
      [false, false, false, false, false, false, false, false, true, true, true, true, false, true, true, false, false, false, false, false, true, true, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      ...Array(TOTAL_TRACKS - 43).fill(null).map(() => Array(92).fill(false)),
    ],
    stepMetadata: [
      [{ groupId: null }, { groupId: 4 }, { groupId: 4 }, ...Array(89).fill({ groupId: null })],
      ...Array(32).fill(null).map(() => Array(92).fill({ groupId: null })),
      [
        ...Array(30).fill({ groupId: null }),
        { groupId: 24 }, { groupId: 24 }, { groupId: 25 }, { groupId: null },
        { groupId: 26 }, { groupId: 26 }, { groupId: 27 }, { groupId: 27 },
        ...Array(4).fill({ groupId: null }),
        { groupId: 50 }, { groupId: 50 },
        ...Array(6).fill({ groupId: null }),
        { groupId: 55 }, { groupId: 55 },
        ...Array(2).fill({ groupId: null }),
        { groupId: 64 }, { groupId: 64 }, { groupId: 64 }, { groupId: 64 }, { groupId: 64 }, { groupId: 64 }, { groupId: 64 },
        ...Array(29).fill({ groupId: null })
      ],
      [
        ...Array(14).fill({ groupId: null }),
        { groupId: 15 }, { groupId: 15 }, { groupId: 16 }, { groupId: null },
        { groupId: 17 }, { groupId: 17 },
        ...Array(2).fill({ groupId: null }),
        { groupId: 19 }, { groupId: 19 },
        ...Array(67).fill({ groupId: null })
      ],
      Array(92).fill({ groupId: null }),
      [
        ...Array(38).fill({ groupId: null }),
        { groupId: 49 }, { groupId: 49 }, { groupId: 49 }, { groupId: 49 },
        ...Array(2).fill({ groupId: null }),
        { groupId: 51 }, { groupId: 51 },
        ...Array(45).fill({ groupId: null })
      ],
      Array(92).fill({ groupId: null }),
      [
        ...Array(2).fill({ groupId: null }),
        { groupId: 7 }, { groupId: null },
        { groupId: 8 }, { groupId: 8 }, { groupId: 9 }, { groupId: 9 },
        ...Array(3).fill({ groupId: null }),
        { groupId: 13 }, { groupId: 13 },
        ...Array(12).fill({ groupId: null }),
        { groupId: 23 }, { groupId: 23 }, { groupId: 23 }, { groupId: 23 },
        ...Array(16).fill({ groupId: null }),
        { groupId: 52 }, { groupId: 52 }, { groupId: 53 }, { groupId: null },
        { groupId: 54 }, { groupId: 54 },
        ...Array(39).fill({ groupId: null })
      ],
      ...Array(2).fill(null).map(() => Array(92).fill({ groupId: null })),
      [
        ...Array(8).fill({ groupId: null }),
        { groupId: 12 }, { groupId: 12 }, { groupId: 12 }, { groupId: 12 },
        { groupId: null },
        { groupId: 14 }, { groupId: 14 },
        ...Array(5).fill({ groupId: null }),
        { groupId: 18 }, { groupId: 18 },
        ...Array(2).fill({ groupId: null }),
        { groupId: 20 }, { groupId: 20 },
        ...Array(67).fill({ groupId: null })
      ],
      ...Array(TOTAL_TRACKS - 43).fill(null).map(() => Array(92).fill({ groupId: null }))
    ],
    channelStates: {
      drums: { muted: true, solo: false, volume: 0.7, expanded: false },
      percussion: { muted: true, solo: false, volume: 0.8, expanded: false },
      piano: { muted: false, solo: false, volume: 0.9, expanded: true },
      bass: { muted: false, solo: false, volume: 0.7, expanded: false },
      synth: { muted: false, solo: false, volume: 0.5, expanded: true },
      fx: { muted: true, solo: false, volume: 0.6, expanded: false }
    },
    octaveSettings: {
      piano: 3
    }
  }
];