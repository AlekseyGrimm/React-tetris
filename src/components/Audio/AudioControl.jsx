import React, { useEffect, useRef, useState } from "react";
import sound from './sound.svg';
import sound_off from './sound-off.svg';
import './Audio.css';
import sounds from './music.mp3';
import useEvent from '../Utility/UtilityFunction';

function AudioControl() {
  const [isPlaying, setIsPlaying] = useState(false);

  const musicRef = useRef(null);

  useEffect(() => {
    let music = musicRef.current;
    if (isPlaying) {
      music.play();
    } else {
      music.pause();
    }
  }, [isPlaying]);

  const playMusic = () => {
    setIsPlaying((playing) => !playing);
  };

  const handlerKey = (e) => {
    if (e.key == " ") {
      setIsPlaying((playing) => !playing);
    }
  };
  useEvent("keydown", handlerKey);
  return (
    <>
      <audio ref={musicRef} src={sounds}></audio>
      <div className="music-btn">
        <img
          alt="sounds"
          src={isPlaying ? sound : sound_off}
          onClick={playMusic}
        />
      </div>
    </>
  );
}

export default AudioControl;
