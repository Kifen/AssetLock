

# AssetLock

AssetLock is an implementation of a trustless luck contract. Deployment addresses can be found at [contract-addresses.json](https://github.com/Kifen/AssetLock/blob/main/contract-addresses.json).


### Build and Run
```
$ git clone git@github.com:Kifen/AssetLock.git
$ cd AssetLock
$ npm install
```

Create file `.env` using below [template](https://github.com/Kifen/AssetLock/blob/main/.env.example):

```
PK= 
RINKEBY_URL=
ETHERSCAN_API_KEY=
```

The following testing scripts have been implemented to enable adding liquidity to uniswap, swapping and withdrawing swapped assets:

### withdraw

- `npx hardhat withdraw --asset <TOKEN or ETH>  --network rinkeby`

Example:
```
$ npx hardhat withdraw --asset ETH --network rinkeby
```

### swapEthForTokens

- `npx hardhat swap --amount-in <amount> --unlocker <address> --to <TOKEN or ETH> --network rinkeby`

Example:
```
$ npx hardhat swap --amount-in 0.00000006 --unlocker 0xc62661BAe6E8346725305318476521E87977E371 --to TOKEN --network rinkeby
```

### addLiquidity

- `npx hardhat add-liquidity --token-a <supported ERC20 token address> --amount-a <amount of tokenA to add as liquidity> --amount-b <amount of ETH to add as liquidity> --network rinkeby`

Example:
```
 $ npx hardhat add-liquidity --token-a 0xB18ae96948108d0D8B9aD88C76Ea0e4AA2596176 --amount-a 19000 --amount-b 0.008 --network rinkeby
```

