import * as React from 'react';
import { useContext, useDispatch } from 'context';
import denominate from 'components/Denominate/formatters';
import DelegateAction from '../Actions/DelegateAction';
import UndelegateAction from '../Actions/UndelegateAction';
import { contractViews } from 'contracts/ContractViews';
import ClaimRewardsAction from '../Actions/ClaimRewardsAction';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import State from 'components/State';
import { denomination, decimals } from 'config';
import StatCard from 'components/StatCard';

const MyDelegation = () => {
  const { dapp, address, egldLabel, delegationContract, loading } = useContext();
  const dispatch = useDispatch();
  const {
    getClaimableRewards,
    getUserActiveStake,
    getTotalCumulatedRewardsForUser,
  } = contractViews;
  const [userActiveStake, setUserActiveStake] = React.useState('0');
  const [userActiveNominatedStake, setUserActiveNominatedStake] = React.useState('0');
  const [claimableRewards, setClaimableRewards] = React.useState('0');
  const [cumulatedRewards, setCumulatedRewards] = React.useState('0');
  const [displayRewards, setDisplayRewards] = React.useState(false);
  const [displayUndelegate, setDisplayUndelegate] = React.useState(false);

  const getAllData = () => {
    dispatch({ type: 'loading', loading: true });
    getClaimableRewards(dapp, address, delegationContract)
      .then(value => {
        if (value.returnData.length > 0 && value.returnData[0]?.asNumber !== 0) {
          setDisplayRewards(true);
        }
        setClaimableRewards(
          denominate({
            denomination,
            decimals,
            input: value.returnData[0]?.asBigInt.toString(),
            showLastNonZeroDecimal: false,
          }) || ''
        );
      })
      .catch(e => console.error('getClaimableRewards error', e));
    getTotalCumulatedRewardsForUser(dapp, address, delegationContract)
      .then(value => {
        setCumulatedRewards(
          denominate({
            denomination,
            decimals,
            input: value.returnData[0]?.asBigInt.toString(),
            showLastNonZeroDecimal: false,
          }) || ''
        );
      })
      .catch(e => console.error('getTotalCumulatedRewardsForUser error', e));
    getUserActiveStake(dapp, address, delegationContract)
      .then(value => {
        setUserActiveStake(
          denominate({
            denomination,
            decimals,
            input: value.returnData[0]?.asBigInt.toString(),
            showLastNonZeroDecimal: false,
          }) || ''
        );
        setUserActiveNominatedStake(value.returnData[0]?.asBigInt.toString());
        if (value.returnData.length > 0 && value.returnData[0]?.asNumber !== 0) {
          setDisplayUndelegate(true);
        }

        dispatch({ type: 'loading', loading: false });
      })
      .catch(e => {
        console.error('getUserActiveStake error', e);
        dispatch({
          type: 'loading',
          loading: false,
        });
      });
  };

  React.useEffect(getAllData, []);
  return (
    <>
      {loading ? (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
      ) : (
        <div className="card mt-spacer">
          <div className="card-body p-spacer">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <p className="h6 mb-3">Dashboard</p>
              {userActiveStake !== String(0) && (
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <DelegateAction />
                  {displayUndelegate && <UndelegateAction balance={userActiveNominatedStake} />}
                  {displayRewards && <ClaimRewardsAction />}
                </div>
              )}
            </div>
            {userActiveStake === String(0) ? (
              <State
                title="No Stake Yet"
                description="Welcome to our platform!"
                action={<DelegateAction />}
              />
            ) : (
              <div className="m-auto text-center py-spacer">
                <div className="cards d-flex flex-wrap mr-spacer">
                  <StatCard
                    title="Active Delegation"
                    value={`${userActiveStake} ${egldLabel}`}
                    color="orange"
                    svg="money-bag.svg"
                    percentage={''}
                  />
                  <StatCard
                    title="Claimable rewards"
                    value={`${claimableRewards} ${egldLabel}`}
                    color="orange"
                    svg="save-money.svg"
                    percentage={'This amount can be claimed or re-delegated'}
                  />
                  <StatCard
                    title="Cumulated rewards"
                    value={`${cumulatedRewards} ${egldLabel}`}
                    color="orange"
                    svg="dollar.svg"
                    percentage={'This is the total reward you ever received!'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyDelegation;
