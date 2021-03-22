import { useContext } from 'context';
import { Delegation } from 'contracts';

export default function useDelegation() {
  const { delegationContract } = useContext();
  const delegation = new Delegation(delegationContract);
  return { delegation };
}
