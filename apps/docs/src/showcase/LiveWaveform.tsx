import * as React from "react";

export interface LiveWaveformProps {
  /** Mutually exclusive: when true the mic is captured and bars respond to it. */
  active: boolean;
  /** When true, bars show a processing shimmer instead of mic input. */
  processing?: boolean;
  /** "static" paints bars in place; "scrolling" shifts history leftward. */
  mode?: "static" | "scrolling";
  /** Visible height in CSS px. Default: 80. */
  height?: number;
  /** Bar width in px. Default: 3. */
  barWidth?: number;
  /** Space between bars in px. Default: 2. */
  barGap?: number;
  /** Fade the left and right edges. Default: true. */
  fadeEdges?: boolean;
  /** Base bar colour. Default: var(--hg-color-ink). */
  barColor?: string;
  /** Scroll-mode history length (bars). Default: 120. */
  historySize?: number;
  /** Called when the mic cannot be opened (permission denied, no device). */
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * A live audio waveform with two modes. In static mode the bars paint in a
 * fixed row; in scrolling mode the history shifts leftward each frame. When
 * active the component captures the microphone and reads frequency data via
 * the Web Audio API; when processing it draws a soft procedural shimmer.
 * Stops the stream and releases audio resources on unmount or when active
 * flips off.
 */
export function LiveWaveform({
  active,
  processing = false,
  mode = "static",
  height = 80,
  barWidth = 3,
  barGap = 2,
  fadeEdges = true,
  barColor = "var(--hg-color-ink, #111)",
  historySize = 120,
  onError,
  className,
}: LiveWaveformProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const history = React.useRef<number[]>([]);
  const [width, setWidth] = React.useState(400);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => setWidth(canvas.clientWidth));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [width, height]);

  React.useEffect(() => {
    const resolvedColor = (() => {
      const probe = document.createElement("span");
      probe.style.color = barColor;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c || barColor;
    })();

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let data: Uint8Array | null = null;
    let cancelled = false;
    let t0 = performance.now();

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      stream?.getTracks().forEach((tr) => tr.stop());
      stream = null;
      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
    };

    const setup = async () => {
      if (!active) return;
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone not supported in this browser.");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const step = barWidth + barGap;
      const slots = Math.max(1, Math.floor(width / step));
      const now = performance.now();
      const t = (now - t0) / 1000;

      // Compute amplitude per slot.
      const amps = new Float32Array(slots);
      if (active && analyser && data) {
        analyser.getByteFrequencyData(data as unknown as Uint8Array<ArrayBuffer>);
        const chunk = data.length / slots;
        for (let i = 0; i < slots; i++) {
          let sum = 0;
          const lo = Math.floor(i * chunk);
          const hi = Math.floor((i + 1) * chunk);
          for (let j = lo; j < hi; j++) sum += data[j]!;
          amps[i] = sum / (hi - lo || 1) / 255;
        }
      } else if (processing) {
        for (let i = 0; i < slots; i++) {
          amps[i] = 0.2 + 0.2 * Math.abs(Math.sin(t * 2 + i * 0.3)) + 0.15 * Math.abs(Math.sin(t * 3.4 - i * 0.1));
        }
      } else {
        for (let i = 0; i < slots; i++) amps[i] = 0.04;
      }

      // Scrolling mode: keep a rolling history and shift leftward.
      let display: number[];
      if (mode === "scrolling") {
        history.current.push(amps[slots - 1]!);
        if (history.current.length > historySize) history.current.shift();
        display = history.current.slice(-slots);
        while (display.length < slots) display.unshift(0);
      } else {
        display = Array.from(amps);
      }

      const mid = height / 2;
      ctx.fillStyle = resolvedColor;
      for (let i = 0; i < slots; i++) {
        const amp = display[i]!;
        const h = Math.max(2, amp * (height - 8));
        let alpha = 0.85;
        if (fadeEdges) {
          const t2 = Math.min(i, slots - 1 - i) / Math.max(1, slots * 0.15);
          alpha *= Math.min(1, t2);
        }
        ctx.globalAlpha = alpha;
        ctx.fillRect(i * step, mid - h / 2, barWidth, h);
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    void setup().then(() => {
      if (cancelled) return;
      rafRef.current = requestAnimationFrame(render);
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, [active, processing, mode, width, height, barWidth, barGap, fadeEdges, barColor, historySize, onError]);

  return <canvas ref={canvasRef} className={["hg-wave", className].filter(Boolean).join(" ")} aria-label={active ? "Listening" : processing ? "Processing" : "Waveform idle"} />;
}
