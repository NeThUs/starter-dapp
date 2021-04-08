import { IDappProvider, ProxyProvider, ApiProvider, WalletProvider } from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';
import { AgencyMetadata, ContractOverview, NetworkConfig } from 'helpers/contractDataDefinitions';
import { denomination, decimals, network, NetworkType } from '../config';
import { getItem } from '../storage/session';

export const defaultNetwork: NetworkType = {
  id: 'not-configured',
  name: 'NOT CONFIGURED',
  egldLabel: '',
  walletAddress: '',
  apiAddress: '',
  gatewayAddress: '',
  explorerAddress: '',
  delegationContract: '',
};

export interface DappState {
  provider: IDappProvider;
  proxy: ProxyProvider;
  apiProvider: ApiProvider;
}

export interface Nodes {
  [key: string]: NodeDetails;
}
export interface NodeDetails {
  timeStamp: string;
  publicKey: string;
  versionNumber: string;
  nodeDisplayName: string;
  identity: string;
  totalUpTimeSec: number;
  totalDownTimeSec: number;
  maxInactiveTime: string;
  receivedShardID: number;
  computedShardID: number;
  peerType: string;
  isActive: boolean;
  nonce: number;
  numInstances: number;
}

export interface StateType {
  dapp: DappState;
  loading: boolean;
  error: string;
  loggedIn: boolean;
  address: string;
  egldLabel: string;
  USD: number;
  denomination: number;
  decimals: number;
  account: AccountType;
  explorerAddress: string;
  delegationContract?: string;
  totalActiveStake: string;
  numberOfActiveNodes: string;
  numberOfEligibleNodes: string;
  numUsers: number;
  eligibleAprPercentage: string;
  nodes: Nodes,
  aprPercentage: string;
  aprPercentageAfterFee: string;
  eligibleAprPercentageAfterFee: string;
  contractOverview: ContractOverview;
  networkConfig: NetworkConfig;
  agencyMetaData: AgencyMetadata;
}
export const emptyAccount: AccountType = {
  balance: '...',
  nonce: 0,
};

export const emptyAgencyMetaData: AgencyMetadata = {
  name: '',
  website: '',
  keybase: '',
};

export const emptyNetworkConfig: NetworkConfig = {
  roundDuration: 0,
  roundsPerEpoch: 0,
  roundsPassedInCurrentEpoch: 0,
  topUpFactor: 0,
  topUpRewardsGradientPoint: new BigNumber('0'),
};

export const emptyContractOverview: ContractOverview = {
  ownerAddress: '',
  serviceFee: '',
  maxDelegationCap: '',
  initialOwnerFunds: '',
  automaticActivation: 'false',
  withDelegationCap: false,
  changeableServiceFee: false,
  reDelegationCap: 'false',
  createdNounce: false,
  unBondPeriod: 0,
};

export const initialState = () => {
  const sessionNetwork = network || defaultNetwork;
  return {
    denomination: denomination,
    decimals: decimals,
    dapp: {
      provider: new WalletProvider(sessionNetwork.walletAddress),
      proxy: new ProxyProvider(
        sessionNetwork.gatewayAddress !== undefined
          ? sessionNetwork?.gatewayAddress
          : 'https://gateway.elrond.com/',
        10000
      ),
      apiProvider: new ApiProvider(
        sessionNetwork.apiAddress !== undefined
          ? sessionNetwork?.apiAddress
          : 'https://api.elrond.com/',
        10000,
      ),
    },
    loading: false,
    USD: 0,
    error: '',
    nodes: getItem('nodes'),
    loggedIn: !!getItem('logged_in'),
    address: getItem('address'),
    account: emptyAccount,
    egldLabel: sessionNetwork?.egldLabel,
    explorerAddress: sessionNetwork.explorerAddress || 'https://explorer.elrond.com',
    delegationContract: sessionNetwork.delegationContract,
    contractOverview: emptyContractOverview,
    networkConfig: emptyNetworkConfig,
    agencyMetaData: emptyAgencyMetaData,
    numberOfActiveNodes: '...',
    numberOfEligibleNodes: '...',
    numUsers: 0,
    totalActiveStake: '...',
    aprPercentage: '...',
    eligibleAprPercentage: '...',
    eligibleAprPercentageAfterFee: '...',
    aprPercentageAfterFee: '...',
  };
};

export interface AccountType {
  balance: string;
  nonce: number;
}
