import React, { useState, useEffect } from 'react';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { MicIcon, PlayIcon, StopIcon, RedoIcon, SubmitIcon, PauseIcon } from './icons/Icons';
import { Demographics } from '../types';
import { extractMFCC } from '../utils/mfcc';

interface RecordingStepProps {
  phrase: string;
  phraseNumber: number;
  totalPhrases: number;
  onSubmit: (audioBlob: Blob) => void;
  demographics: Demographics | null;
}

const RecordingStep: React.FC<RecordingStepProps> = ({ phrase, phraseNumber, totalPhrases, onSubmit, demographics }) => {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordingState,
    audioUrl,
    audioBlob,
    resetRecorder,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    }
  }, [audioUrl]);

  const handlePlay = () => {
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleStopPlayback = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  }

  const handleRerecord = () => {
    if(isPlaying) handleStopPlayback();
    resetRecorder();
  };

  const handleSubmit = async () => {
    if (audioBlob && demographics) {
      if(isPlaying) handleStopPlayback();

      try {
        // Fix: Cast window to 'any' to support vendor-prefixed webkitAudioContext for older browsers.
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const mfccs = extractMFCC(audioBuffer);

        const filename = `${demographics.name}_${demographics.age}_${demographics.gender}_phrase${phraseNumber}`;
        const mfccKey = `${filename}_mfcc`;

        localStorage.setItem(mfccKey, JSON.stringify(mfccs));
        console.log(`MFCCs saved to localStorage with key: ${mfccKey}`);
        
      } catch (error) {
        console.error("Failed to extract or save MFCCs:", error);
      }

      onSubmit(audioBlob);
      resetRecorder();
    }
  };
  
  const getButtonState = () => {
    if (recordingState === 'recording' || recordingState === 'paused') {
      return (
        <div className="flex justify-center items-center space-x-4">
          <button 
            onClick={recordingState === 'recording' ? pauseRecording : resumeRecording} 
            className="p-4 rounded-full bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition-colors">
            {recordingState === 'recording' ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={stopRecording} className="p-6 rounded-full bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50">
            <StopIcon />
          </button>
        </div>
      );
    }
    
    if (audioUrl) {
       return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button onClick={handleRerecord} className="flex items-center gap-2 w-full sm:w-auto justify-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-full transition-colors">
            <RedoIcon /> Ulangi
          </button>
          <button onClick={isPlaying ? handleStopPlayback : handlePlay} className="flex items-center gap-2 w-full sm:w-auto justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors">
            {isPlaying ? <StopIcon /> : <PlayIcon />} {isPlaying ? 'Hentikan' : 'Putar Ulang'}
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
            <SubmitIcon /> Kirim
          </button>
        </div>
      );
    }

    return (
      <button onClick={startRecording} className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/50 transform hover:scale-105">
        <MicIcon />
      </button>
    );
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center">
      <div className="w-full text-center mb-6">
          <p className="text-cyan-400 font-semibold">Frasa {phraseNumber} dari {totalPhrases}</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(phraseNumber / totalPhrases) * 100}%` }}></div>
          </div>
      </div>
      <p className="text-gray-400 mb-4">Bacalah kalimat berikut dengan jelas:</p>
      <div className="w-full bg-gray-900/50 p-6 rounded-lg mb-8 border border-gray-600">
        <p className="text-2xl text-center font-medium text-white">"{phrase}"</p>
      </div>

      <div className="h-24 flex items-center justify-center">
         {getButtonState()}
      </div>

    </div>
  );
};

export default RecordingStep;