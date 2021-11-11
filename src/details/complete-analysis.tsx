import { Component } from "@k8slens/extensions";
import React from "react";
import "./carbonetes-details.scss";
import { getSeverityStyle } from '../utils/helper';
import { AnalysisModel } from '../preferences/carbonetes-preference-store';

type Props = {
  analysis: AnalysisModel,
  isAnalyzing: boolean
}

class CompleteAnalysis extends React.PureComponent<Props> {

  // Creates analysis object for table's row
  createAnalysis = (analyzer: string, summary: any): any => {
    const analysis = {
      analyzer, 
      summary 
    }

    return analysis
  }

  // Creates analyses based from response of getAnalysisResult API
  createAnalyses = (result: any) => {

    let analyses;
    if (result) {
      // Image Analysis
      const imageAnalysis           = result.imageAnalysisLatest;
      const imageAnalysisSummary    = imageAnalysis ? this.getVulnerabilitySummary(imageAnalysis.vulnerabilities) : null;

      // Software Composition Analysis
      const scAnalysis              = result.scaLatest;
      const scAnalysisSummary       = scAnalysis ? scAnalysis.analysis : null;

      // // Malware Analysis
      const malwareAnalysis         = result.malwareAnalysisLatest;
      const malwareAnalysisSummary  = malwareAnalysis ? malwareAnalysis.scanResult : null;

      // License Finder
      const licenseFinder           = result.licenseFinderLatest;
      const licenseFinderSummary    = licenseFinder ? licenseFinder.imageDependencies.flatMap((dependency: any) => dependency.licenses).flatMap((license: any) => license.licenseName).filter((v: any, i: any, a: any) => a.indexOf(v) === i) : null;

      // Secret Analysis
      const secretAnalysis          = result.secretAnalysisLatest;
      const secretAnalysisSummary   = secretAnalysis ? secretAnalysis.secrets : null;

      // Bill of Materials
      const bomAnalysis             = result.billOfMaterialsAnalysisLatest;
      const bomAnalysisSummary      = bomAnalysis ? bomAnalysis.artifacts : null;

      analyses = [
        this.createAnalysis('Vulnerability', imageAnalysisSummary),
        this.createAnalysis('Software Composition', scAnalysisSummary),
        this.createAnalysis('Malware', malwareAnalysisSummary),
        this.createAnalysis('License', licenseFinderSummary),
        this.createAnalysis('Secrets', secretAnalysisSummary),
        this.createAnalysis('Bill Of Materials', bomAnalysisSummary)    
      ];
    } else {
      analyses = [
        this.createAnalysis('Vulnerability', null),
        this.createAnalysis('Software Composition', null),
        this.createAnalysis('Malware', null),
        this.createAnalysis('License', null),
        this.createAnalysis('Secrets', null),
        this.createAnalysis('Bill Of Materials', null)    
      ];
    }

    return analyses;
  }

  // Get the total per Image Vulnerability (Critical, High, Medium, Low, Negligible, Unknown)
  getVulnerabilitySummary = (vulnerabilities : []) => {
    let critical    = 0, 
        high        = 0, 
        medium      = 0, 
        low         = 0, 
        negligible  = 0, 
        unknown     = 0;

    vulnerabilities.forEach((vulnerability: any) => {
      const severity = vulnerability.severity.toLowerCase();

      switch (severity) {
        case 'critical': 
          critical++;
          break;
        case 'high':
          high++;
          break;
        case 'medium': 
          medium++;
          break;
        case 'low': 
          low++
          break;
        case 'negligible': 
          negligible++
          break;
        default:
          unknown++
          break;
      }
    });

    return {
      critical,
      high,
      medium,
      low,
      negligible,
      unknown,
    };
  }

