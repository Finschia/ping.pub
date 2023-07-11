<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import {
  WalletName,
  connectDosiVault,
  readWallet,
  writeWallet,
  removeWallet,
} from "./wallet";

import type {Account, ConnectedWallet} from "./wallet"

const props = defineProps({
  chainId: String,
  hdPath: String,
  addrPrefix: String, // address prefix
});

const emit = defineEmits(['connect', 'disconnect', 'update', 'dosivault-config']);

const sending = ref(false);
const open = ref(false);
const error = ref('');

const name = ref(WalletName.DosiVault);

async function initData() {
}

const connected = ref(readWallet(props.hdPath) as ConnectedWallet);

async function connect() {
  sending.value = true;
  error.value = '';
  let accounts = [] as Account[];
  const chainId = props.chainId
  console.log("chainId: ", chainId)
  if (chainId != undefined) {
    try {
      const wa = connectDosiVault(chainId.toString())
      await wa
          .then((x) => {
            accounts = x;
            if (accounts.length > 0) {
              const [first] = accounts;
              connected.value = {
                wallet: name.value,
                cosmosAddress: first.address,
                hdPath: props.hdPath,
              };
              writeWallet(connected.value, props.hdPath)
              emit('connect', {
                value: connected.value,
              })
            }
            open.value = false;
          })
          .catch((e) => {
            error.value = e;
          });
    } catch (e: any) {
      error.value = e.message
    }
    sending.value = false;
  } else {
    error.value = "A chainId is not selected."
  }
}

function disconnect() {
  removeWallet(props.hdPath);
  emit('disconnect', {value: connected.value});
  connected.value = {} as ConnectedWallet;
}

function dosiVault() {
  emit('dosivault-config', {})
  open.value = false
}

</script>

<template>
  <div class="mb-4">
    <input v-model="open" type="checkbox" id="FinschiaConnectWallet" class="modal-toggle" @change="initData()"/>

    <label for="FinschiaConnectWallet" class="modal cursor-pointer z-[999999]">
      <header class="md-editor-modal-header"></header>
      <label class="modal-box rounded-lg" for="">
        <h3 class="card-title py-2">Connect DOSI Wallet</h3>
        <span class="text-left">Download DOSI Vault browser extension for wallet connection.</span>
        <a href="https://vault.dosi.world" target="_blank" rel="noopener noreferrer" @click="">
          <div class="w-full h-full p-5 mt-2 mb-2 bg-gray-100 !inline-flex !flex-col items-center">
            <img src="/logos/dosi-vault.png">
            <span class="text-base mt-1">
            DOSI Vault browser extension
            </span>
          </div>
        </a>
        <div v-show="error" class="text-error mt-3">
          <span>{{ error }}.</span>
        </div>
        <div class="mt-8 text-right flex">
          <label class="btn mr-1" @click="dosiVault">
            <Icon icon="mdi:cog-outline"/>
          </label>
          <label class="btn btn-primary ping-connect-confirm grow" @click="connect()">
            <span v-if="sending" class="loading loading-spinner"></span>
            Connect
          </label>
        </div>
      </label>

    </label>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ConnectDosiVault',
  components: { Icon }
}
</script>
