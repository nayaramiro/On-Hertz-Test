import { createApp } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import VueApexCharts from "vue3-apexcharts";

import App from "./App.vue";


library.add(fas)

const app = createApp(App).use(VueApexCharts);
app.component("fa", FontAwesomeIcon);





app.mount("#app");
