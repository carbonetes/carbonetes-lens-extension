import { Main } from "@k8slens/extensions";
import { carbonetesStore } from "./src/preferences/carbonetes-preference-store";

const { LensExtension } = Main;

export default class ExampleExtensionMain extends LensExtension {
  async onActivate() {
    console.log('Carbonetes Extension activated');
    await carbonetesStore.loadExtension(this);
  }

  onDeactivate() {
    console.log('Carbonetes Extension de-activated');
  }
}
