import { Renderer } from "@k8slens/extensions";
import { CarbonetesDetails, CarbonetesDetailsProps } from "./src/details/carbonetes-details"
import { CarbonetesStore } from "./src/preferences/carbonetes-preference-store";
import { CarbonetesPreferenceHint, CarbonetesPreferenceInput } from "./src/preferences/carbonetes-preferences";
import React from "react";

const { LensExtension } = Renderer;
export default class ExampleExtension extends LensExtension {
  appPreferences = [
    {
      title: "Carbonetes",
      components: {
        Hint: () => <CarbonetesPreferenceHint/>,
        Input: () => <CarbonetesPreferenceInput/>
      }
    }
  ];

  kubeObjectDetailItems = [
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        Details: (props: CarbonetesDetailsProps) => <CarbonetesDetails deployment={props}/>
      }
    }
  ]

  async onActivate() {
    console.log("Carbonetes extension activated");
    await CarbonetesStore.createInstance().loadExtension(this);
  }
}
