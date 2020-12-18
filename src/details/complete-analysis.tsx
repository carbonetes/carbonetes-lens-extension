import { Component } from "@k8slens/extensions";
import React from "react";
import "./carbonetes-details.scss";
import { getAnalysisStatus, getSeverityStyle, getStatusStyle } from '../utils/helper';
import { AnalysisModel } from '../preferences/carbonetes-preference-store';

type Props = {
  analysis: AnalysisModel,
  isAnalyzing: boolean
}

class CompleteAnalysis extends React.PureComponent<Props> {

  // Creates analysis object for table's row
  createAnalysis = (analyzer: string, status: string, summary: any): any => {
    const analysis = {
      analyzer, 
      status, 
      summary 
    }

    return analysis
  }

  // Creates Initial Analyses with not_anaylzed status, specify status by adding param
  createInitialAnalyses = (status = 'not_analyzed') => {
    const analyses = [
      this.createAnalysis('Vulnerability', status, null),
      this.createAnalysis('Software Composition', status, null),
      this.createAnalysis('Malware', status, null),
      this.createAnalysis('License', status, null),
      this.createAnalysis('Secrets', status, null)
    ];

    return analyses;
  }

  // Creates analyses based from response of getAnalysisResult API
  createAnalyses = (result: any) => {
    const imageAnalysis         = result.imageAnalysisLatest;
    const imageAnalysisStatus   = imageAnalysis.engineA;
    const imageAnalysisSummary  = this.getVulnerabilitySummary(imageAnalysis.vulnerabilities);

    const scAnalysis        = result.scaLatest.analysis;
    const scAnalysisStatus  = scAnalysis.status;
    const scAnalysisSummary = scAnalysis;

    const malwareAnalysis         = result.malwareAnalysisLatest;
    const malwareAnalysisStatus   = malwareAnalysis.status;
    const malwareAnalysisSummary  = malwareAnalysis.scanResult;

    const licenseFinder         = result.licenseFinderLatest;
    const licenseFinderStatus   = licenseFinder.status;
    const licenseFinderSummary  = licenseFinder.imageDependencies;

    const secretAnalysis        = result.secretAnalysisLatest;
    const secretAnalysisStatus  = secretAnalysis.status;
    const secretAnalysisSummary = secretAnalysis.secrets;

    const analyses = [
      this.createAnalysis('Vulnerability', imageAnalysisStatus, imageAnalysisSummary),
      this.createAnalysis('Software Composition', scAnalysisStatus, scAnalysisSummary),
      this.createAnalysis('Malware', malwareAnalysisStatus, malwareAnalysisSummary),
      this.createAnalysis('License', licenseFinderStatus, licenseFinderSummary),
      this.createAnalysis('Secrets', secretAnalysisStatus, secretAnalysisSummary)
    ];

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
                  analysis.summary.map((imageDependency: any) => 
                    <li>{imageDependency.dependencyName}</li>
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

      component.length === 0 && component.push(<p>No secrets found</p>);
    }

    return component;
  }

  render() {
    const { analysis, isAnalyzing } = this.props;
    const { isAnalyzed, result } = analysis;

    let analyses = this.createInitialAnalyses();
    if (isAnalyzing) {
      analyses = this.createInitialAnalyses('analyzing');
    } else if (isAnalyzed) {
      analyses = this.createAnalyses(result);
    }

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
              <Component.TableCell>Status</Component.TableCell>
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
                    <Component.TableCell>
                      <Component.Badge
                        label={getAnalysisStatus(analysis.status)}
                        className={`whiteText ${getStatusStyle(analysis.status)}`}
                      />
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