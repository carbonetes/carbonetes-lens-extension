import { Component } from "@k8slens/extensions";
import React from "react";
import "./carbonetes-details.scss";
import { getSeverityStyle } from '../utils/helper';

type Props = {
  vulnerabilities: []
}

enum sortBy {
  vuln = "vuln",
  package_name = "package_name",
  severity = "severity",
  fix = "fix",
}

class Vulnerabilities extends React.PureComponent<Props> {

  private sortCallbacks = {
    [sortBy.vuln]: (vulnerability: any) => vulnerability.vuln,
    [sortBy.package_name]: (vulnerability: any) => vulnerability.package_name,
    [sortBy.severity]: (vulnerability: any) => vulnerability.severity,
    [sortBy.fix]: (vulnerability: any) => vulnerability.fix,
  };

  render() {
    const { vulnerabilities } = this.props;
    

    if (vulnerabilities.length === 0) {
      return(
        <></>
      )
    } else {
      return (
        <>
          <Component.DrawerTitle title="Vulnerabilities" />
          <div className="PodDetailsList flex column">
            <Component.Table
              className="box grow"
              items={vulnerabilities}
              sortable={this.sortCallbacks}
              sortByDefault={{ sortBy: sortBy.vuln, orderBy: "asc" }}
              sortSyncWithUrl={false}
            >
              <Component.TableHead showTopLine={true}>
                <Component.TableCell sortBy={sortBy.vuln}>ID</Component.TableCell>
                <Component.TableCell sortBy={sortBy.package_name}>Package Name</Component.TableCell>
                <Component.TableCell sortBy={sortBy.severity}>Severity</Component.TableCell>
                <Component.TableCell sortBy={sortBy.fix}>Fix</Component.TableCell>
              </Component.TableHead>
              {
                vulnerabilities.map((vulnerability: any) => {
                  return (
                    <Component.TableRow 
                      nowrap
                      sortItem={vulnerability}
                    >
                      <Component.TableCell>
                        <a href={vulnerability.url} target="_blank">{vulnerability.vuln}</a>
                      </Component.TableCell>
                      <Component.TableCell>
                        {
                          vulnerability.package_name ? 
                            vulnerability.package_name
                          :
                            '_'
                        }
                      </Component.TableCell>
                      <Component.TableCell>
                        <Component.Badge
                          label={vulnerability.severity}
                          className={`whiteText ${getSeverityStyle(vulnerability.severity)}`}
                        />
                      </Component.TableCell>
                      <Component.TableCell>
                        {
                          vulnerability.fix ? 
                            vulnerability.fix
                          :
                            '_'
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
}

export default Vulnerabilities;