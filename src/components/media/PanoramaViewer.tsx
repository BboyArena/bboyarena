import { useEffect, useRef } from 'react';
import { EquirectangularAdapter, Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface PanoramaViewerProps {
  image: string;
}

export default function PanoramaViewer({ image }: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let viewer: Viewer | null = null;
    let rafId = 0;
    let disposed = false;

    const stop = () => {
      disposed = true;

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      try {
        viewer?.destroy();
      } catch {
        // No-op.
      }

      viewer = null;
    };

    const spin = () => {
      if (disposed) return;
      if (!mount.isConnected) {
        stop();
        return;
      }

      try {
        const pos = viewer?.getPosition();
        if (pos) {
          viewer?.rotate({
            yaw: pos.yaw + 0.001,
            pitch: pos.pitch
          });
        }
      } catch {
        // Ignore rotation hiccups while the viewer is initializing or tearing down.
      }

      rafId = window.requestAnimationFrame(spin);
    };

    const init = async () => {
      try {
        viewer = new Viewer({
          container: mount,
          panorama: image,
          adapter: EquirectangularAdapter,
          navbar: false,
          mousewheel: false,
          mousewheelCtrlKey: true,
          touchmoveTwoFingers: true,
          keyboard: false,
          defaultYaw: '0deg',
          defaultPitch: '-5deg',
          defaultZoomLvl: 40,
          minFov: 28,
          maxFov: 85,
          moveInertia: 0.92,
          loadingTxt: 'Loading panorama...'
        });

        viewer.addEventListener(
          'ready',
          () => {
            if (!disposed) {
              rafId = window.requestAnimationFrame(spin);
            }
          },
          { once: true }
        );
      } catch {
        mount.innerHTML = '';
      }
    };

    void init();

    window.addEventListener('pagehide', stop, { once: true });
    window.addEventListener('beforeunload', stop, { once: true });

    return stop;
  }, [image]);

  return <div ref={mountRef} className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${image}')` }} data-psv-panorama-container />;
}
