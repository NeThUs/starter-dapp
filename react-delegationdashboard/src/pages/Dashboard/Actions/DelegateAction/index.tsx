import React, { useEffect, useState } from 'react';
import { Address } from '@elrondnetwork/erdjs/out';
import { useContext } from 'context';
import DelegateModal from './DelegateModal';
import { useDelegation } from 'helpers';

const DelegateAction = () => {
  const { dapp, address } = useContext();
  const { delegation } = useDelegation();
  const [balance, setBalance] = useState('');
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  useEffect(() => {
    dapp.proxy.getAccount(new Address(address)).then(value => setBalance(value.balance.toString()));
  }, [address, dapp.proxy]);

  const handleDelegate = async (value: string) => {
    try {
      setLoadingModal(true);
      await delegation.sendTransaction(value, 'delegate');
    } catch (error) {
      console.error('handleDelegate ', error);
    } finally {
      setShowDelegateModal(false);
      setLoadingModal(false);
    }
  };
  return (
    <div>
      <button
        onClick={() => {
          setShowDelegateModal(true);
        }}
        className="btn btn-primary mb-3"
      >
        Delegate
      </button>
      <DelegateModal
        show={showDelegateModal}
        balance={balance}
        loading={loadingModal}
        handleClose={() => {
          setShowDelegateModal(false);
        }}
        handleContinue={handleDelegate}
      />
    </div>
  );
};

export default DelegateAction;
