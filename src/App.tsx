import React from 'react';
import { CodeMirror } from './CodeMirror';
import './App.css';
import { Plot, PlotLine } from './Plot';

function resultToPlotLines(result: any): PlotLine[] {
  if (!result) {
    return [];
  }
  if (Array.isArray(result)) {
    for (let i=0; i < result.length; i++) {
      if (typeof result[i] !== 'number') {
        return [];
      }
    }
    return [{ data: result, label: 'Data' }];
  } else if (typeof result === 'object') {
    let res: PlotLine[] = [];
    for (const key of Object.keys(result)) {
      res = [...res, ...resultToPlotLines(result[key]).map(x => ({...x, label: key }))];
    }
    return res;
  } else {
    return [];
  }
}

function App() {
  const [data, setData] = React.useState<PlotLine[]>([{ data: [3, 1, 2], label: 'Data' }]);
  const [source, setSource] = React.useState(`return [3, 1, 2];`);
  const [error, setError] = React.useState('');
  return (
    <div className="App">
      <div className="Left">
        <CodeMirror
          value={source}
          onChange={newSource => {
            setSource(newSource);
            let result;
            try {
              result = Function(newSource)();
            } catch (ex) {
              setError(ex.message);
              return;
            }
            setError('');
            setData(resultToPlotLines(result));
          }}
          options={{
            theme: 'one-dark',
            mode: 'javascript',
            lineNumbers: true
          }}
          />
      </div>
      <div className="Right">
        <Plot lines={data} />
        <div className="Error">{error}</div>
      </div>
      <div className="Header">
        jsplot by <a href="https://twitter.com/jfnoren">@jfnoren</a>. Code on <a href="https://github.com/FredrikNoren/jsplot">GitHub</a>. Find it useful? <a href="https://www.patreon.com/fredriknoren">Become a Patron!</a>
      </div>
    </div>
  );
}

export default App;
