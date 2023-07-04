import * as THREE from 'three';

export function playAudio(audioFile, camera, volume, randomValue) {
    const listener = new THREE.AudioListener();
    camera.add(listener);
  
    const audioLoader = new THREE.AudioLoader();
  
    return new Promise((resolve, reject) => {
      audioLoader.load(audioFile, function (buffer) {
        const audio = new THREE.Audio(listener);
        audio.setBuffer(buffer);
        audio.setVolume(volume);
        audio.randomValue = randomValue;
        resolve(audio);
      }, undefined, reject);
    });
  }
  
  export function setVolume(audio, volume) {
    if (audio) {
      audio.setVolume(volume);
    }
  }
  