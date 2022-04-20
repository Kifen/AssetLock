import * as dotenv from "dotenv";

import { providers, Wallet, BigNumber, utils } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";

export const ETH = "ETH";
export const TOKEN = "TOKEN";

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

import fs from "fs";
import path from "path";

const addressFile = "contract-addresses.json";

export const getSavedContractAddresses = () => {
  let json: any;
  try {
    json = fs.readFileSync(path.join(__dirname, `../${addressFile}`));
  } catch (err) {
    json = "{}";
  }
  const addrs = JSON.parse(json);
  return addrs;
};

export const saveContractAddress = (
  network: any,
  contract: string,
  address: string
) => {
  const addrs = getSavedContractAddresses();
  addrs[network] = addrs[network] || {};
  addrs[network][contract] = address;

  fs.writeFileSync(
    path.join(__dirname, `../${addressFile}`),
    JSON.stringify(addrs, null, "    ")
  );
};

export const toBN = (value: number): BigNumber => {
  return BigNumber.from(value).mul(BigNumber.from(10).pow(18));
};

export const quickChecks = async (to: string) => {
  if (to != ETH && to != TOKEN) {
    throw new Error(`to must be ${ETH} or ${TOKEN}`);
  }
};
