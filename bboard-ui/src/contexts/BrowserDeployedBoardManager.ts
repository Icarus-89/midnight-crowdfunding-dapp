import {
  BBoardAPI,
  type BBoardCircuitKeys,
  type BBoardProviders,
  type DeployedBBoardAPI,
} from '../../../api/src/index';
import { type ContractAddress, fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  type Observable,
  take,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import { type Logger } from 'pino';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import semver from 'semver';
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { BBoardPrivateState } from '../../../contract/src/index';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

export interface InProgressBoardDeployment {
  readonly status: 'in-progress';
}

export interface DeployedBoardDeployment {
  readonly status: 'deployed';
  readonly api: DeployedBBoardAPI;
}

export interface FailedBoardDeployment {
  readonly status: 'failed';
  readonly error: Error;
}

export type BoardDeployment = InProgressBoardDeployment | DeployedBoardDeployment | FailedBoardDeployment;

export interface DeployedBoardAPIProvider {
  readonly boardDeployments$: Observable<Array<Observable<BoardDeployment>>>;
  readonly resolve: (contractAddress?: ContractAddress) => Observable<BoardDeployment>;
}

export type WalletConnectionState = {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  status: string;
  isInitialized: boolean;
  isSynced: boolean;
  error?: string;
};

export const buildWalletConnectionState = (input: {
  connected: boolean;
  address: string;
  balance?: number;
  network: string;
  status: string;
  isInitialized?: boolean;
  isSynced?: boolean;
  error?: string;
}): WalletConnectionState => ({
  connected: input.connected,
  address: input.address,
  balance: input.balance ?? 0,
  network: input.network,
  status: input.status,
  isInitialized: input.isInitialized ?? input.connected,
  isSynced: input.isSynced ?? input.connected,
  error: input.error,
});

export const connectWalletToMidnight = async (logger?: Logger): Promise<WalletConnectionState> => {
  const networkId = (import.meta.env.VITE_NETWORK_ID as NetworkId) || ('preprod' as NetworkId);
  setNetworkId(networkId);
  setNetworkId(networkId);
  const runtimeLogger = logger ?? ({
    level: 'silent',
    fatal: () => undefined,
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    trace: () => undefined,
    silent: () => undefined,
    msgPrefix: '',
  } as unknown as Logger);

  try {
    const connectedAPI = await connectToWallet(runtimeLogger, networkId);
    const connectionStatus = await connectedAPI.getConnectionStatus();
    const shieldedAddresses = await connectedAPI.getShieldedAddresses();
    const rawStatus = (connectionStatus as { status?: string } | undefined)?.status ?? 'Connected';
    
    // Check if wallet is synchronized
    const isSynced = rawStatus.toLowerCase().includes('synced') || rawStatus.toLowerCase().includes('connected');

    return buildWalletConnectionState({
      connected: true,
      address: shieldedAddresses.shieldedCoinPublicKey || 'Connected',
      balance: 0,
      network: networkId,
      status: isSynced ? '1AM wallet synced & ready' : `1AM wallet (${rawStatus})`,
      isInitialized: true,
      isSynced,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return buildWalletConnectionState({
      connected: false,
      address: 'Not connected',
      balance: 0,
      network: networkId,
      status: 'Wallet unavailable',
      isInitialized: false,
      isSynced: false,
      error: message,
    });
  }
};

export class BrowserDeployedBoardManager implements DeployedBoardAPIProvider {
  readonly #boardDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<BoardDeployment>>>;
  #initializedProviders: Promise<BBoardProviders> | undefined;

  constructor(private readonly logger: Logger) {
    this.#boardDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<BoardDeployment>>>([]);
    this.boardDeployments$ = this.#boardDeploymentsSubject;
  }

  readonly boardDeployments$: Observable<Array<Observable<BoardDeployment>>>;

  resolve(contractAddress?: ContractAddress): Observable<BoardDeployment> {
    const deployments = this.#boardDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<BoardDeployment>({
      status: 'in-progress',
    });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#boardDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<BBoardProviders> {
    return this.#initializedProviders ?? (this.#initializedProviders = initializeProviders(this.logger));
  }

  private async deployDeployment(deployment: BehaviorSubject<BoardDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await BBoardAPI.deploy(providers, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<BoardDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await BBoardAPI.join(providers, contractAddress, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

const initializeProviders = async (logger: Logger): Promise<BBoardProviders> => {
  const networkId = (import.meta.env.VITE_NETWORK_ID as NetworkId) || ('preprod' as NetworkId);
  setNetworkId(networkId);
  setNetworkId(networkId);
  const connectedAPI = await connectToWallet(logger, networkId);
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<BBoardCircuitKeys>(zkConfigPath, fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const inMemoryBBoardPrivateStateProvider = inMemoryPrivateStateProvider<string, BBoardPrivateState>();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryBBoardPrivateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger.info({ tx, ttl }, 'Balancing transaction via wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          if (!received || !received.tx) {
            const msg = 'balanceUnsealedTransaction returned invalid response';
            logger.error({ received }, msg);
            throw new Error(msg);
          }
          try {
            return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
              'signature',
              'proof',
              'binding',
              fromHex(received.tx),
            );
          } catch (deserErr) {
            logger.error({ error: deserErr, received }, 'Failed to deserialize balanced transaction');
            throw deserErr;
          }
        } catch (e) {
          logger.error({ error: e }, 'Error balancing transaction via wallet');
          throw e instanceof Error ? e : new Error(String(e));
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        try {
          const payload = toHex(tx.serialize());
          logger.info({ tx: tx.identifiers?.() ?? undefined, payload: payload.slice(0, 80) }, 'Submitting transaction via wallet');
          await connectedAPI.submitTransaction(payload);
          const txIdentifiers = tx.identifiers();
          const txId = txIdentifiers[0];
          logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
          return txId;
        } catch (e) {
          logger.error({ error: e }, 'Error submitting transaction via wallet');
          throw e instanceof Error ? e : new Error(String(e));
        }
      },
    },
  };
};

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) {
    console.debug('[1AM] window.midnight not found yet');
    return undefined;
  }
  const wallets = Object.values(window.midnight);
  console.debug('[1AM] window.midnight wallets found:', wallets.length, wallets.map((w) => (w as { apiVersion?: string })?.apiVersion));
  const compatible = wallets.find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(wallet.apiVersion as string, COMPATIBLE_CONNECTOR_API_VERSION),
  );
  if (!compatible) {
    console.warn('[1AM] No compatible wallet found. Installed API versions:', wallets.map((w) => (w as { apiVersion?: string })?.apiVersion), 'Required:', COMPATIBLE_CONNECTOR_API_VERSION);
  }
  return compatible;
};

/** Supported Midnight 1AM connector API version range. Update if the extension ships a newer major. */
const COMPATIBLE_CONNECTOR_API_VERSION = '>=3.x <=6.x';

const connectToWallet = (logger: Logger, networkId: string): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getFirstCompatibleWallet()),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Check for wallet connector API');
      }),
      filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Compatible wallet connector API found. Connecting.');
      }),
      take(1),
      timeout({
        first: 10_000,
        with: () =>
          throwError(() => {
            logger.error('Could not find wallet connector API');
            return new Error('Could not find the Midnight 1AM wallet. Extension installed?');
          }),
      }),
      concatMap(async (initialAPI) => {
        const connectedAPI = await initialAPI.connect(networkId);
        const connectionStatus = await connectedAPI.getConnectionStatus();
        logger.info(connectionStatus, 'Wallet connector API enabled status');
        return connectedAPI;
      }),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => {
            logger.error('Wallet connector API has failed to respond');
            return new Error('The Midnight 1AM wallet has failed to respond. Extension enabled?');
          }),
      }),
      catchError((error, apis) =>
        error
          ? throwError(() => {
              logger.error('Unable to enable connector API' + error);
              return new Error('Application is not authorized');
            })
          : apis,
      ),
    ),
  );
};
