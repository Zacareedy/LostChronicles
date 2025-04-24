import { Howl } from 'howler';

// Sound effects
const sounds: Record<string, Howl> = {
  beep: new Howl({
    src: ['https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/error.mp3'],
    volume: 0.3
  }),
  typing: new Howl({
    src: ['https://freesound.org/data/previews/243/243380_4056007-lq.mp3'],
    volume: 0.1,
    sprite: {
      short: [0, 300],
    }
  }),
  countdown: new Howl({
    src: ['https://freesound.org/data/previews/274/274625_5014597-lq.mp3'],
    volume: 0.5
  }),
  success: new Howl({
    src: ['https://freesound.org/data/previews/320/320654_5260872-lq.mp3'],
    volume: 0.3
  }),
  fail: new Howl({
    src: ['https://freesound.org/data/previews/276/276960_5014597-lq.mp3'],
    volume: 0.3
  }),
  button: new Howl({
    src: ['https://freesound.org/data/previews/521/521642_6142149-lq.mp3'],
    volume: 0.2
  }),
  alarm: new Howl({
    src: ['https://freesound.org/data/previews/198/198841_3633978-lq.mp3'],
    volume: 0.3
  }),
  static: new Howl({
    src: ['https://freesound.org/data/previews/67/67409_956211-lq.mp3'],
    volume: 0.05,
    loop: true
  })
};

// Audio logs with transmission content
const audioLogs: Record<string, { title: string, description: string, src: string, duration: string }> = {
  orientationVideo: {
    title: "Orientation Video",
    description: "...I'm Dr. Marvin Candle, and this is the orientation film for Station 3 of the DHARMA Initiative...",
    src: "https://freesound.org/data/previews/386/386738_7286332-lq.mp3",
    duration: "2:42"
  },
  distressSignal: {
    title: "Distress Signal",
    description: "...please, they're all dead... it killed them all...",
    src: "https://freesound.org/data/previews/459/459490_9482901-lq.mp3", 
    duration: "1:15"
  },
  radioTransmission: {
    title: "Radio Transmission",
    description: "4...8...15...16...23...42... 4...8...15...16...23...42...",
    src: "https://freesound.org/data/previews/459/459978_4625055-lq.mp3",
    duration: "0:34"
  },
  unknownSource: {
    title: "Unknown Source",
    description: "[STATIC] ...don't turn it off... the bearing is 325... [STATIC]",
    src: "https://freesound.org/data/previews/495/495223_6142149-lq.mp3",
    duration: "1:02"
  }
};

const playSound = (soundName: keyof typeof sounds, sprite?: string) => {
  if (sprite) {
    sounds[soundName].play(sprite);
  } else {
    sounds[soundName].play();
  }
};

const stopSound = (soundName: keyof typeof sounds) => {
  sounds[soundName].stop();
};

export { sounds, audioLogs, playSound, stopSound };
