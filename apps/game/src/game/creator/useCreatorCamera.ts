import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreatorCameraStatus, CreatorFacingMode } from './creatorTypes';

type StartCameraOptions = {
  facingMode?: CreatorFacingMode;
  deviceId?: string;
};

type CreatorCameraError = {
  title: string;
  message: string;
};

function getCameraError(error: unknown): { status: CreatorCameraStatus; error: CreatorCameraError } {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return {
      status: 'unavailable',
      error: {
        title: 'Camera blocked',
        message: 'Camera access needs HTTPS or localhost.'
      }
    };
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return {
        status: 'denied',
        error: {
          title: 'Camera permission denied',
          message: 'Allow camera access in the browser, then try again.'
        }
      };
    }

    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      return {
        status: 'unavailable',
        error: {
          title: 'No camera found',
          message: 'No matching camera is available on this device.'
        }
      };
    }

    if (error.name === 'NotReadableError' || error.name === 'AbortError') {
      return {
        status: 'error',
        error: {
          title: 'Camera unavailable',
          message: 'The camera may already be used by another app.'
        }
      };
    }
  }

  return {
    status: 'error',
    error: {
      title: 'Camera error',
      message: 'The camera could not be started. Try again or choose another device.'
    }
  };
}

function hasCameraApi() {
  return typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia);
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useCreatorCamera() {
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CreatorCameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<CreatorFacingMode>('user');
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<CreatorCameraError | null>(null);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(allDevices.filter((device) => device.kind === 'videoinput'));
  }, []);

  const stopCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setActiveDeviceId(null);
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async (options: StartCameraOptions = {}) => {
    if (!hasCameraApi()) {
      setStatus('unavailable');
      setError({
        title: 'Camera unavailable',
        message: 'This browser does not expose camera access.'
      });
      return;
    }

    const nextFacingMode = options.facingMode ?? facingMode;
    setStatus('requesting');
    setError(null);
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);

    const videoConstraints: MediaTrackConstraints = options.deviceId
      ? { deviceId: { exact: options.deviceId } }
      : { facingMode: { ideal: nextFacingMode } };

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      streamRef.current = nextStream;
      setStream(nextStream);
      setStatus('ready');
      setFacingMode(nextFacingMode);

      const videoTrack = nextStream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      setActiveDeviceId(settings?.deviceId ?? options.deviceId ?? null);
      videoTrack?.addEventListener('ended', () => {
        setStatus('unavailable');
        setStream(null);
        streamRef.current = null;
      }, { once: true });

      await refreshDevices();
    } catch (cameraError) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
      const resolvedError = getCameraError(cameraError);
      setStatus(resolvedError.status);
      setError(resolvedError.error);

      if (import.meta.env.DEV) {
        console.warn('[CreatorMode] camera start failed', cameraError);
      }
    }
  }, [facingMode, refreshDevices]);

  const switchFacingMode = useCallback((nextFacingMode: CreatorFacingMode) => {
    void startCamera({ facingMode: nextFacingMode });
  }, [startCamera]);

  const selectDevice = useCallback((deviceId: string) => {
    void startCamera({ deviceId });
  }, [startCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    status,
    stream,
    facingMode,
    activeDeviceId,
    devices,
    error,
    startCamera,
    stopCamera,
    switchFacingMode,
    selectDevice
  };
}
