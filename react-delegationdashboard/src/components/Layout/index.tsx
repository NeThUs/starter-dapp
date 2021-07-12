import BigNumber from 'bignumber.js';
import denominate from 'components/Denominate/formatters';
import { denomination, decimals, auctionContract, network } from 'config';
import { useContext, useDispatch } from 'context';
import { emptyAgencyMetaData, Nodes, NodeDetails } from 'context/state';
import { contractViews } from 'contracts/ContractViews';
import {
  AgencyMetadata,
  ContractOverview,
  NetworkConfig,
  NetworkStake,
  Stats,
} from 'helpers/contractDataDefinitions';
import React from 'react';
import axios from 'axios';
import { setItem } from 'storage/session';
import { calculateAPR } from './APRCalculation';
import Footer from './Footer';
import Navbar from './Navbar';
import {
  QueryResponse,
  decodeUnsignedNumber,
  decodeBigNumber,
  decodeString,
} from '@elrondnetwork/erdjs';

const getStakingSCBalance = async (): Promise<string> => {
  const result = await axios.get(`${network.apiAddress}/accounts/${auctionContract}`);
  if (result.status) {
    return result.data.balance;
  } else {
    return 'N/A';
  }
};

const Layout = ({ children, page }: { children: React.ReactNode; page: string }) => {
  const dispatch = useDispatch();
  const { dapp, delegationContract } = useContext();
  const {
    getContractConfig,
    getTotalActiveStake,
    getBlsKeys,
    getNumUsers,
    getMetaData,
    getDelegationManagerContractConfig,
  } = contractViews;

  const syncNodes = async (): Promise<Nodes> => {
    return axios.get((network.apiAddress as string) + '/nodes?identity=truststakingus&from=0&size=100').then(nodes => {
      let result: Nodes = {};
      const res = nodes.data;
      res.forEach((node: NodeDetails) => {
        result[node.bls] = node;
      });
      setItem('nodes', result);
      return result;
    });
  };

  const getContractOverviewType = (value: QueryResponse) => {
    let untypedResponse = value.outputUntyped();
    let initialOwnerFunds = denominate({
      decimals,
      denomination,
      input: decodeBigNumber(untypedResponse[3]).toFixed(),
    });
    return new ContractOverview(
      untypedResponse[0].toString('hex'),
      (decodeUnsignedNumber(untypedResponse[1]) / 100).toString(),
      decodeBigNumber(untypedResponse[2]).toFixed(),
      initialOwnerFunds,
      decodeString(untypedResponse[4]),
      decodeString(untypedResponse[5]),
      decodeString(untypedResponse[6]),
      decodeString(untypedResponse[7]),
      decodeString(untypedResponse[8]),
      decodeUnsignedNumber(untypedResponse[9]) * 6
    );
  };

  const getAgencyMetaDataType = (value: QueryResponse) => {
    if (value && value.returnData && value.returnData.length === 0) {
      return emptyAgencyMetaData;
    }
    const untypedResponse = value.outputUntyped();
    return new AgencyMetadata(
      decodeString(untypedResponse[0]),
      decodeString(untypedResponse[1]),
      decodeString(untypedResponse[2])
    );
  };
  React.useEffect(
    () => {
      Promise.all([
        getMetaData(dapp, delegationContract),
        getNumUsers(dapp, delegationContract),
        getContractConfig(dapp, delegationContract),
        getTotalActiveStake(dapp, delegationContract),
        getBlsKeys(dapp, delegationContract),
        dapp.apiProvider.getNetworkStats(),
        dapp.apiProvider.getNetworkStake(),
        dapp.proxy.getNetworkConfig(),
        dapp.proxy.getNetworkStatus(),
        getDelegationManagerContractConfig(dapp),
      ])
        .then(
          async ([
            metaData,
            numUsers,
            contractOverview,
            activeStake,
            blsKeysResponse,
            networkStats,
            networkStake,
            networkConfig,
            networkStatus,
            delegationManager,
          ]) => {
            const nodes = await syncNodes();
            dispatch({ type: 'setNodes', nodes });
            const eligibleNodes = Object.keys(nodes).filter(
              node => nodes[node].status === 'eligible'
            ).length;
            dispatch({
              type: 'setNumberOfEligibleNodes',
              numberOfEligibleNodes: eligibleNodes,
            });
            dispatch({
              type: 'setNumUsers',
              numUsers: decodeUnsignedNumber(numUsers.outputUntyped()[0]),
            });
            dispatch({
              type: 'setMinDelegationAmount',
              minDelegationAmount: decodeUnsignedNumber(delegationManager.outputUntyped()[0]),
            });
            const contract = getContractOverviewType(contractOverview);
            dispatch({
              type: 'setContractOverview',
              contractOverview: contract,
            });
            dispatch({
              type: 'setAgencyMetaData',
              agencyMetaData: getAgencyMetaDataType(metaData),
            });
            dispatch({
              type: 'setTotalActiveStake',
              totalActiveStake: decodeBigNumber(activeStake.outputUntyped()[0]).toFixed(),
            });
            dispatch({
              type: 'setNumberOfActiveNodes',
              numberOfActiveNodes: blsKeysResponse
                .outputUntyped()
                .filter(key => decodeString(key) === 'staked')
                .length.toString(),
            });
            dispatch({
              type: 'setNetworkConfig',
              networkConfig: new NetworkConfig(
                networkConfig.TopUpFactor,
                networkConfig.RoundDuration,
                networkConfig.RoundsPerEpoch,
                networkStatus.RoundsPassedInCurrentEpoch,
                new BigNumber(networkConfig.TopUpRewardsGradientPoint),
                networkConfig.ChainID
              ),
            });
            const stakingBalance = await getStakingSCBalance(); // Delete it after we migrate to erdjs 4.x
            const APR = parseFloat(
              calculateAPR({
                stats: new Stats(networkStats.Epoch),
                networkConfig: new NetworkConfig(
                  networkConfig.TopUpFactor,
                  networkConfig.RoundDuration,
                  networkConfig.RoundsPerEpoch,
                  networkStatus.RoundsPassedInCurrentEpoch,
                  new BigNumber(networkConfig.TopUpRewardsGradientPoint),
                  networkConfig.ChainID
                ),
                networkStake: new NetworkStake(
                  networkStake.TotalValidators,
                  networkStake.ActiveValidators,
                  networkStake.QueueSize,
                  new BigNumber(stakingBalance) // Replace with the economics value from erdjs 4.x
                ),
                blsKeys: blsKeysResponse.outputUntyped(),
                totalActiveStake: decodeBigNumber(activeStake.outputUntyped()[0]).toFixed(),
              })
            );

            dispatch({
              type: 'setAprPercentage',
              aprPercentage: (
                APR -
                APR *
                  ((contract && contract.serviceFee ? parseFloat(contract.serviceFee) : 0) / 100)
              )
                .toFixed(2)
                .toString(),
            });
          }
        )
        .catch(e => {
          console.error('To do ', e);
        });
    },
    /* eslint-disable react-hooks/exhaustive-deps */ []
  );

  return (
    <div className={`layout d-flex flex-column min-vh-100 ${page}`}>
      {page !== 'home' && <Navbar />}
      <main className="container flex-grow-1 d-flex p-3 p-sm-spacer">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
