import type {
  CreatorCameraStatus,
  CreatorFacingMode,
} from './creatorTypes';

type CreatorToolbarProps = {
  cameraStatus: CreatorCameraStatus;
  facingMode: CreatorFacingMode;
  devices: MediaDeviceInfo[];
  activeDeviceId: string | null;
  recording: boolean;
  recorderStatus: string;
  recordingReady: boolean;
  recorderBusy: boolean;
  onEnableCamera: () => void;
  onFacingModeChange: (facingMode: CreatorFacingMode) => void;
  onDeviceChange: (deviceId: string) => void;
  onRecordToggle: () => void;
  onDownloadRecording: () => void;
  onDiscardRecording: () => void;
};

export default function CreatorToolbar({
  cameraStatus,
  facingMode,
  devices,
  activeDeviceId,
  recording,
  recorderStatus,
  recordingReady,
  recorderBusy,
  onEnableCamera,
  onFacingModeChange,
  onDeviceChange,
  onRecordToggle,
  onDownloadRecording,
  onDiscardRecording
}: CreatorToolbarProps) {
  const isRequestingCamera = cameraStatus === 'requesting';
  const isRequestingRecording = recorderStatus === 'requesting';
  const hasCamera = cameraStatus === 'ready';
  const showDeviceSelect = devices.length > 1;
  const showFacingControls = devices.length > 1;

  return (
    <div className="touch-controls__system creator-toolbar" aria-label="Creator camera and recording tools">
      <div className="creator-toolbar__row" aria-label="Camera controls">
        <button
          type="button"
          className="touch-controls__system-button creator-toolbar__system-button"
          onClick={onEnableCamera}
          disabled={isRequestingCamera}
        >
          {hasCamera ? 'Camera' : isRequestingCamera ? 'Wait' : 'Camera'}
        </button>
        {showFacingControls ? (
          <>
            <button
              type="button"
              className="touch-controls__system-button creator-toolbar__system-button"
              aria-pressed={facingMode === 'user'}
              onClick={() => onFacingModeChange('user')}
              disabled={isRequestingCamera}
            >
              Front
            </button>
            <button
              type="button"
              className="touch-controls__system-button creator-toolbar__system-button"
              aria-pressed={facingMode === 'environment'}
              onClick={() => onFacingModeChange('environment')}
              disabled={isRequestingCamera}
            >
              Rear
            </button>
          </>
        ) : null}
      </div>

      <div className="creator-toolbar__row" aria-label="Camera device and recording controls">
        {showDeviceSelect ? (
          <label className="touch-controls__system-button creator-toolbar__system-select">
          <select
            value={activeDeviceId ?? ''}
            onChange={(event) => onDeviceChange(event.currentTarget.value)}
            disabled={isRequestingCamera}
            aria-label="Camera device"
          >
            <option value="" disabled>
              Camera
            </option>
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
          </label>
        ) : null}

        <button
          type="button"
          className="touch-controls__system-button creator-toolbar__record-button"
          aria-pressed={recording}
          onClick={onRecordToggle}
          disabled={recorderBusy || isRequestingRecording}
        >
          <span aria-hidden="true" />
          <b>{isRequestingRecording ? 'Choose tab' : recording ? 'Recording' : 'Record'}</b>
        </button>
        {recordingReady ? (
          <>
            <button type="button" className="touch-controls__system-button creator-toolbar__system-button" onClick={onDownloadRecording}>
              Save
            </button>
            <button type="button" className="touch-controls__system-button creator-toolbar__system-button" onClick={onDiscardRecording}>
              Clear
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
