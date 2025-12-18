import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderProps {
  onChunkReady: (blob: Blob) => void;
  intervalMs?: number;
}

export const useAudioRecorder = ({ 
  onChunkReady, 
  intervalMs = 15000 
}: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startNewSegment = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecordingRef.current) return;
    
    // Stop current to trigger onstop which sends the chunk
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const tick = useCallback(() => {
    if (!isRecordingRef.current) return;

    const now = Date.now();
    const currentElapsed = now - startTimeRef.current;
    setElapsedTime(currentElapsed);

    if (currentElapsed >= intervalMs) {
      startNewSegment();
    } else {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [intervalMs, startNewSegment]);

  const setupRecorder = useCallback(() => {
    if (!streamRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
      ? 'audio/webm;codecs=opus' 
      : 'audio/webm';
      
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size > 0) {
        onChunkReady(blob);
      }
      chunksRef.current = [];
      
      // If we are still supposed to be recording, start the next segment immediately
      if (isRecordingRef.current) {
        startTimeRef.current = Date.now();
        setElapsedTime(0);
        setupRecorder(); // Prepare next recorder
        mediaRecorderRef.current?.start();
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };
  }, [onChunkReady, tick]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      isRecordingRef.current = true;
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      
      setupRecorder();
      mediaRecorderRef.current?.start();
      animationFrameRef.current = requestAnimationFrame(tick);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, [setupRecorder, tick]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return {
    isRecording,
    elapsedTime,
    startRecording,
    stopRecording
  };
};