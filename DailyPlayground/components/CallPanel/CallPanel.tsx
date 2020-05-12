import React, {useEffect, useReducer, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {logDailyEvent} from '../../utils';
import {Event} from '@daily-co/daily-js';
import {
  callReducer,
  initialCallState,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  isScreenShare,
  isLocal,
  containsScreenShare,
  getMessage,
} from './callState';
import Tile from '../Tile/Tile';
import CallMessage from '../CallMessage/CallMessage';

type Props = {
  roomUrl: string;
  callObject: DailyIframe | null;
};

const CallPanel = (props: Props) => {
  const [callState, dispatch] = useReducer(callReducer, initialCallState);

  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!props.callObject) return;
    const callObject = props.callObject;

    const events: Event[] = [
      'participant-joined',
      'participant-updated',
      'participant-left',
    ];

    function handleNewParticipantsState(event?: any) {
      event && logDailyEvent(event);
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewParticipantsState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewParticipantsState);
      }
    };
  }, [props.callObject]);

  /**
   * Start listening for call errors, when the callObject is set.
   */
  useEffect(() => {
    if (!props.callObject) return;
    const callObject = props.callObject;

    function handleCameraErrorEvent(event?: any) {
      logDailyEvent(event);
      dispatch({
        type: CAM_OR_MIC_ERROR,
        message:
          (event && event.errorMsg && event.errorMsg.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no camera error when callObject
    // is first assigned.

    callObject.on('camera-error', handleCameraErrorEvent);

    return function cleanup() {
      callObject.off('camera-error', handleCameraErrorEvent);
    };
  }, [props.callObject]);

  /**
   * Start listening for fatal errors, when the callObject is set.
   */
  useEffect(() => {
    if (!props.callObject) return;
    const callObject = props.callObject;

    function handleErrorEvent(event?: any) {
      logDailyEvent(event);
      dispatch({
        type: FATAL_ERROR,
        message: (event && event.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no error when callObject is
    // first assigned.

    callObject.on('error', handleErrorEvent);

    return function cleanup() {
      callObject.off('error', handleErrorEvent);
    };
  }, [props.callObject]);

  const [largeTiles, smallTiles] = useMemo(() => {
    let largeTiles: JSX.Element[] = [];
    let smallTiles: JSX.Element[] = [];
    Object.entries(callState.callItems).forEach(([id, callItem]) => {
      const isLarge =
        isScreenShare(id) ||
        (!isLocal(id) && !containsScreenShare(callState.callItems));
      const tile = (
        <Tile
          key={id}
          videoTrack={callItem.videoTrack}
          audioTrack={callItem.audioTrack}
          isLocalPerson={isLocal(id)}
          isLarge={isLarge}
          isLoading={callItem.isLoading}
        />
      );
      if (isLarge) {
        largeTiles.push(tile);
      } else {
        smallTiles.push(tile);
      }
    });
    return [largeTiles, smallTiles];
  }, [callState.callItems]);

  const message = useMemo(() => {
    return getMessage(callState);
  }, [callState]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topSection,
          message ? styles.messageContainer : styles.largeTilesContainer,
        ]}>
        {message ? (
          <CallMessage
            header={message.header}
            detail={message.detail}
            isError={message.isError}
          />
        ) : (
          largeTiles.length > 0 && largeTiles[0]
        )}
      </View>
      <View style={[styles.bottomSection, styles.smallTilesContainer]}>
        {smallTiles}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  topSection: {
    flex: 4,
  },
  bottomSection: {
    flex: 1,
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeTilesContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallTilesContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default CallPanel;
