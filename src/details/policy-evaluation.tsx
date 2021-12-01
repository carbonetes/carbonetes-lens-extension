import { Renderer } from "@k8slens/extensions";
import React from "react";
import "./carbonetes-details.scss";
import { getStatusStyle } from '../utils/helper';
import { AnalysisModel } from '../preferences/carbonetes-preference-store';

const { Component } = Renderer;

type Props = {
  analysis: AnalysisModel
  isAnalyzing: boolean
}

class PolicyEvaluation extends React.PureComponent<Props> {

  // Get the total per Policy Evaluation Action (Go, Warn, Stop)
  getPolicyEvaluationSummary = (results : []) => {
    let go    = 0, 
        warn  = 0, 
        stop  = 0;

    results.forEach((result: any) => {
      const action = result.gateAction;

      switch (action) {
        case 'GO': 
          go++;
          break;
        case 'WARN':
          warn++;
          break;
        case 'STOP': 
          stop++;
          break;
      }
    });

    return {
      go,
      warn,
      stop
    };
  }

  render() {
    const { analysis, isAnalyzing } = this.props;
    const { isAnalyzed } = analysis;

    let policyEvaluation: any = {}
    if (isAnalyzed && (analysis.result && analysis.result.repoImageEnvironments && analysis.result.repoImageEnvironments.length > 0)) {
      policyEvaluation = {
        ...analysis.result.repoImageEnvironments[0],
        policyEvaluationSummary : this.getPolicyEvaluationSummary(analysis.result.repoImageEnvironments[0].policyEvaluationLatest.policyEvaluationResults)
      }
    }
    
    return (
      <>
        <Component.DrawerTitle title="Policy Evaluation" />
        <Component.DrawerItem name="Environment">
          {
            (policyEvaluation && policyEvaluation.environment) ? 
              policyEvaluation.environment
            :
            isAnalyzing ?
              <Component.Spinner/>
            :
              <p>_</p>
          }
        </Component.DrawerItem>
        <Component.DrawerItem name="Policy Bundle">
          {
            (policyEvaluation && policyEvaluation.policyBundle) ? 
              policyEvaluation.policyBundle.name
            :
            isAnalyzing ?
            <Component.Spinner/>
            :
              <p>_</p>
          }
        </Component.DrawerItem>
        <Component.DrawerItem name="Policy Result">
        {
            (policyEvaluation && policyEvaluation.policyEvaluationLatest) ? 
              <Component.Badge
                label={policyEvaluation.policyEvaluationLatest.policyResult}
                className={`whiteText ${getStatusStyle(policyEvaluation.policyEvaluationLatest.policyResult)}`}
                tooltip={(
                  <>
                  </>  
                )}
              />
            :
            isAnalyzing ?
            <Component.Spinner/>
            :
              <p>_</p>
          }
        </Component.DrawerItem>
        <Component.DrawerItem name="Final Action">
          {
            (policyEvaluation && policyEvaluation.policyEvaluationLatest) ? 
              <Component.Badge
                label={policyEvaluation.policyEvaluationLatest.finalAction}
                className={`whiteText ${getStatusStyle(policyEvaluation.policyEvaluationLatest.finalAction)}`}
                tooltip={(
                  <>
                  </>  
                )}
              />
            :
            isAnalyzing ?
            <Component.Spinner/>
            :
              <p>_</p>
          }
        </Component.DrawerItem>
        <Component.DrawerItem name="Evaluation">
          {
            (policyEvaluation && policyEvaluation.policyEvaluationSummary) ?
              <div className="flex gaps">
                {
                  Object.keys(policyEvaluation.policyEvaluationSummary).map((key: string) => {
                    return (
                      <Component.Badge
                        key={key}
                        label={policyEvaluation.policyEvaluationSummary[key]}
                        className={`whiteText ${getStatusStyle(key)}`}
                        tooltip={(
                          <>
                            <p><b>Evaluation</b></p>
                            <ul>
                              <li>Go - <b>{policyEvaluation.policyEvaluationSummary.go}</b></li>
                              <li>Warn - <b>{policyEvaluation.policyEvaluationSummary.warn}</b></li>
                              <li>Stop - <b>{policyEvaluation.policyEvaluationSummary.stop}</b></li>
                            </ul>  
                          </>
                        )}
                      />
                    )
                  })
                }
              </div>
            :
            isAnalyzing ?
            <Component.Spinner/>
            :
              <p>_</p>
          }
        </Component.DrawerItem>
      </>
    )
  }
}

export default PolicyEvaluation;