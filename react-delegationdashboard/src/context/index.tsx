import React, { useEffect, useState } from 'react';
import { StateType, initialState, NodeDetails, Nodes } from './state';
import { DispatchType, reducer } from './reducer';
import axios from 'axios';
import { network } from 'config';
import { setItem } from 'storage/session';

export interface ContextType {
  children: React.ReactNode;
}

const Context = React.createContext<StateType | undefined>(undefined);
const Dispatch = React.createContext<DispatchType | undefined>(undefined);

function ContextProvider({ children }: ContextType) {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const [interval, setInt] = useState<NodeJS.Timeout | undefined>(undefined);

  const getLatestElrondData = async () => {
    await axios.get('https://testnet-api.elrond.com/quotes/latest').then(res => {
      dispatch({ type: 'setUSD', USD: res.data.usd });
    });
  };

  useEffect(() => {
    const fetch = async () => {
      await getLatestElrondData();
    };
    const syncNodes = async () => {
      await axios.get((network.apiAddress as string) + '/node/heartbeatstatus').then(nodes => {
        let result: Nodes = {};
        const res = nodes.data.data.heartbeats.filter(
          (node: NodeDetails) => node.identity === 'truststaking' && !node.nodeDisplayName.includes('Private')
        );
        res.forEach((node: NodeDetails) => {
          result[node.publicKey] = node;
        });
        setItem('nodes', result);
        dispatch({ type: 'setNodes', nodes: result });
      });
    };
    setInt(
      setInterval(async () => {
        await fetch();
      }, 20000)
    );
    fetch();
    syncNodes();
    return () => {
      clearInterval(interval as NodeJS.Timeout);
    };
  }, []);

  return (
    <Context.Provider value={state}>
      <Dispatch.Provider value={dispatch}>{children}</Dispatch.Provider>
    </Context.Provider>
  );
}

function useContext() {
  const context = React.useContext(Context);
  if (context === undefined) {
    throw new Error('useState must be used within a Context.Provider');
  }
  return context;
}

function useDispatch() {
  const context = React.useContext(Dispatch);
  if (context === undefined) {
    throw new Error('useDispatch must be used within a Dispatch.Provider');
  }
  return context;
}

export { ContextProvider, useContext, useDispatch };
