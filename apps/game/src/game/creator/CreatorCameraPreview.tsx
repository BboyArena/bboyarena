import { useEffect, useRef } from 'react';
import type { CreatorCameraStatus, CreatorFacingMode } from './creatorTypes';

type CreatorCameraPreviewProps = {
  stream: MediaStream | null;
  status: CreatorCameraStatus;
  facingMode: CreatorFacingMode;
  mirrored: boolean;
  filter: string;
  error: {
    title: string;
    message: string;
  } | null;
  onEnable: () => void;
  onVideoElement: (video: HTMLVideoElement | null) => void;
};

export default function CreatorCameraPreview({
  stream,
  status,
  facingMode,
  mirrored,
  filter,
  error,
  onEnable,
  onVideoElement
}: CreatorCameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isReady = status === 'ready' && stream !== null;

  useEffect(() => {
    const video = videoRef.current;
    onVideoElement(video);
    if (!video) return;

    video.srcObject = stream;

    if (stream) {
      void video.play().catch(() => {
        // The explicit enable action normally satisfies autoplay rules.
      });
    }

    return () => {
      video.srcObject = null;
      onVideoElement(null);
    };
  }, [onVideoElement, stream]);

  return (
    <div className="creator-camera-preview" aria-label="Creator camera preview" data-camera-status={status}>
      <video
        ref={videoRef}
        className="creator-camera-preview__video"
        data-facing={facingMode}
        data-mirrored={mirrored}
        style={{ filter }}
        autoPlay
        muted
        playsInline
      />

      {!isReady ? (
        <div className="creator-camera-preview__placeholder" role={error ? 'alert' : undefined}>
          <span className="creator-camera-preview__kicker">Camera preview</span>
          <strong>{error?.title ?? (status === 'requesting' ? 'Opening camera' : 'Enable camera')}</strong>
          <span>
            {error?.message ?? 'Permission is requested only after this explicit action. Video-only, local processing.'}
          </span>
          <button
            type="button"
            className="creator-camera-preview__button"
            onClick={onEnable}
            disabled={status === 'requesting'}
          >
            {status === 'requesting' ? 'Requesting...' : error ? 'Retry camera' : 'Enable camera'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
