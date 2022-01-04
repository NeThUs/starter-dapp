import React from 'react';
import { Redirect } from 'react-router-dom';
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Logo } from 'assets/images/logo.svg';
import State from 'components/State';
import { useContext } from 'context';
import WalletLogin from './Login/Wallet';
import WalletConnectLogin from './Login/WalletConnect';

const Home = () => {
  const { loading, error, loggedIn, egldLabel } = useContext();

  const ref = React.useRef(null);

  return (
    <div ref={ref} className="home d-flex flex-fill align-items-center">
      {error ? (
        <State
          icon={faBan}
          iconClass="text-primary"
          title="Something went wrong"
          description="If the problem persists please contact support."
        />
      ) : loggedIn ? (
        <Redirect to="/dashboard" />
      ) : loading ? (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
      ) : (
        <header class="sticky-top bg-white" style="border-bottom: 1px solid #999999;">	
        <div class="container">
        <nav class="navbar bg-white">
          <a class="logo" href="#" target="_blank"></a>
          <a href="#" id="aboutus" class="btn btn-xs login-btn-desktop hidden-xs slideLeft">About Us </a>
          <a href="https://t.me/NTHIncAg" id="telegram" class="btn btn-xs login-btn-desktop hidden-xs slideLeft">Telegram Group </a>
        </nav>
        </div>	
        </header>
        <div className="m-auto login-container">
        <div className="dashboard w-100">
         <div className="card border-0">
          <div className="card-body px-spacer">
           <h3 className="p-spacer pb-0 text-center">NTH Inc Delegation Manager</h3>
          </div>
         </div>
        </div>
          <div className="card my-spacer text-center">
        <div className="dashboard w-100">
         <div className="card border-0">
          <div className="card-body pt-0 px-spacer pb-spacer">
           <p className="text-center">You can find us on telegram: </p>
           <h4 className="text-center" id="telegram"><a href="https://t.me/NTHIncAg" target="_blank">NTH Inc</a></h4>
          </div>
         </div>
        </div>
            <div className="card-body p-spacer mx-lg-spacer">
              <Logo className="logo mb-spacer" /> 
              <p className="lead mb-spacer">
                Delegate Elrond ({egldLabel}) and earn up to 16% APY!
              </p>
              <p className="mb-spacer">Please select your login method:</p>
              <div>
                <a
                  href={process.env.PUBLIC_URL + '/ledger'}
                  className="btn btn-primary px-sm-spacer mx-1 mx-sm-3"
                >
                  Ledger
                </a>
                <WalletLogin />
                <WalletConnectLogin />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
