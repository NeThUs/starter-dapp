import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Address } from '@elrondnetwork/erdjs/out';
import { useContext, useDispatch } from 'context';
import SetAgencyMetaDataModal from './SetAgencyMetaDataModal';
import { getItem } from 'storage/session';
import Denominate from 'components/Denominate';

const Header = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const {
    address,
    delegationContract,
    contractOverview,
    ledgerAccount,
    loggedIn,
    account,
    dapp,
  } = useContext();

  const isAdmin = () => {
    let loginAddress = new Address(address).hex();
    return loginAddress.localeCompare(contractOverview.ownerAddress) === 0;
  };

  const fetchLedger = () => {
    if (getItem('ledgerLogin') && !ledgerAccount) {
      const ledgerLogin = getItem('ledgerLogin');
      dispatch({
        type: 'setLedgerAccount',
        ledgerAccount: {
          index: ledgerLogin.index,
          address: address,
        },
      });
    }
  };

  const logOut = () => {
    dispatch({ type: 'logout', provider: dapp.provider });
  };
  useEffect(fetchLedger, []);

  return (
    <div className="card-header align-items-center border-0 justify-content-between">
      <div className="d-flex border-0 align-items-center justify-content-between">
        <div className="text-truncate">
          <p className="opacity-6 mb-0">Balance</p>
          <span className="text-truncate">
            <Denominate value={account.balance.toString()} />
          </span>
        </div>
        <div className="d-flex border-0 align-items-center justify-content-between">
          {isAdmin() && pathname !== '/owner' ? (
            <Link to="/owner" className="btn btn-primary btn-sm">
              Owner
            </Link>
          ) : null}
          {pathname !== '/dashboard' ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm ml-3">
              Dashboard
            </Link>
          ) : null}

          {isAdmin() && pathname == '/owner' ? <SetAgencyMetaDataModal /> : null}
          {loggedIn && (
            <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
              <a href="/#" onClick={logOut} className="btn btn-danger btn-sm ml-3">
                Close
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="d-flex border-0 align-items-center justify-content-between">
        <div className="text-truncate">
          <p className="opacity-6 mb-0">Contract</p>
          <span className="text-truncate">{delegationContract}</span>
        </div>
      </div>{' '}
      <div className="text-truncate">
        <p className="opacity-6 mb-0">Wallet</p>
        <span className="text-truncate">{address}</span>
      </div>
    </div>
  );
};

export default Header;
