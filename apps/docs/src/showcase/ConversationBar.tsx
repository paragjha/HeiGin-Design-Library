import * as React from "react";
import { LiveWaveform } from "./LiveWaveform";

export type ConversationStatus = "idle" | "connecting" | "connected" | "listening" | "speaking" | "error";

export interface ConversationBarProps {
  /** Called when the user clicks the mic button to start a session. */
  onStart?: () => void | Promise<void>;
  /** Called when the user clicks again to end the session. */
  onEnd?: () => void;
  /** Called when the user toggles mute. */
  onMuteChange?: (muted: boolean) => void;
  /** Current status: idle, connecting, connected, listening, speaking, error. */
  status?: ConversationStatus;
  /** Short status caption shown to the right of the mic. */
  caption?: React.ReactNode;
  /** Agent name shown as the title. Default: "Agent". */
  agentName?: string;
  className?: string;
}

/**
 * A conversation bar for voice agents, built from scratch — this is the UI only.
 * Wire the status prop and the callbacks to any agent SDK (for example
 * ElevenLabs' useConversation hook) in the parent.
 *
 * The bar is a horizontal pill with a prominent mic button, a HeiGin waveform,
 * a mute toggle and a status caption. Keyboard-operable, focus-visible, and
 * announces status changes via aria-live.
 */
export function ConversationBar({
  onStart,
  onEnd,
  onMuteChange,
  status = "idle",
  caption,
  agentName = "Agent",
  className,
}: ConversationBarProps) {
  const [muted, setMuted] = React.useState(false);
  const isLive = status === "connected" || status === "listening" || status === "speaking";
  const toggle = async () => {
    if (isLive) onEnd?.();
    else await onStart?.();
  };
  const setMute = (m: boolean) => {
    setMuted(m);
    onMuteChange?.(m);
  };

  return (
    <div className={["hg-conv-bar", className].filter(Boolean).join(" ")} role="group" aria-label={`${agentName} conversation`}>
      <div className="hg-conv-bar__dot" data-status={status} aria-hidden="true" />
      <div className="hg-conv-bar__meta">
        <div className="hg-conv-bar__name">{agentName}</div>
        <div className="hg-conv-bar__caption" aria-live="polite">
          {caption ?? statusCaption(status)}
        </div>
      </div>
      <div className="hg-conv-bar__wave">
        <LiveWaveform
          active={isLive && !muted}
          processing={status === "connecting"}
          mode="static"
          height={44}
          barWidth={3}
          barGap={2}
          fadeEdges
          barColor="currentColor"
        />
      </div>
      <button
        type="button"
        className="hg-conv-bar__mute"
        aria-pressed={muted}
        aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        onClick={() => setMute(!muted)}
        disabled={!isLive}
      >
        {muted ? <MuteIcon /> : <MicIcon />}
      </button>
      <button
        type="button"
        className="hg-conv-bar__cta"
        data-live={isLive || undefined}
        onClick={toggle}
        aria-label={isLive ? `End ${agentName} conversation` : `Start ${agentName} conversation`}
      >
        {isLive ? <StopIcon /> : <PlayIcon />}
        <span>{isLive ? "End" : "Start"}</span>
      </button>
    </div>
  );
}

function statusCaption(status: ConversationStatus) {
  switch (status) {
    case "idle": return "Press start to talk";
    case "connecting": return "Connecting…";
    case "connected": return "Connected";
    case "listening": return "Listening…";
    case "speaking": return "Agent is speaking";
    case "error": return "Something went wrong";
  }
}

const MicIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 19v3" />
  </svg>
);
const MuteIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m2 2 20 20" />
    <path d="M9 9v2a3 3 0 0 0 5.1 2.1" />
    <path d="M15 10V5a3 3 0 0 0-5.3-1.9" />
    <path d="M19 11a7 7 0 0 1-1.6 4.5" />
    <path d="M12 19v3" />
    <path d="M5 11a7 7 0 0 0 2 4.8" />
  </svg>
);
const PlayIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);
const StopIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
);
