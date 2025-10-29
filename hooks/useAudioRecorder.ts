
import { useState, useRef, useCallback } from 'react';

type RecordingState = 'inactive' | 'recording' | 'paused' | 'stopped';

const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstart = () => {
        audioChunksRef.current = [];
        setRecordingState('recording');
        setAudioUrl(null);
        setAudioBlob(null);
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState('stopped');
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onpause = () => {
        setRecordingState('paused');
      };

      mediaRecorder.onresume = () => {
        setRecordingState('recording');
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      // Handle permissions error gracefully in a real app
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);
  
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
    }
  }, [recordingState]);
  
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
    }
  }, [recordingState]);

  const resetRecorder = useCallback(() => {
    setRecordingState('inactive');
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    if(mediaRecorderRef.current){
        mediaRecorderRef.current = null;
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecorder,
    recordingState,
    audioUrl,
    audioBlob,
  };
};

export default useAudioRecorder;
