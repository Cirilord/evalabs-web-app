import { type Viewport } from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';

function getStorageKey(workflowId: string) {
  return `workflow:${workflowId}:viewport`;
}

function loadWorkflowViewport(workflowId: string): Viewport | undefined {
  try {
    const viewport = JSON.parse(window.localStorage.getItem(getStorageKey(workflowId)) ?? 'null');

    if (
      viewport &&
      Number.isFinite(viewport.x) &&
      Number.isFinite(viewport.y) &&
      Number.isFinite(viewport.zoom) &&
      viewport.zoom > 0
    ) {
      return { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function createWorkflowViewportSaver(workflowId: string) {
  let pendingViewport: Viewport | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    clearTimeout(timer);
    timer = undefined;

    if (!pendingViewport) {
      return;
    }

    try {
      window.localStorage.setItem(getStorageKey(workflowId), JSON.stringify(pendingViewport));
    } catch {
      // Viewport preferences are optional when browser storage is unavailable.
    }

    pendingViewport = undefined;
  }

  return {
    flush,
    schedule(viewport: Viewport) {
      pendingViewport = { ...viewport };
      clearTimeout(timer);
      timer = setTimeout(flush, 300);
    },
  };
}

export function useWorkflowViewport(workflowId: string) {
  const [initialViewport] = useState(() => loadWorkflowViewport(workflowId));
  const viewportSaver = useMemo(() => createWorkflowViewportSaver(workflowId), [workflowId]);

  useEffect(() => {
    window.addEventListener('pagehide', viewportSaver.flush);

    return () => {
      window.removeEventListener('pagehide', viewportSaver.flush);
      viewportSaver.flush();
    };
  }, [viewportSaver]);

  return { initialViewport, scheduleViewportSave: viewportSaver.schedule };
}
