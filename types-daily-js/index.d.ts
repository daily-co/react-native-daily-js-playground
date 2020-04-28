// Type definitions for daily-js 0.0.987
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

// Declares that global variable `DailyIframe` is provided outside a module loader environment.
export as namespace DailyIframe;

// Declares that the class DailyIframe is the thing exported from the module.
export = DailyIframe;

// Declares class methods and properties.
declare class DailyIframe {
  static createCallObject(properties?: DailyIframe.FrameProps): DailyIframe;
  join(
    properties?: DailyIframe.FrameProps
  ): Promise<DailyIframe.Participant[] | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  meetingState(): DailyIframe.MeetingState;
  on(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
  off(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
}

// Declares supporting types under the `DailyIframe` namespace.
declare namespace DailyIframe {
  type FrameProps = object; // TODO: flesh out
  type Participant = object; // TODO: flesh out

  enum MeetingState {
    New = "new",
    Loading = "loading",
    Loaded = "loaded",
    Joining = "joining-meeting",
    Joined = "joined-meeting",
    Left = "left-meeting",
    Error = "error",
  }

  enum Event {
    Loading = "loading",
    Loaded = "loaded",
    StartedCamera = "started-camera",
    CameraError = "camera-error",
    JoiningMeeting = "joining-meeting",
    JoinedMeeting = "joined-meeting",
    LeftMeeting = "left-meeting",
    ParticipantJoined = "participant-joined",
    ParticipantUpdated = "participant-updated",
    ParticipantLeft = "participant-left",
    TrackStarted = "track-started",
    TrackStopped = "track-stopped",
    RecordingStarted = "recording-started",
    RecordingStopped = "recording-stopped",
    RecordingStats = "recording-stats",
    RecordingError = "recording-error",
    UploadCompleted = "recording-upload-completed",
    AppMessage = "app-message",
    InputEvent = "input-event",
    LocalScreenShareStarted = "local-screen-share-started",
    LocalScreenShareStopped = "local-screen-share-stopped",
    ActiveSpeakerChanged = "active-speaker-change",
    ActiveSpeakerModeChanged = "active-speaker-mode-change",
    NetworkQualityChanged = "network-quality-change",
    NetworkConnection = "network-connection",
    Fullscreen = "fullscreen",
    ExitedFullscreen = "exited-fullscreen",
    Error = "error",
  }
}
