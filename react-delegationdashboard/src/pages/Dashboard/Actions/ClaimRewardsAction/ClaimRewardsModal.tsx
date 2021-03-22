import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ViewStatAction from 'components/ViewStatAction';
import { useDelegation } from 'helpers';
import { useContext } from 'context';
import BigNumber from 'bignumber.js';
import State from 'components/State';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
export interface ClaimRewardsModalType {
  show: boolean;
  title: string;
  description: string;
  handleClose: () => void;
}
const ClaimRewardsModal = ({ show, title, description, handleClose }: ClaimRewardsModalType) => {
  const { delegation } = useDelegation();
  const { totalActiveStake, contractOverview } = useContext();
  const [loadingModal, setLoadingModal] = useState(false);
  const handleClaimRewards = async () => {
    try {
      setLoadingModal(true);
      await delegation.sendTransaction('0', 'claimRewards');
    } catch (error) {
      console.error('handleClaimRewards ', error);
    } finally {
      setLoadingModal(false);
      handleClose();
    }
  };

  const isRedelegateEnable = () => {
    const bnTotalActiveStake = new BigNumber(totalActiveStake);
    const bnMaxDelegationCap = new BigNumber(contractOverview.maxDelegationCap);
    if (
      bnTotalActiveStake.comparedTo(bnMaxDelegationCap) >= 0 &&
      contractOverview.reDelegationCap === 'true'
    ) {
      return false;
    }
    return true;
  };

  const handleRedelegateRewards = async () => {
    try {
      setLoadingModal(true);
      await delegation.sendTransaction('0', 'reDelegateRewards');
    } catch (error) {
      console.error('handleRedelegateRewards ', error);
    } finally {
      setLoadingModal(false);
      handleClose();
    }
  };
  return (
    <Modal show={show} onHide={handleClose} className="modal-container" animation={false} centered>
      {!loadingModal && (
        <div className="card">
          <div className="card-body p-spacer text-center">
            <p className="h6 mb-spacer" data-testid="delegateTitle">
              {title}
            </p>
            <p className="mb-spacer">{description}</p>
            <div className="d-flex justify-content-center align-items-center flex-wrap">
              <ViewStatAction
                actionTitle="Claim"
                handleContinue={handleClaimRewards}
                color="primary"
              />
              {isRedelegateEnable() && (
                <ViewStatAction
                  actionTitle="Redelegate"
                  handleContinue={handleRedelegateRewards}
                  color="orange"
                />
              )}
            </div>
            <button id="closeButton" className="btn btn-link mt-spacer mx-2" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      )}
      {loadingModal && <State icon={faCircleNotch} iconClass="fa-spin text-primary" />}
    </Modal>
  );
};

export default ClaimRewardsModal;
