export const getAnalysisStatus = (status: string) => {
  let analysisStatus: string;

  if (status === 'analyzed') {
    analysisStatus = 'Analyzed'
  } else if (status === 'waiting_for_analysis') {
    analysisStatus = 'Waiting for Analysis'
  } else if (status === 'analyzing') {
    analysisStatus = 'Analyzing'
  } else if (status === 'analysis_failed') {
    analysisStatus = 'Analysis Failed'
  } else if (status === 'not_analyzed') {
    analysisStatus = 'Not Analyzed'
  } else {
    analysisStatus = status;
  }
  
  return analysisStatus;
}

export const getSeverityStyle = (severity: string) => {
  let className: string;
  severity = severity.toLowerCase();

  if (severity === 'critical') {
    className = 'theme-critical';
  } else if (severity === 'high') {
    className = 'theme-high';
  } else if (severity === 'medium') {
    className = 'theme-medium';
  } else if (severity === 'low') {
    className = 'theme-low';
  } else if (severity === 'negligible') {
    className = 'theme-negligible';
  } else if (severity === 'unknown') {
    className = 'theme-unknown';
  }

  return className;
}

export const getStatusStyle = (status: string) => {
  let className: string;
  status = status.toLowerCase()
  
  if (status === 'analyzed' || status === 'PASSED' || status.toUpperCase() === 'GO') {
    className = 'theme-success';
  } else if (status === 'waiting_for_analysis' || status.toUpperCase() === 'WARN') {
    className = 'theme-warning';
  } else if (status === 'analyzing') {
    className = 'theme-info';
  } else if (status === 'analysis_failed' || status === 'FAILED' || status.toUpperCase() === 'STOP') {
    className = 'theme-error';
  } else {
    className = 'theme-neutral';
  }

  return className;
}

export const getValue = (isExists: boolean, value: any) => {

  return isExists ? value : '_';
}