import React from 'react';
import { CodeMirror } from './CodeMirror';
import './App.css';
import { Plot } from './Plot';

function App() {
  const [source, setSource] = React.useState(`return [];`);
  const [data, setData] = React.useState<number[]>([]);
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
            if (result && Array.isArray(result)) {
              setData(result);
            }
          }}
          options={{
            theme: 'one-dark',
            mode: 'clike',
            lineNumbers: true
          }}
          />
      </div>
      <div className="Right">
        <Plot lines={[{ data, label: 'Data' }]} />
        <div className="Error">{error}</div>
      </div>
      <div className="Header">
        jsplot by <a href="https://twitter.com/jfnoren">@jfnoren</a>. Code on <a href="https://github.com/FredrikNoren/jsplot">GitHub</a>. Find it useful? <a href="https://www.patreon.com/fredriknoren">Become a Patron!</a>
      </div>
    </div>
  );
}

export default App;
