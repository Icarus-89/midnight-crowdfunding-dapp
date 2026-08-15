import { Buffer } from 'buffer';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const networkId = (import.meta.env.VITE_NETWORK_ID as NetworkId) || ('preprod' as NetworkId);
setNetworkId(networkId);

// @ts-expect-error - support third-party libraries that require NODE_ENV.
globalThis.process = {
  env: {
    NODE_ENV: import.meta.env.MODE,
  },
};

globalThis.Buffer = Buffer;
