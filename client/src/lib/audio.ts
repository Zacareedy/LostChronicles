/**
 * Simple audio utility for playing sound effects
 */

const DEFAULT_VOLUME = 0.4;

// Sound cache to prevent reloading sounds
const soundCache: Record<string, HTMLAudioElement> = {};

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

// Available sounds with their paths
const sounds = {
  beep: {
    normal: '/sounds/beep.mp3',
    success: '/sounds/beep-success.mp3',
    warning: '/sounds/beep-warning.mp3',
    short: '/sounds/beep-short.mp3',
    alarm: '/sounds/alarm.mp3', // Added here to fix type errors
  },
  click: '/sounds/click.mp3',
  error: '/sounds/error.mp3',
  success: '/sounds/success.mp3',
  fail: '/sounds/fail.mp3',
  alarm: '/sounds/alarm.mp3',
  select: '/sounds/select.mp3',
  static: '/sounds/static.mp3',
  terminal: '/sounds/terminal.mp3',
};

type SoundKey = keyof typeof sounds;
type BeepVariant = keyof typeof sounds.beep;

/**
 * Play a sound by key
 */
export function playSound(
  key: SoundKey,
  variant?: BeepVariant,
  options: SoundOptions = {}
): HTMLAudioElement | null {
  try {
    let soundPath = '';
    
    // Handle sounds with variants
    if (key === 'beep' && variant) {
      soundPath = sounds.beep[variant];
    } else {
      soundPath = typeof sounds[key] === 'string' 
        ? sounds[key] as string
        : (sounds[key] as any).normal;
    }
    
    // Create cache key
    const cacheKey = `${key}${variant ? `-${variant}` : ''}`;
    
    // Check if sound exists in cache
    if (!soundCache[cacheKey]) {
      soundCache[cacheKey] = new Audio(soundPath);
    }
    
    const sound = soundCache[cacheKey];
    sound.volume = options.volume ?? DEFAULT_VOLUME;
    sound.loop = options.loop ?? false;
    
    // Reset position if already playing
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
    
    sound.play().catch(err => {
      console.warn(`Failed to play sound: ${key}`, err);
    });
    
    return sound;
  } catch (error) {
    console.warn(`Error playing sound: ${key}`, error);
    return null;
  }
}

/**
 * Stop a currently playing sound
 */
export function stopSound(
  key: SoundKey, 
  variant?: BeepVariant
): void {
  try {
    const cacheKey = `${key}${variant ? `-${variant}` : ''}`;
    
    if (soundCache[cacheKey]) {
      soundCache[cacheKey].pause();
      soundCache[cacheKey].currentTime = 0;
    }
  } catch (error) {
    console.warn(`Error stopping sound: ${key}`, error);
  }
}

/**
 * Preload sounds for immediate playback
 */
export function preloadSounds(): void {
  try {
    // Preload main sounds
    Object.entries(sounds).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const audio = new Audio(value);
        soundCache[key] = audio;
      } else if (key === 'beep') {
        // Preload beep variants
        Object.entries(value).forEach(([variant, path]) => {
          const audio = new Audio(path);
          soundCache[`beep-${variant}`] = audio;
        });
      }
    });
    
    console.log('Audio sounds preloaded');
  } catch (error) {
    console.warn('Error preloading sounds', error);
  }
}

export default {
  playSound,
  stopSound,
  preloadSounds
};