import { IDappProvider, ProxyProvider, ApiProvider, WalletProvider } from '@elrondnetwork/erdjs';
import { ContractOverview } from 'helpers/types';
import { denomination, decimals, networks, NetworkType } from '../config';
import { getItem } from '../storage/session';

export const defaultNetwork: NetworkType = {
  default: false,
  id: 'not-configured',
  name: 'NOT CONFIGURED',
  egldLabel: '',
  theme: '',
  walletAddress: '',
  apiAddress: '',
  gatewayAddress: '',
  explorerAddress: '',
  delegationContract: '',
  auctionContract: '',
  stakingContract: '',
};

export interface DappState {
  provider: IDappProvider;
  proxy: ProxyProvider;
  apiProvider: ApiProvider;
}

export interface StateType {
  dapp: DappState;
  loading: boolean;
  error: string;
  loggedIn: boolean;
  address: string;
  egldLabel: string;
  denomination: number;
  decimals: number;
  account: AccountType;
  explorerAddress: string;
  delegationContract?: string;
  auctionContract?: string;
  stakingContract?: string;
  totalActiveStake: string;
  numberOfActiveNodes: string;
  numUsers: number;
  aprPercentage: string;
  aprPercentageAfterFee: string;
  contractOverview: ContractOverview;
}
export const emptyAccount: AccountType = {
  balance: '...',
  nonce: 0,
};

export const emptyContractOverview: ContractOverview = {
  ownerAddress: '',
  serviceFee: '',
  maxDelegationCap: '',
  initialOwnerFunds: '',
  automaticActivation: 'false',
  withDelegationCap: false,
  changeableServiceFee: false,
  createdNounce: false,
  unBondPeriod: 0,
};

export const initialState = (optionalConfig?: NetworkType[]) => {
  const sessionNetwork = networks.filter(network => network.default).pop() || defaultNetwork;
  return {
    denomination: denomination,
    decimals: decimals,
    dapp: {
      provider: new WalletProvider(sessionNetwork.walletAddress),
      proxy: new ProxyProvider(
        sessionNetwork.gatewayAddress !== undefined
          ? sessionNetwork?.gatewayAddress
          : 'https://gateway.elrond.com/',
        4000
      ),
      apiProvider: new ApiProvider(
        sessionNetwork.apiAddress !== undefined
          ? sessionNetwork?.apiAddress
          : 'https://api.elrond.com/',
        4000
      ),
    },
    loading: false,
    error: '',
    loggedIn: !!getItem('logged_in'),
    address: getItem('address'),
    account: emptyAccount,
    egldLabel: sessionNetwork?.egldLabel,
    explorerAddress: sessionNetwork.explorerAddress || 'https://explorer.elrond.com',
    delegationContract: sessionNetwork.delegationContract,
    auctionContract: sessionNetwork.auctionContract,
    stakingContract: sessionNetwork.stakingContract,
    contractOverview: emptyContractOverview,
    numberOfActiveNodes: '...',
    totalActiveStake: '...',
    numUsers: 0,
    aprPercentage: '...',
    aprPercentageAfterFee: '...',
  };
};

export interface AccountType {
  balance: string;
  nonce: number;
}
