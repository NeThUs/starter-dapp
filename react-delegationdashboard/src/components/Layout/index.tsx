import { QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import BigNumber from 'bignumber.js';
import denominate from 'components/Denominate/formatters';
import { denomination, decimals, network } from 'config';
import { useContext, useDispatch } from 'context';
import { emptyAgencyMetaData, NodeDetails, Nodes } from 'context/state';
import { contractViews } from 'contracts/ContractViews';
import axios from 'axios';
import {
  AgencyMetadata,
  ContractOverview,
  NetworkConfig,
  NetworkStake,
  Stats,
} from 'helpers/contractDataDefinitions';
import React from 'react';
import { getItem, setItem } from 'storage/session';
import { calculateAPR } from './APRCalculation';
import Footer from './Footer';
import Navbar from './Navbar';

const syncNodes = async (): Promise<Nodes> => {
  if (getItem('nodes')) {
    return getItem('nodes');
  }
  return await axios.get((network.apiAddress as string) + '/node/heartbeatstatus').then(nodes => {
    let result: Nodes = {};
    const res = nodes.data.data.heartbeats.filter(
      (node: NodeDetails) =>
        node.identity === 'truststaking' && !node.nodeDisplayName.includes('Private')
    );
    res.forEach((node: NodeDetails) => {
      result[node.publicKey] = node;
    });
    setItem('nodes', result);
    return result;
  });
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
  } = contractViews;

  const getContractOverviewType = (value: QueryResponse) => {
    let initialOwnerFunds = denominate({
      decimals,
      denomination,
      input: value.returnData[3].asBigInt.toFixed(),
      showLastNonZeroDecimal: false,
    });
    return new ContractOverview(
      value.returnData[0].asHex.toString(),
      (value.returnData[1].asNumber / 100).toString(),
      value.returnData[2].asBigInt.toFixed(),
      initialOwnerFunds,
      value.returnData[4]?.asString,
      value.returnData[5].asBool,
      value.returnData[6].asBool,
      value.returnData[7]?.asString,
      value.returnData[8].asBool,
      value.returnData[9]?.asNumber * 6
    );
  };

  const getAgencyMetaDataType = (value: QueryResponse) => {
    if (value && value.returnData && value.returnData.length === 0) {
      return emptyAgencyMetaData;
    }
    return new AgencyMetadata(
      value.returnData[0]?.asString,
      value.returnData[1]?.asString,
      value.returnData[2]?.asString
    );
  };
  React.useEffect(() => {
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
      syncNodes(),
    ])
      .then(
        ([
          metaData,
          numUsers,
          contractOverview,
          {
            returnData: [activeStake],
          },
          { returnData: blsKeys },
          networkStats,
          networkStake,
          networkConfig,
          networkStatus,
          nodes,
        ]) => {
          dispatch({ type: 'setNodes', nodes });
          dispatch({
            type: 'setNumUsers',
            numUsers: numUsers.returnData[0].asNumber,
          });
          const scOverview = getContractOverviewType(contractOverview);
          dispatch({
            type: 'setContractOverview',
            contractOverview: scOverview,
          });
          dispatch({
            type: 'setAgencyMetaData',
            agencyMetaData: getAgencyMetaDataType(metaData),
          });
          dispatch({
            type: 'setTotalActiveStake',
            totalActiveStake: activeStake.asBigInt.toFixed(),
          });
          const eligibleNodes = Object.keys(nodes).filter(
            node => nodes[node].peerType === 'eligible'
          ).length;
          dispatch({
            type: 'setNumberOfActiveNodes',
            numberOfActiveNodes: blsKeys.filter(key => key.asString === 'staked').length.toString(),
          });
          dispatch({
            type: 'setNumberOfEligibleNodes',
            numberOfEligibleNodes: eligibleNodes.toString(),
          });
          const APR = calculateAPR({
            stats: new Stats(networkStats.Epoch),
            networkConfig: new NetworkConfig(
              networkConfig.TopUpFactor,
              networkConfig.RoundDuration,
              networkConfig.RoundsPerEpoch,
              networkStatus.RoundsPassedInCurrentEpoch,
              new BigNumber(networkConfig.TopUpRewardsGradientPoint)
            ),
            networkStake: new NetworkStake(
              networkStake.TotalValidators,
              networkStake.ActiveValidators,
              networkStake.QueueSize,
              new BigNumber(networkStake.TotalStaked)
            ),
            blsKeys: blsKeys,
            totalActiveStake: activeStake.asBigInt.toFixed(),
          });

          dispatch({
            type: 'setNetworkConfig',
            networkConfig: new NetworkConfig(
              networkConfig.TopUpFactor,
              networkConfig.RoundDuration,
              networkConfig.RoundsPerEpoch,
              networkStatus.RoundsPassedInCurrentEpoch,
              new BigNumber(networkConfig.TopUpRewardsGradientPoint)
            ),
          });
          dispatch({
            type: 'setAprPercentage',
            aprPercentage: APR,
          });
          const aprPercentageAfterFee = (
            parseFloat(APR) -
            (((parseFloat(scOverview.serviceFee as string) / 100) * parseFloat(APR)) as number)
          )
            .toFixed(2)
            .toString();

          dispatch({
            type: 'setAprPercentageAfterFee',
            aprPercentageAfterFee,
          });
        }
      )
      .catch(e => {});
  }, []);

  return (
    <div className={`layout d-flex flex-column min-vh-100 ${page}`}>
      {page !== 'home' && <Navbar />}
      <main className="container flex-grow-1 d-flex p-3 p-sm-spacer">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
