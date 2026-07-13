import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CreatorHudSnapshot,
  CreatorRecorderStatus,
  CreatorVideoFilter
} from './creatorTypes';

type UseCreatorRecorderOptions = {
  videoElement: HTMLVideoElement | null;
  hud: CreatorHudSnapshot;
  filter: CreatorVideoFilter;
  mirrored: boolean;
};

const mimeCandidates = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm'
];

function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return null;
  return mimeCandidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
}

function getRecordingFilename(mimeType: string) {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ];
  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
  return `bboyarena-creator-${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}.${extension}`;
}

export function useCreatorRecorder({
  videoElement: _videoElement,
  hud: _hud,
  filter: _filter,
  mirrored: _mirrored
}: UseCreatorRecorderOptions) {
  const [status, setStatus] = useState<CreatorRecorderStatus>('idle');
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(() => getSupportedMimeType());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const revokeRecordingUrl = useCallback(() => {
    setRecordingUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
  }, []);

  const stopDisplayStream = useCallback(() => {
    displayStreamRef.current?.getTracks().forEach((track) => track.stop());
    displayStreamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    const selectedMimeType = getSupportedMimeType();

    setMimeType(selectedMimeType);

    if (!selectedMimeType || typeof MediaRecorder === 'undefined') {
      setStatus('unsupported');
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus('error');
      return;
    }

    revokeRecordingUrl();
    chunksRef.current = [];
    setStatus('requesting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CreatorMode] display capture failed', error);
      }
      setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'idle' : 'error');
      return;
    }

    displayStreamRef.current = stream;
    const recorder = new MediaRecorder(stream, selectedMimeType ? { mimeType: selectedMimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onerror = () => {
      stopDisplayStream();
      setStatus('error');
    };
    recorder.onstop = () => {
      stopDisplayStream();
      const blob = new Blob(chunksRef.current, { type: selectedMimeType || 'video/webm' });
      chunksRef.current = [];
      recorderRef.current = null;
      setRecordingUrl(URL.createObjectURL(blob));
      setStatus('ready');
    };

    stream.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (recorder.state !== 'inactive') recorder.stop();
    }, { once: true });

    recorder.start();
    setStatus('recording');
  }, [revokeRecordingUrl, stopDisplayStream]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setStatus('stopping');
    recorder.stop();
  }, []);

  const discardRecording = useCallback(() => {
    revokeRecordingUrl();
    setStatus('idle');
  }, [revokeRecordingUrl]);

  const downloadRecording = useCallback(() => {
    if (!recordingUrl) return;
    const anchor = document.createElement('a');
    anchor.href = recordingUrl;
    anchor.download = getRecordingFilename(mimeType ?? 'video/webm');
    anchor.click();
  }, [mimeType, recordingUrl]);

  useEffect(() => () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    stopDisplayStream();
    revokeRecordingUrl();
  }, [revokeRecordingUrl, stopDisplayStream]);

  return {
    status,
    recordingUrl,
    mimeType,
    startRecording,
    stopRecording,
    discardRecording,
    downloadRecording
  };
}
