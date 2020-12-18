import { Component, K8sApi } from "@k8slens/extensions";
import React from "react";
import { CarbonetesStore } from "../preferences/carbonetes-preference-store";
import request from '../service/requests';
import PolicyEvaluation from './policy-evaluation';
import CompleteAnalysis from './complete-analysis';
import Vulnerabilities from './vulnerabilities';
import { 
  REGISTRY,
  IMAGE_NAME,
  NAMESPACES
} from '../utils/constants'
import "./carbonetes-details.scss";
import { observer } from "mobx-react";

export interface CarbonetesDetailsProps extends Component.KubeObjectDetailsProps<K8sApi.Deployment> {
}

type Props = {
  carbonetesStore: CarbonetesStore,
  deployment : Component.KubeObjectDetailsProps<K8sApi.Deployment>
}

type State = {
  isLoading : boolean,
}

@observer
export class CarbonetesDetails extends React.Component<Props, State> {

  constructor(props: Props | Readonly<Props>) {
    super(props);

    this.state = {
      isLoading : false,
    };
  };

  componentDidMount() {

    this.getAnalysis();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const { deployment } = this.props;
    const { object } = deployment;

    // If Deployment metadata UID changes
    // Set initial state
    if (object.metadata.uid !== prevProps.deployment.object.metadata.uid) {
      this.getAnalysis();
    }
  }

  getAnalysis = () => {
    const { deployment, carbonetesStore } = this.props;
    const { object } = deployment;

    const currentAnalysis = carbonetesStore.analyses.filter((analysis: any) => analysis.deployment.metadata.uid === object.metadata.uid);
    if (currentAnalysis.length > 0) {
      const analyzed  = currentAnalysis.find((analysis: any) => analysis.isAnalyzed === true);
      const analyzing = currentAnalysis.find((analysis: any) => analysis.isAnalyzed === false);
      if (analyzed) {
        carbonetesStore.analysis = analyzed;
      } else {
        carbonetesStore.analysis = analyzing;
      }
    } else {
      // carbonetesStore.resetAnalysis();
      // carbonetesStore.analysis.deployment = object;
      this.checkAnalysisResult();
    }
  }

  // Get image registry and image tag from KubeObjectDetailsProps<K8sApi.Deployment>
  getImage: any = (deployment: K8sApi.Deployment, property: String = null) => {
    const containers = deployment.spec.template.spec.containers;

    let image = {
      registry: '',
      name: '',
    };

    if (containers.length > 0) {
      containers.map((container) => {
        const imageArray = container.image.split('/');
        
        image.registry= imageArray[0];
        image.name    = imageArray[1];
      });
    }

    const { registry, name } = image;
    
    switch (property) {
      case REGISTRY:
        return registry;
      case IMAGE_NAME:
        return name;
      default:
        return image
    }
  }

  // Check image if image is already been analyzed
  checkAnalysisResult =  () => {
    const { deployment, carbonetesStore } = this.props;
    const { object } = deployment;

    const image     = this.getImage(object);
    const imageName = image.name.split(':')[0];
    const imageTag  = image.name.split(':')[1];

    // carbonetesStore.analysis.isAnalyzing = true;
    request.checkAnalysisResult({
      headers: {
        'Authorization': `Bearer ${carbonetesStore.user.auth.token}`
      },
      params: {
        registryUri : image.registry,
        repo        : imageName,
        tag         : imageTag
      }
    }).then(response => {
      const result      = response.data;
      const newAnalyses = carbonetesStore.analyses.filter((analysis) => (analysis.result.imageDigest !== result.imageDigest || analysis.deployment.metadata.uid !== object.metadata.uid));    

      newAnalyses.push({
        deployment  : object,
        result      : result,
        isAnalyzing : false,
        isAnalyzed  : true
      });

      carbonetesStore.analysis.deployment   = object;
      carbonetesStore.analysis.result       = result;
      carbonetesStore.analysis.isAnalyzed   = true;
      carbonetesStore.analysis.isAnalyzing  = false;
      carbonetesStore.analyses              = newAnalyses;
    }).catch(error => {
      carbonetesStore.resetAnalysis();
    });
  }

