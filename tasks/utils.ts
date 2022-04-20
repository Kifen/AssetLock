import * as dotenv from "dotenv";

import { providers, Wallet, BigNumber, utils } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";

export const ethersProvider = (): Provider => {
  return new providers.JsonRpcProvider(process.env.RINKEBY_URL);
};

export const signer = async (): Promise<Signer> => {
  const signer: Signer = new Wallet(process.env.PK!);
  return await signer.connect(ethersProvider());
};

export const parseBN = (val: string): BigNumber => {
  return utils.parseUnits(val, 18);
};
