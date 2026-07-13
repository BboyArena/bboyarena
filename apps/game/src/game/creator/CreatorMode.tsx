import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameCopy } from '../copy';
import { useGameStore } from '../state/useGameStore';
import type { GameInputButtonId } from '../input/gameInputTypes';
import CreatorCameraPreview from './CreatorCameraPreview';
import CreatorControlsOverlay from './CreatorControlsOverlay';
import CreatorToolbar from './CreatorToolbar';
import {
  creatorMoveLabels,
  creatorVideoFilters,
  type CreatorFacingMode,
  type CreatorHudSnapshot,
  type CreatorStickSnapshot,
  type CreatorTimingFeedback,
  type CreatorVideoFilter
} from './creatorTypes';
import { useCreatorCamera } from './useCreatorCamera';
import { useCreatorRecorder } from './useCreatorRecorder';
import './creator.css';

type CreatorModeProps = {
  copy: GameCopy;
};

const initialStick: CreatorStickSnapshot = { x: 0, y: 0, active: false };
const feedbackCycle: CreatorTimingFeedback[] = ['perfect', 'good', 'miss'];

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function CreatorMode({ copy }: CreatorModeProps) {
  const openMainMenu = useGameStore((state) => state.openMainMenu);
  const gameBpm = useGameStore((state) => state.bpm);
  const camera = useCreatorCamera();
  const [cameraVideoElement, setCameraVideoElement] = useState<HTMLVideoElement | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const [hud, setHud] = useState<CreatorHudSnapshot>(() => ({
    leftStick: initialStick,
    rightStick: initialStick,
    pressedButtons: [],
    bpm: gameBpm,
    score: 0,
    combo: 0,
    moveName: null,
    timingFeedback: null,
    elapsedMs: 0,
    recording: false
  }));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  useEffect(() => {
    setHud((current) => ({ ...current, elapsedMs }));
  }, [elapsedMs]);

  const hudStats = useMemo(() => [
    { label: copy.timer, value: formatElapsedTime(hud.elapsedMs) },
    { label: 'BPM', value: hud.bpm.toString() },
    { label: copy.score, value: hud.score.toString().padStart(5, '0') },
    { label: 'Combo', value: `x${hud.combo}` }
  ], [copy.score, copy.timer, hud.bpm, hud.combo, hud.elapsedMs, hud.score]);
  const beatDurationMs = 60000 / Math.max(1, hud.bpm);
  const beatPosition = hud.elapsedMs / beatDurationMs;
  const beatIndex = Math.floor(beatPosition);
  const beatPhase = beatPosition - beatIndex;
  const moveProgress = Math.min(1, (hud.combo % 8) / 8);
  const activeFilter: CreatorVideoFilter = creatorVideoFilters[activeFilterIndex] ?? creatorVideoFilters[0];
  const mirrorPreview = camera.facingMode === 'user' && camera.devices.length > 1;
  const recorder = useCreatorRecorder({
    videoElement: cameraVideoElement,
    hud,
    filter: activeFilter,
    mirrored: mirrorPreview
  });

  const setCameraPreviewVideo = useCallback((video: HTMLVideoElement | null) => {
    setCameraVideoElement(video);
  }, []);

  useEffect(() => {
    setHud((current) => ({ ...current, recording: recorder.status === 'recording' }));
  }, [recorder.status]);

  const updateStick = (stick: 'left' | 'right', snapshot: CreatorStickSnapshot) => {
    setHud((current) => ({
      ...current,
      [stick === 'left' ? 'leftStick' : 'rightStick']: snapshot
    }));
  };

  const updateButton = (button: GameInputButtonId, pressed: boolean) => {
    setHud((current) => {
      const pressedButtons = pressed
        ? Array.from(new Set([...current.pressedButtons, button]))
        : current.pressedButtons.filter((item) => item !== button);

      if (!pressed) {
        return { ...current, pressedButtons };
      }

      const nextCombo = current.combo + 1;
      const timingFeedback = feedbackCycle[nextCombo % feedbackCycle.length];
      const isMiss = timingFeedback === 'miss';

      return {
        ...current,
        pressedButtons,
        score: isMiss ? current.score : current.score + 125 + nextCombo * 10,
        combo: isMiss ? 0 : nextCombo,
        moveName: creatorMoveLabels[button] ?? button,
        timingFeedback
      };
    });
  };

  const stepBpm = (direction: 1 | -1) => {
    setHud((current) => ({
      ...current,
      bpm: Math.max(60, Math.min(180, current.bpm + direction))
    }));
  };

  const stepFilter = (direction: 1 | -1) => {
    setActiveFilterIndex((current) => (
      current + direction + creatorVideoFilters.length
    ) % creatorVideoFilters.length);
  };

  const enableCamera = () => {
    void camera.startCamera();
  };

  const switchCamera = (nextFacingMode: CreatorFacingMode) => {
    camera.switchFacingMode(nextFacingMode);
  };

  const selectCameraDevice = (deviceId: string) => {
    if (!deviceId) return;
    camera.selectDevice(deviceId);
  };

  const toggleRecording = () => {
    if (recorder.status === 'recording') {
      recorder.stopRecording();
      return;
    }
    recorder.startRecording();
  };

  const exitCreatorMode = () => {
    if (recorder.status === 'recording') recorder.stopRecording();
    camera.stopCamera();
    openMainMenu();
  };

  return (
    <section className="creator-mode" aria-label={copy.creatorMode}>
      <CreatorCameraPreview
        stream={camera.stream}
        status={camera.status}
        facingMode={camera.facingMode}
        mirrored={mirrorPreview}
        filter={activeFilter.cssFilter}
        error={camera.error}
        onEnable={enableCamera}
        onVideoElement={setCameraPreviewVideo}
      />

      <button type="button" className="creator-exit-button" onClick={exitCreatorMode}>
        <span aria-hidden="true">←</span>
        {copy.backToMenu}
      </button>

      <aside
        className="game-active-move-hud creator-active-move-hud"
        aria-live="polite"
        aria-label="Creator active move"
      >
        <span>Choose a move</span>
        <strong>{hud.moveName ?? 'Freestyle ready'}</strong>
        <small>{hud.timingFeedback ?? `Filter: ${activeFilter.label}`}</small>
        <div className="game-active-move-hud__progress" aria-label={`Creator loop ${Math.round(moveProgress * 100)}% complete`}>
          <i style={{ transform: `scaleX(${moveProgress || 0.08})` }} />
        </div>
      </aside>

      <aside
        className="game-rhythm-status"
        data-active={beatPhase < 0.18}
        aria-label={`Beat ${(beatIndex % 4) + 1} of 4, ${hud.bpm} BPM, creator score ${hud.score}, time ${formatElapsedTime(hud.elapsedMs)}`}
      >
        <div className="game-rhythm-status__beat" aria-hidden="true">
          <i />
          <strong>{(beatIndex % 4) + 1}/4</strong>
        </div>
        {hudStats.slice(1, 3).map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
        <div>
          <span>Time</span>
          <strong>{formatElapsedTime(hud.elapsedMs)}</strong>
        </div>
      </aside>

      <CreatorControlsOverlay
        hud={hud}
        onStickChange={updateStick}
        onButtonChange={updateButton}
        onBpmStep={stepBpm}
        onFilterStep={stepFilter}
        systemControls={(
          <CreatorToolbar
            cameraStatus={camera.status}
            facingMode={camera.facingMode}
            devices={camera.devices}
            activeDeviceId={camera.activeDeviceId}
            recording={hud.recording}
            recorderStatus={recorder.status}
            recordingReady={recorder.status === 'ready'}
            recorderBusy={recorder.status === 'stopping'}
            onEnableCamera={enableCamera}
            onFacingModeChange={switchCamera}
            onDeviceChange={selectCameraDevice}
            onRecordToggle={toggleRecording}
            onDownloadRecording={recorder.downloadRecording}
            onDiscardRecording={recorder.discardRecording}
          />
        )}
      />
      {recorder.recordingUrl ? (
        <div className="creator-recording-preview">
          <video src={recorder.recordingUrl} controls playsInline />
        </div>
      ) : null}
      {recorder.status === 'unsupported' || recorder.status === 'error' ? (
        <div className="creator-recorder-status" role="status">
          {recorder.status === 'unsupported'
            ? 'Screen capture is not supported in this browser.'
            : 'Screen capture failed. Press Record again and choose this tab or the game window.'}
        </div>
      ) : null}
    </section>
  );
}
