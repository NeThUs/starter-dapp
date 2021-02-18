import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import denominate from 'components/Denominate/formatters';
import { Address } from '@elrondnetwork/erdjs/out';
import { useContext, useDispatch } from '../../../context';
import { denomination, decimals } from 'config';
import { getItem } from 'storage/session';

const Header = () => {
  const { pathname } = useLocation();
  const {
    address,
    delegationContract,
    contractOverview,
    account,
    egldLabel,
    dapp,
    loggedIn,
  } = useContext();
  const dispatch = useDispatch();

  const isAdmin = () => {
    let loginAddress = new Address(address).hex();
    return loginAddress.localeCompare(contractOverview.ownerAddress) === 0;
  };

  const logOut = () => {
    dispatch({ type: 'logout', provider: dapp.provider });
  };

  const balance = denominate({
    denomination,
    decimals,
    input: account.balance,
    showLastNonZeroDecimal: false,
  });

  useEffect(() => {
    if (balance === '...') {
      dapp.proxy
        .getAccount(new Address(getItem('address')))
        .then(account => dispatch({ type: 'setBalance', balance: account.balance.toString() }));
    }
  }, []);

  return (
    <div className="card-header align-items-center border-0 justify-content-between">
      <div className="d-flex border-0 align-items-center justify-content-between">
        <div className="text-truncate">
          <p className="opacity-6 mb-0">Balance</p>
          <span className="text-truncate">
            {balance} {egldLabel}
          </span>
        </div>
        <div className="d-flex border-0 align-items-center justify-content-between">
          {isAdmin() && pathname !== '/owner' ? (
            <Link to="/owner" className="btn btn-primary btn-sm">
              Admin
            </Link>
          ) : null}
          {pathname !== '/dashboard' ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : null}
          {loggedIn && (
            <a href="/#" onClick={logOut} className="btn btn-primary btn-sm ml-3">
              Close
            </a>
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
