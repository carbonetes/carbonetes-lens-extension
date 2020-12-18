import { LensMainExtension } from "@k8slens/extensions";
import { carbonetesStore } from "./src/preferences/carbonetes-preference-store";

export default class ExampleExtensionMain extends LensMainExtension {
  async onActivate() {
    console.log('Carbonetes Extension activated');
    await carbonetesStore.loadExtension(this);
  }

  onDeactivate() {
    console.log('Carbonetes Extension de-activated');
  }
}
