import React, { useEffect, useReducer, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { logDailyEvent } from '../../utils';
import { DailyEvent } from '@daily-co/react-native-daily-js';
import {
  callReducer,
  initialCallState,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  isScreenShare,
  isLocal,
  containsScreenShare,
  participantCount,
  getMessage,
} from './callState';
import Tile, { TileType } from '../Tile/Tile';
import CallMessage from '../CallMessage/CallMessage';
import { useCallObject } from '../../useCallObject';
import { TRAY_HEIGHT } from '../Tray/Tray';
import CopyLinkButton from '../CopyLinkButton/CopyLinkButton';

type Props = {
  roomUrl: string;
};

const THUMBNAIL_HEIGHT = 100;

const CallPanel = (props: Props) => {
  const callObject = useCallObject();
  const [callState, dispatch] = useReducer(callReducer, initialCallState);

  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    const events: DailyEvent[] = [
      'participant-joined',
      'participant-updated',
      'participant-left',
    ];

    const handleNewParticipantsState = (event?: any) => {
      event && logDailyEvent(event);
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });
    };

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
  }, [callObject]);

  /**
   * Start listening for call errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

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
  }, [callObject]);

  /**
   * Start listening for fatal errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

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
  }, [callObject]);

  /**
   * Toggle between front and rear cameras.
   */
  const flipCamera = useCallback(() => {
    callObject && callObject.cycleCamera();
  }, [callObject]);

  /**
   * Send an app message to the remote participant whose tile was clicked on.
   */
  const sendHello = useCallback(
    (participantId: string) => {
      callObject &&
        callObject.sendAppMessage({ hello: 'world' }, participantId);
    },
    [callObject]
  );

  /**
   * Get lists of large tiles and thumbnail tiles to render.
   */
  const [largeTiles, thumbnailTiles] = useMemo(() => {
    let larges: JSX.Element[] = [];
    let thumbnails: JSX.Element[] = [];
    Object.entries(callState.callItems).forEach(([id, callItem]) => {
      let tileType: TileType;
      if (isScreenShare(id)) {
        tileType = TileType.FullWidth;
      } else if (isLocal(id) || containsScreenShare(callState.callItems)) {
        tileType = TileType.Thumbnail;
      } else if (participantCount(callState.callItems) <= 3) {
        tileType = TileType.FullWidth;
      } else {
        tileType = TileType.HalfWidth;
      }
      const tile = (
        <Tile
          key={id}
          videoTrack={callItem.videoTrack}
          audioTrack={callItem.audioTrack}
          mirror={isLocal(id)}
          type={tileType}
          isLoading={callItem.isLoading}
          onPress={
            isLocal(id)
              ? flipCamera
              : () => {
                  sendHello(id);
                }
          }
        />
      );
      if (tileType === TileType.Thumbnail) {
        thumbnails.push(tile);
      } else {
        larges.push(tile);
      }
    });
    return [larges, thumbnails];
  }, [callState.callItems, flipCamera, sendHello]);

  const message = getMessage(callState, props.roomUrl);
  const showCopyLinkButton = message && !message.isError;

  return (
    <>
      <View
        style={[
          styles.mainContainer,
          message ? styles.messageContainer : styles.largeTilesContainerOuter,
        ]}
      >
        {message ? (
          <>
            <CallMessage
              header={message.header}
              detail={message.detail}
              isError={message.isError}
            />
            {showCopyLinkButton && <CopyLinkButton roomUrl={props.roomUrl} />}
          </>
        ) : (
          <ScrollView alwaysBounceVertical={false}>
            <View style={styles.largeTilesContainerInner}>{largeTiles}</View>
          </ScrollView>
        )}
      </View>
      <View style={styles.thumbnailContainerOuter}>
        <ScrollView horizontal={true} alwaysBounceHorizontal={false}>
          <View style={styles.thumbnailContainerInner}>{thumbnailTiles}</View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  thumbnailContainerOuter: {
    position: 'absolute',
    width: '100%',
    height: THUMBNAIL_HEIGHT,
    top: 0,
    left: 0,
  },
  thumbnailContainerInner: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeTilesContainerOuter: {
    justifyContent: 'center',
  },
  largeTilesContainerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: THUMBNAIL_HEIGHT,
    marginBottom: TRAY_HEIGHT,
  },
});

export default CallPanel;
