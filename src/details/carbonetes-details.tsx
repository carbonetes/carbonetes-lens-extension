import { Renderer } from "@k8slens/extensions";
import React from "react";
import moment from "moment";
import { CarbonetesStore } from "../preferences/carbonetes-preference-store";
import request from '../service/requests';
import PolicyEvaluation from './policy-evaluation';
import CompleteAnalysis from './complete-analysis';
import Vulnerabilities from './vulnerabilities';
import { 
  REGISTRY,
  IMAGE_NAME
} from '../utils/constants'
import "./carbonetes-details.scss";
import { observer } from "mobx-react";
import { getAnalysisStatus, getStatusStyle } from "../utils/helper";

export interface CarbonetesDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Deployment> {
}

type Props = {
  deployment : Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Deployment>
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
    const { deployment } = this.props;
    const { object } = deployment;
    const image = this.getImage(object);

    if (CarbonetesStore.getInstance().enabled && CarbonetesStore.getInstance().registries.find((registry: any) => registry.registryUri.includes(image.registry))) {
      this.getAnalysis();
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const { deployment } = this.props;
    const { object } = deployment;
    const image = this.getImage(object);

    // If Deployment metadata UID changes
    // Set initial state
    if (object.metadata.uid !== prevProps.deployment.object.metadata.uid) {
      if (CarbonetesStore.getInstance().enabled && CarbonetesStore.getInstance().registries.find((registry: any) => registry.registryUri.includes(image.registry))) {
          this.getAnalysis();
      }
    }
  }

  getAnalysis = () => {
    const { deployment } = this.props;
    const { object } = deployment;

    if(CarbonetesStore.getInstance().analyses == null){
      CarbonetesStore.getInstance().analyses = [];
      CarbonetesStore.getInstance().analysis = {
        deployment: {},
        result: {},
        isAnalyzing: false,
        isAnalyzed: false,
      };
      CarbonetesStore.getInstance().analysis.deployment = object;
      this.checkAnalysisResult();
      return
    }

    const currentAnalysis = CarbonetesStore.getInstance().analyses.filter((analysis: any) => analysis.deployment.metadata.uid === object.metadata.uid);
    if (currentAnalysis.length > 0) {
      const analyzed  = currentAnalysis.find((analysis: any) => analysis.isAnalyzed === true);
      const analyzing = currentAnalysis.find((analysis: any) => analysis.isAnalyzed === false);
      if (analyzed) {
        CarbonetesStore.getInstance().analysis = analyzed;
      } else {
        CarbonetesStore.getInstance().analysis = analyzing;
      }
    } else {
      CarbonetesStore.getInstance().analysis = {
        deployment: {},
        result: {},
        isAnalyzing: false,
        isAnalyzed: false,
      };
      CarbonetesStore.getInstance().analysis.deployment = object;
      this.checkAnalysisResult();
    }
  }

  // Get image registry and image tag from KubeObjectDetailsProps<Renderer.K8sApi.Deployment>
  getImage: any = (deployment: Renderer.K8sApi.Deployment, property: String = null) => {
    const containers = deployment.spec.template.spec.containers;

    let image = {
      registry: '',
      name: '',
    };

    if (containers.length > 0) {
      const imageArray = containers[0].image.split(/\/(.+)/);
      image.registry= imageArray[0];
      image.name    = imageArray[1];

      // containers.map((container) => {
      //   // Split the string that matches with the first '/'
      //   const imageArray = container.image.split(/\/(.+)/);
        
      //   image.registry= imageArray[0];
      //   image.name    = imageArray[1];
      // });
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
    const { deployment } = this.props;
    const { object } = deployment;

    const image     = this.getImage(object);
    const imageName = image.name.split(':')[0];
    const imageTag  = image.name.split(':')[1];

    const params = {
      registryUri       : image.registry,
      repoImageTag      : image.name,
      username          : CarbonetesStore.getInstance().user.email,
      password          : CarbonetesStore.getInstance().user.password,
      timeout           : 20000,
      policyBundleUUID  : ''
    }

    request.getAndReloadCompayRegistry({params}).then(response => {
      if (response.data) {
        CarbonetesStore.getInstance().analysis.isAnalyzing = true;

        request.checkAnalysisResult({
          // headers: {
          //   'Authorization': `Bearer ${CarbonetesStore.getInstance().user.auth.token}`
          // },
          params: {
            registryUri : image.registry,
            repo        : imageName,
            tag         : imageTag,
            username    : CarbonetesStore.getInstance().user.email,
            password    : CarbonetesStore.getInstance().user.password
          }
        }).then(response => {
          const result = response.data;

          CarbonetesStore.getInstance().analysis.deployment   = object;
          CarbonetesStore.getInstance().analysis.result       = result;
          CarbonetesStore.getInstance().analysis.isAnalyzed   = true;
          CarbonetesStore.getInstance().analysis.isAnalyzing  = false;

          const newAnalyses = CarbonetesStore.getInstance().analyses.filter((analysis) => (analysis.result.imageDigest !== result.imageDigest || analysis.deployment.metadata.uid !== object.metadata.uid));    
    
          newAnalyses.push({
            deployment  : object,
            result      : result,
            isAnalyzing : false,
            isAnalyzed  : true
          });
    
          CarbonetesStore.getInstance().analyses = newAnalyses;
        }).catch(error => {
          Renderer.Component.Notifications.error(
            <div>{error.response.data}.</div>
          )
          CarbonetesStore.getInstance().analysis = {
            deployment: {},
            result: {},
            isAnalyzing: false,
            isAnalyzed: false,
          };
        });
      }
    }).catch(error => {
      Renderer.Component.Notifications.error(
        <div>{error.response.data}.</div>
      )
    });
  }

  // Fetches analysis result in Carbonetes API
  getAnalysisResult =  (param: {}) => {
    const { deployment } = this.props;
    const { object } = deployment;

    request.getAnalysisResult({
      ...param
    }).then(response => {
      const result      = response.data
      const newAnalyses = CarbonetesStore.getInstance().analyses.filter((analysis) => (analysis.result.imageDigest !== result.imageDigest || analysis.deployment.metadata.uid !== object.metadata.uid));

      newAnalyses.push({
        deployment  : object,
        result      : result,
        isAnalyzing : false,
        isAnalyzed  : true
      })

      CarbonetesStore.getInstance().analysis.result     = result;
      CarbonetesStore.getInstance().analysis.isAnalyzed = true;
      CarbonetesStore.getInstance().analyses            = newAnalyses;

    }).catch(error => {
      Renderer.Component.Notifications.error(
        <div>{error.response.data}.</div>
      )
    }).finally(() => {
      CarbonetesStore.getInstance().analysis.isAnalyzing = false;
    });
  }

  // Analyzes image using Carbonetes API
  analyzeImage = () => {
    const { deployment } = this.props;
    const { object } = deployment;

    const image       = this.getImage(object);    
    const newAnalyses = CarbonetesStore.getInstance().analyses.filter((analysis) => analysis.deployment.metadata.uid !== object.metadata.uid);    

    newAnalyses.push({
      deployment  : object,
      result      : {},
      isAnalyzing : true,
      isAnalyzed  : false
    });

    CarbonetesStore.getInstance().analysis.deployment   = object;
    CarbonetesStore.getInstance().analysis.result       = {};
    CarbonetesStore.getInstance().analysis.isAnalyzing  = true;
    CarbonetesStore.getInstance().analysis.isAnalyzed   = false;
    // CarbonetesStore.getInstance().analyses              = newAnalyses;

    request.analyzeImage({
      registryUri       : image.registry,
      repoImageTag      : image.name,
      username          : CarbonetesStore.getInstance().user.email,
      password          : CarbonetesStore.getInstance().user.password,
      timeout           : 10000,
      policyBundleUUID  : ''
    }).then(response => {
      CarbonetesStore.getInstance().analyses = newAnalyses;

      this.getAnalysisResult(response.data);
    }).catch(error => {
      Renderer.Component.Notifications.error(
        <div>{error.response.data}.</div>
      )
      CarbonetesStore.getInstance().analysis = {
        deployment: {},
        result: {},
        isAnalyzing: false,
        isAnalyzed: false,
      };
    });
  }

  render() {
    const { deployment } = this.props;
    const { object } = deployment;
    const image = this.getImage(object);

    if (CarbonetesStore.getInstance().enabled && CarbonetesStore.getInstance().registries.find((registry: any) => registry.registryUri.includes(image.registry))) {
      if(!CarbonetesStore.getInstance().analysis){
        return (<p>No Analysis</p>)
      }
      return(
        <div>
          <Renderer.Component.DrawerTitle title="Image" />
          <Renderer.Component.DrawerItem name="Registry">
            {image.registry}
          </Renderer.Component.DrawerItem>
          <Renderer.Component.DrawerItem name="Image">
            {image.name}
          </Renderer.Component.DrawerItem>
          <Renderer.Component.DrawerItem name="Analyzed At">
            {  
              CarbonetesStore.getInstance().analysis.result && CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest ? 
                moment.unix(CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest.whenAdded).fromNow()
              :
                <p>_</p>
            }
          </Renderer.Component.DrawerItem>
          <Renderer.Component.DrawerItem name="Status">
            {
              CarbonetesStore.getInstance().analysis.result && CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest ? 
                <Renderer.Component.Badge
                  label={getAnalysisStatus(CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest.status)}
                  className={`whiteText ${getStatusStyle(CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest.status)}`}
                /> 
              :
                <p>_</p>
            }
          </Renderer.Component.DrawerItem>
          <Renderer.Component.Button
            label='Analyze'
            onClick={this.analyzeImage}
            primary
            waiting={CarbonetesStore.getInstance().analysis.isAnalyzing}
            disabled={CarbonetesStore.getInstance().analysis.isAnalyzed && (CarbonetesStore.getInstance().analysis.result && CarbonetesStore.getInstance().analysis.result.comprehensiveAnalysisLatest)}
          />
          <CompleteAnalysis analysis={CarbonetesStore.getInstance().analysis} isAnalyzing={CarbonetesStore.getInstance().analysis.isAnalyzing}/>
          <PolicyEvaluation analysis={CarbonetesStore.getInstance().analysis} isAnalyzing={CarbonetesStore.getInstance().analysis.isAnalyzing} />
          <Vulnerabilities 
            vulnerabilities={
              CarbonetesStore.getInstance().analysis.result && CarbonetesStore.getInstance().analysis.result.imageAnalysisLatest ? 
                CarbonetesStore.getInstance().analysis.result.imageAnalysisLatest.vulnerabilities
              : 
                []
            } 
          />
        </div>
      )
    } else {
      return (
        <></>
      )
    }
  }
}