  renderSummary = (analysis: any) => {
    const summary = analysis.summary;
    let component: any[] = [];
    
    if (!summary) {
      component.push(<p>_</p>)
    } else if (analysis.analyzer === 'Vulnerability' || analysis.analyzer === 'Software Composition') {
      let severity = summary;
      if (analysis.analyzer === 'Software Composition') {
        const { critical, high, medium, low } = summary

        severity = {
          critical,
          high,
          medium,
          low
        }
      }

      Object.keys(severity).map((key) => {
        if ((severity[key] != 0 || severity[key] != '')) {
          component.push(
            <Component.Badge
              key={key}
              label={severity[key]}
              className={`whiteText ${getSeverityStyle(key)}`}
              tooltip={(
                <>
                  {
                    analysis.analyzer === 'Software Composition' &&
                     <>
                      <p>{`Total Dependencies: `}<b>{summary.totalDependency}</b></p>
                      <p>{`Vulnerable Dependencies: `}<b>{summary.vulnerableDependency}</b></p>
                      <p>{`Vulnerabilities Found: `}<b>{summary.vulnerabilityFound}</b></p>
                      <hr/>
                     </>
                  }
                  <p><b>Severities</b></p>
                  <ul>
                    <li>Critical - <b>{severity.critical}</b></li>
                    <li>High - <b>{severity.high}</b></li>
                    <li>Medium - <b>{severity.medium}</b></li>
                    <li>Low - <b>{severity.low}</b></li>
                    {
                      analysis.analyzer === 'Vulnerability' &&
                        <>
                          <li>Negligible - <b>{severity.negligible}</b></li>
                          <li>Unknown - <b>{severity.unknown}</b></li>
                        </>
                    }
                  </ul>  
                </>
              )}
            />
          )
        }
      })

      component.length === 0 && component.push(<p>No vulnerabilities found</p>);
    } else if (analysis.analyzer === 'Malware') {
      const malwareCount = analysis.summary.infectedFiles.length;
      const noun = malwareCount > 1 ? 'threats' : 'threat';

      if (malwareCount > 0) {
        component.push(
          <Component.Badge
            label={`${malwareCount} ${noun} found`}
            className={malwareCount > 0 && 'threat'}
            tooltip={(
              <ul>
                <p><b>Threats</b></p>
                  <table>
                    <tr>
                      <th>File</th>
                      <th>Virus</th>
                    </tr>
                    {
                      analysis.summary.infectedFiles.map((infectedFile: any) => 
                        <tr>
                          <td>{infectedFile.file_name}</td>
                          <td>{infectedFile.virus}</td>
                        </tr>
                      )
                    }
                  </table>
              </ul>  
            )}
          />
        )
      } else {
        component.push(<p className="noThreats">No threats found</p>);
      }
    } else if (analysis.analyzer === 'License') {
      const licenseCount = analysis.summary.length;
      const noun = licenseCount > 1 ? 'licenses' : 'license';

      if (licenseCount > 0) {
        component.push(
          <Component.Badge
            label={`${licenseCount} ${noun} found`}
            className={licenseCount > 0 && 'license'}
            tooltip={(
              <ul>
                <p><b>Licenses</b></p>
                {
                  analysis.summary.map((license: any) => 
                    <li>{license}</li>
                  )
                }
              </ul>  
            )}
          />
        )
      } else {
        component.push(<p>No licenses found</p>);
      }
    } else if (analysis.analyzer === 'Secrets') {
      const secretsCount = analysis.summary.length;
      if (secretsCount > 0) {
        const noun = secretsCount > 1 ? 'secrets' : 'secret';
        component.push(
          <Component.Badge
            label={`${secretsCount} ${noun} found`}
          />
        )
      } 
      else {
        component.push(<p>No secrets found</p>);
      }
      component.length === 0 && component.push(<p>No secrets found</p>);
    } else if (analysis.analyzer === 'Bill Of Materials') {
      const artifactsCount = analysis.summary.length;
      
      if (artifactsCount > 0) {
        const noun = artifactsCount > 1 ? 'artifacts' : 'artifact';
        const groupBy = (array: [], key: string) => {
          return array.reduce((result: any, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]]+1 || 1);
            return result;
          }, {});
        };
        const artifactCountByType = groupBy(analysis.summary, "type");
        component.push(
          <Component.Badge
            label={`${artifactsCount} ${noun} found`}
            className={artifactsCount > 0 && 'license'}
            tooltip={(
              <ul>
                <p><b>Artifact Types</b></p>
                {
                  Object.keys(artifactCountByType).map(key => 
                    <li>{key}: {artifactCountByType[key]}</li>
                  )
                }
              </ul>  
            )}
          />
        )
      } else {
        component.push(<p>No licenses found</p>);
      }
    }

    return component;
  }

  render() {
    const { analysis, isAnalyzing } = this.props;
    const { result } = analysis;

     const analyses = this.createAnalyses(result);

    return (
      <>
        <Component.DrawerTitle title="Complete Analysis" />
        <div className="PodDetailsList flex column">
          <Component.Table
            className="box grow"
            items={analyses}
            scrollable={false}
          >
            <Component.TableHead showTopLine={true}>
              <Component.TableCell>Analyzers</Component.TableCell>
              <Component.TableCell>Summary</Component.TableCell>
            </Component.TableHead>
            {
              analyses.map((analysis: any) => {
                return (
                  <Component.TableRow 
                    nowrap
                  >
                    <Component.TableCell>
                      {
                        analysis.analyzer
                      }
                    </Component.TableCell>
                    <Component.TableCell className={"flex gaps"}>
                      {
                        isAnalyzing ?
                          <Component.Spinner/>
                        :
                          this.renderSummary(analysis)
                      }
                    </Component.TableCell>
                  </Component.TableRow>
                )
              })
            }
          </Component.Table>
        </div>
      </>
    )
  }
}

export default CompleteAnalysis;