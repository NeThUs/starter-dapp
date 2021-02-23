import { QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import denominate from 'components/Denominate/formatters';
import { denomination, decimals } from 'config';
import { useContext, useDispatch } from 'context';
import { contractViews } from 'contracts/ContractViews';
import { ContractOverview, NetworkConfig, NetworkStake, Stats } from 'helpers/types';
import React from 'react';
import { calculateAPR } from './APRCalculation';
import Footer from './Footer';
import Navbar from './Navbar';

const Layout = ({ children, page }: { children: React.ReactNode; page: string }) => {
  const dispatch = useDispatch();
  const { dapp, delegationContract } = useContext();
  const { getContractConfig, getTotalActiveStake, getBlsKeys, getNumUsers } = contractViews;

  const getContractOverviewType = (value: QueryResponse) => {
    let delegationCap = denominate({
      decimals,
      denomination,
      input: value.returnData[2].asBigInt.toString(),
      showLastNonZeroDecimal: false,
    });
    let initialOwnerFunds = denominate({
      decimals,
      denomination,
      input: value.returnData[3].asBigInt.toString(),
      showLastNonZeroDecimal: false,
    });
    return new ContractOverview(
      value.returnData[0].asHex.toString(),
      (value.returnData[1].asNumber / 100).toString(),
      delegationCap,
      initialOwnerFunds,
      value.returnData[4]?.asString,
      value.returnData[5].asBool,
      value.returnData[6].asBool,
      value.returnData[7].asBool,
      value.returnData[8]?.asNumber * 6
    );
  };

  React.useEffect(() => {
    Promise.all([
      getNumUsers(dapp, delegationContract),
      getContractConfig(dapp, delegationContract),
      getTotalActiveStake(dapp, delegationContract),
      getBlsKeys(dapp, delegationContract),
      dapp.apiProvider.getNetworkStats(),
      dapp.apiProvider.getNetworkStake(),
      dapp.proxy.getNetworkConfig(),
    ])
      .then(
        ([
          numUsers,
          contractOverview,
          {
            returnData: [activeStake],
          },
          { returnData: blsKeys },
          networkStats,
          networkStake,
          networkConfig,
        ]) => {
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
            type: 'setTotalActiveStake',
            totalActiveStake: activeStake.asBigInt.toString(),
          });
          dispatch({
            type: 'setNumberOfActiveNodes',
            numberOfActiveNodes: (blsKeys.length / 2).toString(),
          });
          const APR = calculateAPR({
            stats: new Stats(networkStats.Epoch),
            networkConfig: new NetworkConfig(
              networkConfig.TopUpFactor,
              networkConfig.TopUpRewardsGradientPoint
            ),
            networkStake: new NetworkStake(
              networkStake.TotalValidators,
              networkStake.ActiveValidators,
              networkStake.QueueSize,
              networkStake.TotalStaked
            ),
            blsKeys: blsKeys,
            totalActiveStake: activeStake.asBigInt.toString(),
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
      .catch(e => {
        console.log('To do ', e);
      });
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
