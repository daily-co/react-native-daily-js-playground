import { MediaStreamTrack } from '@daily-co/react-native-daily-js';
import { Participant } from '@daily-co/daily-js';

/**
 * Call state is comprised of:
 * - "Call items" (inputs to the call, i.e. participants or shared screens)
 * - Error state
 */
type CallState = {
  callItems: { [id: string]: CallItem };
  camOrMicError: string | null;
  fatalError: string | null;
};

/**
 * Call items are keyed by id:
 * - "local" for the current participant
 * - A session id for each remote participant
 * - "<id>-screen" for each shared screen
 */
type CallItem = {
  isLoading: boolean;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
};

const initialCallState: CallState = {
  callItems: {
    local: {
      isLoading: true,
      audioTrack: null,
      videoTrack: null,
    },
  },
  camOrMicError: null,
  fatalError: null,
};

// --- Actions ---

/**
 * PARTICIPANTS_CHANGE action structure:
 * - type: string
 * - participants: Object (from Daily.co callObject.participants())
 */
const PARTICIPANTS_CHANGE = 'PARTICIPANTS_CHANGE';

type ParticipantsChangeAction = {
  type: typeof PARTICIPANTS_CHANGE;
  participants: { [id: string]: Participant };
};

/**
 * CAM_OR_MIC_ERROR action structure:
 * - type: string
 * - message: string
 */
const CAM_OR_MIC_ERROR = 'CAM_OR_MIC_ERROR';

type CamOrMicErrorAction = {
  type: typeof CAM_OR_MIC_ERROR;
  message: string;
};

/**
 * CAM_OR_MIC_ERROR action structure:
 * - type: string
 * - message: string
 */
const FATAL_ERROR = 'FATAL_ERROR';

type FatalError = {
  type: typeof FATAL_ERROR;
  message: string;
};

type CallStateAction =
  | ParticipantsChangeAction
  | CamOrMicErrorAction
  | FatalError;

// --- Reducer and helpers --

function callReducer(callState: CallState, action: CallStateAction) {
  switch (action.type) {
    case PARTICIPANTS_CHANGE:
      const callItems = getCallItems(action.participants, callState.callItems);
      return {
        ...callState,
        callItems,
      };
    case CAM_OR_MIC_ERROR:
      return { ...callState, camOrMicError: action.message };
    case FATAL_ERROR:
      return { ...callState, fatalError: action.message };
    default:
      throw new Error();
  }
}

function getCallItems(
  participants: { [id: string]: Participant },
  prevCallItems: { [id: string]: CallItem }
) {
  let callItems = { ...initialCallState.callItems }; // Ensure we *always* have a local participant
  for (const [id, participant] of Object.entries(participants)) {
    // Here we assume that a participant will join with audio/video enabled.
    // This assumption lets us show a "loading" state before we receive audio/video tracks.
    // This may not be true for all apps, but the call object doesn't yet support distinguishing
    // between cases where audio/video are missing because they're still loading or muted.
    const hasLoaded = prevCallItems[id] && !prevCallItems[id].isLoading;
    const missingTracks = !(participant.audioTrack || participant.videoTrack);
    callItems[id] = {
      isLoading: !hasLoaded && missingTracks,
      audioTrack: participant.audioTrack || null,
      videoTrack: participant.videoTrack || null,
    };
    if (participant.screenVideoTrack) {
      callItems[id + '-screen'] = {
        isLoading: false,
        videoTrack: participant.screenVideoTrack,
        audioTrack: null,
      };
    }
  }
  return callItems;
}

// --- Derived data ---

// True if id corresponds to local participant (*not* their screen share)
function isLocal(id: string) {
  return id === 'local';
}

function isScreenShare(id: string) {
  return id.endsWith('-screen');
}

function containsScreenShare(callItems: { [id: string]: CallItem }) {
  return Object.keys(callItems).some((id) => isScreenShare(id));
}

function getMessage(callState: CallState, roomUrl: string) {
  let header = null;
  let detail = null;
  let isError = false;
  if (callState.fatalError) {
    header = `Fatal error: ${callState.fatalError}`;
    isError = true;
  } else if (callState.camOrMicError) {
    header = `Camera or mic access error: ${callState.camOrMicError}`;
    detail =
      'See https://help.daily.co/en/articles/2528184-unblock-camera-mic-access-on-a-computer to troubleshoot.';
    isError = true;
  } else if (Object.keys(callState.callItems).length === 1) {
    header = 'Copy and share this URL to invite others';
    detail = roomUrl;
  }
  return header ? { header, detail, isError } : null;
}

export {
  initialCallState,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  callReducer,
  isLocal,
  isScreenShare,
  containsScreenShare,
  getMessage,
};
