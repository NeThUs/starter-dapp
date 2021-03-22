import {
  ContractFunction,
  TransactionPayload,
  GasLimit,
  Address,
  SmartContract,
} from '@elrondnetwork/erdjs';
import { ProxyProvider, BigVal } from 'elrondjs';
import { delegationContractData, network } from '../config';

export default class Delegation {
  contract: SmartContract;
  proxyProvider: ProxyProvider;

  constructor(delegationContract?: string) {
    const address = new Address(delegationContract);
    this.contract = new SmartContract({ address });
    this.proxyProvider = new ProxyProvider(network.gatewayAddress!);
  }

  async sendTransaction(
    value: string,
    transcationType: string,
    args: string = ''
  ): Promise<boolean> {
    return this.sendTransactionBasedOnType(value, transcationType, args);
  }

  private async sendTransactionBasedOnType(
    value: string,
    transcationType: string,
    args: string = ''
  ): Promise<boolean> {
    window.scrollTo(0, 0);
    let delegationContract = delegationContractData.find(d => d.name === transcationType);
    if (!delegationContract) {
      throw new Error('The contract for this action in not defined');
    } else {
      let funcName = delegationContract.data;
      if (args !== '') {
        funcName = `${delegationContract.data}${args}`;
      }
      const func = new ContractFunction(funcName);
      let payload = TransactionPayload.contractCall()
        .setFunction(func)
        .build();

      const tx = {
        receiver: network.delegationContract,
        value: new BigVal(value),
        gasLimit: new GasLimit(delegationContract.gasLimit).valueOf(),
        data: payload.valueOf().toString(),
      };

      window.erdbox.setProvider(this.proxyProvider);
      try {
        const sign = await window.erdbox.getSigner();
        const signedTransaction = await sign.signTransaction(tx);
        console.log(signedTransaction);
        const hash = await this.proxyProvider.sendSignedTransaction(signedTransaction);
        await this.proxyProvider.waitForTransaction(hash);
      } catch (error) {
        console.log(error);
      }

      return true;
    }
  }
}
