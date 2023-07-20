// import 'ping-widget';
import App from '@/App.vue';
import i18n from '@/plugins/i18n';
import '@/style.css';
import { createApp, ref, h } from 'vue';
import { createPinia } from 'pinia';
import LazyLoad from 'lazy-load-vue3';

import router from './router';
import { useBaseStore } from './stores/useBaseStore';
// @ts-ignore
import wrapper from 'vue3-webcomponent-wrapper';
import ConnectDosiVault from "@/components/FinschiaWidget/ConnectDosiVault.vue";
import FinschiaTxDialog from "@/components/FinschiaWidget/FinschiaTxDialog/index.vue";

// Create vue app
const app = createApp(App);
// Use plugins
app.use(i18n);
app.use(createPinia());
app.use(router);
app.use(LazyLoad, { component: true });
// Mount vue app
app.mount('#app');

// fetch latest block every 6s
const blockStore = useBaseStore();
const requestCounter = ref(0);
setInterval(() => {
  requestCounter.value += 1;
  if (requestCounter.value < 5) {
    // max allowed request
    blockStore.fetchLatest().finally(() => (requestCounter.value -= 1));
  }
}, 2000);

function registry(name: string, module: any) {
  if (!window.customElements.get(name)) {
    const component = wrapper(module, createApp, h);
    window.customElements.define(name, component);
  }
}
registry('connect-dosi-vault', ConnectDosiVault)
registry('finschia-tx-dialog', FinschiaTxDialog)
