import { LensRendererExtension, Component } from "@k8slens/extensions";
import { CarbonetesDetails, CarbonetesDetailsProps } from "./src/details/carbonetes-details"
import { carbonetesStore } from "./src/preferences/carbonetes-preference-store";
import { CarbonetesPreferenceHint, CarbonetesPreferenceInput } from "./src/preferences/carbonetes-preferences";
import React from "react";
export default class ExampleExtension extends LensRendererExtension {
  appPreferences = [
    {
      title: "Carbonetes",
      components: {
        Hint: () => <CarbonetesPreferenceHint/>,
        Input: () => <CarbonetesPreferenceInput carbonetesStore={carbonetesStore}/>
      }
    }
  ];

  kubeObjectDetailItems = [
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        Details: (props: CarbonetesDetailsProps) => <CarbonetesDetails deployment={props} carbonetesStore={carbonetesStore}/>
      }
    }
  ]

  async onActivate() {
    console.log("Carbonetes extension activated");
    await carbonetesStore.loadExtension(this);
  }
}
