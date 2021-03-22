import { Delegation } from 'contracts';

export const nodeTransactions = {
  unStake: (blsKey: string) => {
    const delegation = new Delegation();
    return delegation.sendTransaction('0', 'unStakeNodes', blsKey);
  },
  reStake: (blsKey: string) => {
    const delegation = new Delegation();
    return delegation.sendTransaction('0', 'reStakeUnStakedNodes', blsKey);
  },
  unJail: (blsKey: string) => {
    const delegation = new Delegation( );
    return delegation.sendTransaction('2.5', 'unJailNodes', blsKey);
  },
  unBond: (blsKey: string) => {
    const delegation = new Delegation();
    return delegation.sendTransaction('0', 'unBondNodes', blsKey);
  },
  stake: (blsKey: string) => {
    const delegation = new Delegation();
    return delegation.sendTransaction('0', 'stakeNodes', `${blsKey}`);
  },
  remove: (blsKey: string) => {
    const delegation = new Delegation();
    return delegation.sendTransaction('0', 'removeNodes', `${blsKey}`);
  },
};
