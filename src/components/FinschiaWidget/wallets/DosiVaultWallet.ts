import type {AbstractWallet, Account, WalletArgument} from "./wallet";
import {WalletName} from "./wallet";
import type {Registry, TxBodyEncodeObject} from "@cosmjs/proto-signing";
import {encodePubkey, makeAuthInfoBytes, makeSignDoc} from "@cosmjs/proto-signing"
import type {Transaction} from "@/components/FinschiaWidget/utils/type";
import {TxRaw} from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import {Any} from "cosmjs-types/google/protobuf/any";
import {fromBase64, fromBech32, toHex} from "@cosmjs/encoding";
import {PubKey} from 'cosmjs-types/cosmos/crypto/secp256k1/keys'
import {encodeSecp256k1Pubkey} from "@cosmjs/amino";

export class DosiVaultWallet implements AbstractWallet {
    name: WalletName.DosiVault
    chainId: string
    registry: Registry
    conf: WalletArgument
    constructor(arg: WalletArgument, registry: Registry) {
        this.name = WalletName.DosiVault
        this.chainId = arg.chainId || "finschia-2"
        // @ts-ignore
        if (!window.dosiVault || !window.dosiVault.getOfflineSigner) {
            throw new Error('Please install DosiVault extension')
        }
        this.registry = registry
        this.conf = arg
    }

    async getAccounts(): Promise<Account[]> {
        // @ts-ignore
        await window.dosiVault.enable(this.chainId)
        // @ts-ignore
        const offlineSigner = window.dosiVault.getOfflineSigner(this.chainId)
        return offlineSigner.getAccounts()
    }

    isEthermint() {
        return this.conf.hdPath && this.conf.hdPath.startsWith("m/44'/60")
    }

    supportCoinType(coinType?: string): Promise<boolean> {
        return Promise.resolve(true)
    }
    async sign(transaction: Transaction): Promise<TxRaw> {
        const accouts = await this.getAccounts()
        const hex = toHex(fromBech32(transaction.signerAddress).data)
        const accountFromSigner = accouts.find((account) => toHex(fromBech32(account.address).data) === hex);
        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }
        const pubkey = this.isEthermint() ? Any.fromPartial({
            typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
            value: PubKey.encode({
                key: accountFromSigner.pubkey,
            }).finish(),
        }) : encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
        const txBodyEncodeObject: TxBodyEncodeObject = {
            typeUrl: "/cosmos.tx.v1beta1.TxBody",
            value: {
                messages: transaction.messages,
                memo: transaction.memo,
            },
        };
        console.log(txBodyEncodeObject, transaction.messages)
        const txBodyBytes = this.registry.encode(txBodyEncodeObject);
        const gasLimit = Number(transaction.fee.gas);
        const authInfoBytes = makeAuthInfoBytes(
            [{ pubkey, sequence: transaction.signerData.sequence }],
            transaction.fee.amount,
            gasLimit,
            transaction.fee.granter,
            transaction.fee.payer,
        );
        const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, transaction.chainId, transaction.signerData.accountNumber);

        // @ts-ignore
        const offlineSigner = window.dosiVault.getOfflineSigner(this.chainId)
        const { signature, signed } = await offlineSigner.signDirect(transaction.signerAddress, signDoc);;
        return TxRaw.fromPartial({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [fromBase64(signature.signature)],
        });
    }
}
