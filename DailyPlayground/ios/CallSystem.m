//
//  CallSystem.m
//  DailyPlayground
//
//  Created by Paul Kompfner on 9/21/20.
//

#import "CallSystem.h"
#import <CallKit/CallKit.h>

const NSString *EVENT_START_CALL = @"EventStartCall";
const NSString *EVENT_ABORT_STARTING_CALL = @"EventAbortStartingCall";
const NSString *EVENT_END_CALL = @"EventEndCall";

@interface CallSystem () <CXProviderDelegate>

@property (nonatomic, strong) CXProvider *provider;
@property (nonatomic, strong) CXCallController *callController;

@property (nonatomic, strong) NSString *currentCallRoomURL;
@property (nonatomic, strong) NSUUID *currentCallUUID;

@end

@implementation CallSystem

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    // CUSTOMIZE HERE
    CXProviderConfiguration *providerConfiguration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"DailyPlayground"];
    providerConfiguration.maximumCallGroups = 1;
    providerConfiguration.maximumCallsPerCallGroup = 1;
    providerConfiguration.supportsVideo = YES;
    _provider = [[CXProvider alloc] initWithConfiguration:providerConfiguration];
    [_provider setDelegate:self queue:nil];
    _callController = [[CXCallController alloc] init];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[[EVENT_START_CALL copy],
           [EVENT_ABORT_STARTING_CALL copy],
           [EVENT_END_CALL copy]];
}

#pragma mark - Public API

RCT_EXPORT_METHOD(askToStartCall:(NSString *)roomURL)
{
  NSLog(@"[CallSystem] askToStartCall: %@", roomURL);
  
  if ([self.currentCallRoomURL length]) {
    return;
  }
  
  // CUSTOMIZE HERE
  NSString *roomName = [NSURL URLWithString:roomURL].lastPathComponent;
  CXHandle *handle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric
                                              value:roomName];
  NSUUID *uuid = [NSUUID UUID];
  CXStartCallAction *action = [[CXStartCallAction alloc] initWithCallUUID:uuid
                                                                   handle:handle];
  [action setVideo:YES];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:action];
  [self.callController requestTransaction:transaction completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[CallSystem] failed to request start call transaction: %@", error.localizedDescription);
      [self sendEventWithName:[EVENT_ABORT_STARTING_CALL copy]
                         body:[self _eventPayloadWithCallRoomURL:roomURL]];
      return;
    }
    [self _setCurrentCallStateWithRoomURL:roomURL UUID:uuid];
  }];
}

RCT_EXPORT_METHOD(askToEndCall:(NSString *)roomURL)
{
  NSLog(@"[CallSystem] askToEndCall: %@", roomURL);
  
  if (![self.currentCallRoomURL isEqualToString:roomURL]) {
    return;
  }
  CXEndCallAction *action = [[CXEndCallAction alloc] initWithCallUUID:self.currentCallUUID];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:action];
  [self.callController requestTransaction:transaction
                               completion:^(NSError * _Nullable error)
   {
    if (error) {
      NSLog(@"[CallSystem] failed to request end call transaction: %@", error.localizedDescription);
    }
  }];
}

RCT_EXPORT_METHOD(reportCallStarted:(NSString *)roomURL)
{
  NSLog(@"[CallSystem] reportCallStarted: %@", roomURL);
  
  if (![self.currentCallRoomURL isEqualToString:roomURL]) {
    return;
  }
  [self.provider reportOutgoingCallWithUUID:self.currentCallUUID
                            connectedAtDate:nil];
  [self _resolvePendingStartCallActionWithSuccess:YES];
}

RCT_EXPORT_METHOD(reportCallFailed:(NSString *)roomURL)
{
  NSLog(@"[CallSystem] reportCallFailed: %@", roomURL);
  
  if (![self.currentCallRoomURL isEqualToString:roomURL]) {
    return;
  }
  [self.provider reportCallWithUUID:self.currentCallUUID
                        endedAtDate:nil
                             reason:CXCallEndedReasonFailed];
  [self _resolvePendingStartCallActionWithSuccess:NO];
  [self _clearCurrentCallState];
}

RCT_EXPORT_METHOD(reportCallEnded:(NSString *)roomURL)
{
  NSLog(@"[CallSystem] reportCallEnded: %@", roomURL);
  
  if (![self.currentCallRoomURL isEqualToString:roomURL]) {
    return;
  }
  [self _fulfillPendingEndCallAction];
  [self _clearCurrentCallState];
}

#pragma mark - CXProviderDelegate

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action
{
  NSLog(@"[CallSystem] provider:performStartCallAction:");
  
  if (![self.currentCallUUID isEqual:action.callUUID]) {
    return;
  }
  [provider reportOutgoingCallWithUUID:self.currentCallUUID
               startedConnectingAtDate:nil];
  [self sendEventWithName:[EVENT_START_CALL copy]
                     body:[self _eventPayloadFromCurrentCallState]];
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action
{
  NSLog(@"[CallSystem] provider:performEndCallAction:");
  
  if (![self.currentCallUUID isEqual:action.callUUID]) {
    return;
  }
  [self sendEventWithName:[EVENT_END_CALL copy]
                     body:[self _eventPayloadFromCurrentCallState]];
}

/**
 * This is a required CXProviderDelegate method.
 */
- (void)providerDidReset:(nonnull CXProvider *)provider
{
  NSLog(@"[CallSystem] providerDidReset:");
  
  if (![self.currentCallRoomURL length]) {
    return;
  }
  [self sendEventWithName:[EVENT_END_CALL copy]
                     body:[self _eventPayloadFromCurrentCallState]];
}

#pragma mark - Private helper methods

- (void)_setCurrentCallStateWithRoomURL:(NSString *)roomURL UUID:(NSUUID *)uuid
{
  self.currentCallRoomURL = roomURL;
  self.currentCallUUID = uuid;
}

- (void)_clearCurrentCallState
{
  [self _setCurrentCallStateWithRoomURL:nil UUID:nil];
}

- (NSDictionary *)_eventPayloadWithCallRoomURL:(NSString *)roomURL
{
  return @{ @"roomUrl": roomURL ?: [NSNull null] };
}

- (NSDictionary *)_eventPayloadFromCurrentCallState
{
  return [self _eventPayloadWithCallRoomURL:self.currentCallRoomURL];
}

/**
 * Resolves pending start call action (if any) with either success or failures
 */
- (void)_resolvePendingStartCallActionWithSuccess:(BOOL)success
{
  for (CXTransaction *transaction in self.provider.pendingTransactions) {
    for (CXAction *action in transaction.actions) {
      if ([action isKindOfClass:[CXStartCallAction class]]) {
        CXStartCallAction *startCallAction = (CXStartCallAction *)action;
        if ([startCallAction.callUUID isEqual:self.currentCallUUID]) {
          success ? [startCallAction fulfill] : [startCallAction fail];
          NSLog(@"[CallSystem] resolved start call action: %@", success ? @"fulfilled" : @"failed");
        }
      }
    }
  }
}

- (void)_fulfillPendingEndCallAction
{
  for (CXTransaction *transaction in self.provider.pendingTransactions) {
    for (CXAction *action in transaction.actions) {
      if ([action isKindOfClass:[CXEndCallAction class]]) {
        CXEndCallAction *endCallAction = (CXEndCallAction *)action;
        if ([endCallAction.callUUID isEqual:self.currentCallUUID]) {
          [endCallAction fulfill];
          NSLog(@"[CallSystem] fulfilled end call action");
        }
      }
    }
  }
}

@end
