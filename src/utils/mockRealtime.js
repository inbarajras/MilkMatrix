// Mock realtime client for React Native compatibility
export class RealtimeClient {
  constructor() {
    console.log('RealtimeClient: Using mock client (realtime disabled for React Native compatibility)');
  }

  connect() {
    console.log('RealtimeClient: Mock connect - no real-time features available');
    return Promise.resolve();
  }

  disconnect() {
    console.log('RealtimeClient: Mock disconnect');
    return Promise.resolve();
  }

  channel() {
    return {
      on: () => this,
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve(),
    };
  }
}

export default {
  RealtimeClient,
};
