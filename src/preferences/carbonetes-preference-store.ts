import { Common } from "@k8slens/extensions";
import { observable, makeObservable, action } from "mobx";

// const { Store } = Common;

export type CarbonetesStoreModel = {
  enabled: boolean;
  user: UserModel;
  analysis: AnalysisModel;
  analyses: AnalysesModel;
  registries: RegistriesModel;
}

export type UserModel = {
  email: string,
  password: string,
  auth: {
    username: string,
    token: string
  }
}

export type AnalysisModel = {
  deployment: any,
  result: any,
  isAnalyzing: boolean,
  isAnalyzed: boolean
}

export type AnalysesModel = AnalysisModel[]

export type RegistriesModel = RegistriesModel[]


export class CarbonetesStore extends Common.Store.ExtensionStore<CarbonetesStoreModel>{
  @observable enabled: boolean = false;

  @observable user: UserModel = {
    email: '',
    password: '',
    auth: {
      username: '',
      token: ''
    }
  }

  @observable analysis: AnalysisModel = {
    deployment: {},
    result: {},
    isAnalyzing: false,
    isAnalyzed: false,
  }

  @observable analyses: AnalysesModel = [];

  @observable registries: RegistriesModel = [];

  constructor() {
    super({
      configName: "carbonetes-store",
      defaults: {
        enabled: false,
        user: null,
        analysis:   {
          deployment: {},
          result: {},
          isAnalyzing: false,
          isAnalyzed: false,
        },
        analyses: [],
        registries: [],
      }
    });
    makeObservable(this);
  }

  // @action signIn(user: UserModel) {
  //   this.enabled = true;
  //   this.user = user;
  // };

  // @action signOut() {
  //   this.enabled = false;
  //   this.resetUser();
  //   this.resetAnalysis();
  //   this.analyses = [];
  //   this.registries = [];
  // };

  // @action resetUser() {
  //   this.user = {
  //     email: '',
  //     password: '',
  //     auth: {
  //       username: '',
  //       token: ''
  //     }
  //   };
  // }

  // @action resetAnalysis() {
  //   this.analysis = {
  //     deployment: {},
  //     result: {},
  //     isAnalyzing: false,
  //     isAnalyzed: false,
  //   };
  // }

  protected fromStore({ enabled, user, analysis, analyses, registries }: CarbonetesStoreModel): void {
    this.enabled = enabled;
    this.user = user;
    this.analysis = analysis;
    this.analyses = analyses;
    this.registries = registries;
  }

  toJSON(): CarbonetesStoreModel {
    return {
      enabled: this.enabled,
      user: this.user,
      analysis: this.analysis,
      analyses: this.analyses,
      registries: this.registries
    };
  }
}
