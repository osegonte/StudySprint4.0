import { useEffect, useRef, useState } from 'react';

export function useWebSocketTimer(sessionId: string | null) {
  const [timerState, setTimerState] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000/sessions/${sessionId}/timer`;
    ws.current = new window.WebSocket(url);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'timer_update') {
        setTimerState(data.state);
      }
    };
    ws.current.onerror = () => ws.current?.close();
    return () => ws.current?.close();
  }, [sessionId]);

  return timerState;
} 