  // Fetches analysis result in Carbonetes API
  getAnalysisResult =  (param: {}) => {
    const { deployment, carbonetesStore } = this.props;
    const { object } = deployment;

    request.getAnalysisResult({
      ...param
    }).then(response => {
      const result      = response.data
      const newAnalyses = carbonetesStore.analyses.filter((analysis) => (analysis.result.imageDigest !== result.imageDigest || analysis.deployment.metadata.uid !== object.metadata.uid));

      newAnalyses.push({
        deployment  : object,
        result      : result,
        isAnalyzing : false,
        isAnalyzed  : true
      })

      carbonetesStore.analysis.result     = result;
      carbonetesStore.analysis.isAnalyzed = true;
      carbonetesStore.analyses            = newAnalyses;

    }).catch(error => {
      
    }).finally(() => {
      carbonetesStore.analysis.isAnalyzing = false;
    });
  }

  // Analyzes image using Carbonetes API
  analyzeImage = () => {
    const { deployment, carbonetesStore } = this.props;
    const { object } = deployment;

    const image       = this.getImage(object);    
    const newAnalyses = carbonetesStore.analyses.filter((analysis) => analysis.deployment.metadata.uid !== object.metadata.uid);    

    newAnalyses.push({
      deployment  : object,
      result      : {},
      isAnalyzing : true,
      isAnalyzed  : false
    });

    carbonetesStore.analysis.deployment   = object;
    carbonetesStore.analysis.result       = {};
    carbonetesStore.analysis.isAnalyzing  = true;
    carbonetesStore.analysis.isAnalyzed   = false;
    carbonetesStore.analyses              = newAnalyses;

    request.analyzeImage({
      registryUri       : image.registry,
      repoImageTag      : image.name,
      username          : carbonetesStore.user.email,
      password          : carbonetesStore.user.password,
      timeout           : 500,
      policyBundleUUID  : ''
    }).then(response => {
      const analysisParam = {
        auth              : response.data.auth,
        companyRegistryId : response.data.companyRegistryId,
        repoImageId       : response.data.repoImageId
      }

      this.getAnalysisResult(analysisParam);
    }).catch(error => {
    });
  }

  render() {
    const { deployment, carbonetesStore } = this.props;
    const { object } = deployment;
    const image = this.getImage(object);

    if (NAMESPACES.includes(object.metadata.namespace) || !carbonetesStore.enabled) {
      return(
        <></>
      )
    } else {
      return (
        <div>
          <Component.DrawerTitle title="Image" />
          <Component.DrawerItem name="Registry">
            {image.registry}
          </Component.DrawerItem>
          <Component.DrawerItem name="Image">
            {image.name}
          </Component.DrawerItem>
          <Component.DrawerItem name="Analyzed At">
            {
              carbonetesStore.analysis.result && carbonetesStore.analysis.result.imageAnalysisLatest ? 
                carbonetesStore.analysis.result.imageAnalysisLatest.analyzed_at
              :
                <p>_</p>
            }
          </Component.DrawerItem>
          <Component.Button
            label='Analyze'
            onClick={this.analyzeImage}
            primary
            waiting={carbonetesStore.analysis.isAnalyzing}
            disabled={carbonetesStore.analysis.isAnalyzing || carbonetesStore.analysis.isAnalyzed}
          />
          <CompleteAnalysis analysis={carbonetesStore.analysis} isAnalyzing={carbonetesStore.analysis.isAnalyzing}/>
          <PolicyEvaluation analysis={carbonetesStore.analysis} />
          
          <Vulnerabilities vulnerabilities={
            carbonetesStore.analysis.result && carbonetesStore.analysis.result.imageAnalysisLatest ? 
              carbonetesStore.analysis.result.imageAnalysisLatest.vulnerabilities
            : 
              []
          } />
        </div>
      )
    }
  }
}