import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  themeColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  isRecording,
  themeColor = '#e06c5f'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !stream) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      // Draw resting state
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#d4cbc0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const barCount = 48;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(3, percent * height * 0.85);

          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          // Gradient or color
          ctx.fillStyle = themeColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      };

      draw();
    } catch (err) {
      console.warn('Audio visualization failed to start:', err);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isRecording, stream, themeColor]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={520}
        height={48}
        className="w-full max-w-lg h-12 rounded-lg"
      />
    </div>
  );
};
