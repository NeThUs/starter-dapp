import { useDelegation } from 'helpers';
import React, { useState } from 'react';
import { useContext } from 'context';
import { nominateValToHex } from 'helpers/nominate';
import UndelegateModal from './UndelegateModal';

interface UndelegateModalType {
  balance: string;
}

const UndelegateAction = ({balance}: UndelegateModalType) => {
  const { egldLabel } = useContext();
  const { delegation } = useDelegation();
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const handleUndelegate = async (value: string) => {
    try {
      setLoadingModal(true);
      await delegation.sendTransaction('0', 'unDelegate', nominateValToHex(value));
    } catch (error) {
      console.error('handleRedelegateRewards ', error);
    } finally {
      setLoadingModal(false);
      setShowModal(false);
    }
  };
  return (
    <div>
      <button onClick={() => setShowModal(true)} className="btn btn-primary ml-3 mb-3">
        Undelegate
      </button>
      
      <UndelegateModal
        show={showModal}
        balance={balance}
        title="Undelegate now"
        description={`Select the amount of ${egldLabel} you want to undelegate.`}
        handleClose={() => {
          setShowModal(false);
        }}
        loading={loadingModal}
        handleContinue={handleUndelegate}
      />
    </div>
  );
};

export default UndelegateAction;
