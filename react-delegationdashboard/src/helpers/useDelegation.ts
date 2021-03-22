import { Delegation } from 'contracts';

export default function useDelegation() {
  const delegation = new Delegation();
  return { delegation };
}
