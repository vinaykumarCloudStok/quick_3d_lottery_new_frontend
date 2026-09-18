import { Howler, Howl } from "howler";
import winner from '../sound/run-winner.mp3' // Assuming this path is correct
import rollingSound from '../sound/rolling.mp3' // Assuming this path is correct
import BGMusic from '../sound/run-bgm.mp3' // Assuming this path is correct
import cut from '../sound/cut-down.mp3' // Assuming this path is correct

// Declare sound variables
let winnersound: Howl;
let bgmusic: Howl;
let cutsound: Howl;
let rolling: Howl;

/**
 * Loads all the audio files using Howler.js.
 * This function should be called once when the application starts.
 */
export function loadSounds(): void {
  bgmusic = new Howl({ src: [BGMusic], volume: 0.5, loop: true }); // Reduced volume for background music
  winnersound = new Howl({ src: [winner], volume: 1 });
  rolling = new Howl({ src: [rollingSound], volume: 1 });
  cutsound = new Howl({ src: [cut], volume: 1 });
}

/**
 * Plays a given Howl sound object.
 * @param sound The Howl object to play.
 */
function playSoundEffect(sound: Howl | undefined): void {
  if (sound) sound.play();
}

/**
 * Pauses a given Howl sound object.
 * @param sound The Howl object to pause.
 */
function pauseSoundEffect(sound: Howl | undefined): void {
  if (sound) sound.pause();
}

// Exported functions to control individual sounds

// Background Music
export const playBgMusic = () => {
  if (bgmusic && bgmusic.playing()) { // Check if bgmusic is defined and already playing
    bgmusic.stop();
  }
  playSoundEffect(bgmusic);
};

export const pauseBgMusic = () => pauseSoundEffect(bgmusic);

// Winner Sound
export const playWinner = () => playSoundEffect(winnersound);
export const pauseWinner = () => pauseSoundEffect(winnersound);

// Cut Down Sound
export const playCut = () => playSoundEffect(cutsound);
export const pauseCut = () => pauseSoundEffect(cutsound);

// Rolling Sound
export const playRolling = () => playSoundEffect(rolling);
export const pauseRolling = () => pauseSoundEffect(rolling);

/**
 * Unmutes all sounds managed by Howler.js.
 */
export function playAllSounds(): void {
  Howler.mute(false);
}

/**
 * Mutes all sounds managed by Howler.js.
 */
export function muteAllSounds(): void {
  Howler.mute(true);
}

// Initialize sounds when this module is loaded
loadSounds();