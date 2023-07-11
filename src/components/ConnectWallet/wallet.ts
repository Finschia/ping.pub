export enum WalletName {
    Keplr = "Keplr",
    DosiVault = "DosiVault",
    Ledger = "LedgerUSB",
    LedgerBLE = "LedgerBLE",
    Metamask = "Metemask",
    // None Signning
    Address = "Address",
    NameService = "Nameservice",
}

export interface Account {
    address: string,
    algo: string,
    pubkey: Uint8Array,
}

export interface ConnectedWallet {
    wallet: WalletName,
    cosmosAddress: string
    hdPath?: string
}

// finschia HDPath
export const DEFAULT_HDPATH = "m/44'/438/0'/0/0";

export function readWallet(hdPath?: string) {
    return JSON.parse(
        localStorage.getItem(hdPath || DEFAULT_HDPATH) || '{}'
    ) as ConnectedWallet
}

export function writeWallet(connected: ConnectedWallet, hdPath?: string) {
    localStorage.setItem(hdPath || DEFAULT_HDPATH, JSON.stringify(connected))
}

export function removeWallet(hdPath?: string) {
    localStorage.removeItem(hdPath || DEFAULT_HDPATH);
}

export function extractChainId(chainId: string) {
    const start = chainId.indexOf('_')
    const end = chainId.indexOf('-')
    if (end > start && start > 0) {
        return Number(chainId.substring(start + 1, end))
    }
    return 0
}

export const connectDosiVault = async (chainId: string) => {
    console.log(`Suggesting chain ${chainId}...`);
    if (window) {
        // @ts-ignore
        if (window["dosiVault"]) {
            // @ts-ignore
            if (window.dosiVault["experimentalSuggestChain"]) {
                // suggest chain dosiVault
                // @ts-ignore
                await window.dosiVault.enable(chainId)
                // @ts-ignore
                const offlineSigner = window.dosiVault.getOfflineSigner(chainId);
                return await offlineSigner.getAccounts();
            } else {
                // console.debug("Error access experimental features, please update DOSI Vault");
                throw new Error("Error access experimental features, please update DOSI Vault")
            }
        } else {
            throw new Error("Error accessing DOSI Vault")
        }
    } else {
        throw new Error("Error parsing window object")
    }
};
