import React from 'react';
import { useDispatch } from 'context';

(() => {
  const g = window.document.createElement('script');
  g.id = 'erdboxScript';
  g.type = 'text/javascript';
  g.async = true;
  g.defer = true;
  g.src = 'https://cdn.jsdelivr.net/npm/erdbox@1.12.1/dist/erdbox.js';
  window.document.body.appendChild(g);
})();

const WalletLogin = () => {
  const dispatch = useDispatch();
  const handleOnClick = async () => {
    window.scrollTo(0, 0);
    dispatch({ type: 'loading', loading: true });
    const connector = window.erdbox;
    const cachedWallet = window.localStorage.getItem('wallet');
    const address = cachedWallet || await connector.getWalletAddress({ mustLoadWallet: true });
    dispatch({ type: 'login', address });
    dispatch({ type: 'loading', loading: false });

  };

  return (
    <button onClick={handleOnClick} className="btn btn-primary px-sm-spacer mx-1 mx-sm-3">
      Login
    </button>
  );
};

export default WalletLogin;
