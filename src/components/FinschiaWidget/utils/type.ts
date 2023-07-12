import type { EncodeObject } from '@cosmjs/proto-signing';
import type { SignerData, StdFee } from '@cosmjs/stargate';

export interface Coin {
    amount: string,
    denom: string,
}

export interface CoinMetadata {
    description: string,
    denom_units: {
        denom: string,
        exponent: number,
        aliases: string[]
    }[],
    base: string,
    display: string,
    name: string,
    symbol: string
}

export interface TxResponse {
    height: string,
    txhash: string,
    codespace: string,
    code: 0,
    data: string,
    raw_log: string,
}

export interface Transaction {
    chainId: string;
    signerAddress: string;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signerData: SignerData
}
