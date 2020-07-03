// Tried https://github.com/JedWatson/react-codemirror first, but because of numerous small issues,
// such as https://github.com/JedWatson/react-codemirror/issues/110 and
// https://github.com/JedWatson/react-codemirror/issues/47 which is the root cause, which hasn't been
// addressed in a long time, it was easier to just create this component.
import * as React from 'react';
import CodeMirrorInstance from 'codemirror';
import "codemirror/lib/codemirror.css";
import 'codemirror-one-dark-theme/one-dark.css';
require('codemirror/mode/clike/clike');

export interface CodeMirrorProps {
  options?: CodeMirrorInstance.EditorConfiguration;
  value?: string;
  onChange?: (newValue: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  className?: string;
}

export class CodeMirror extends React.Component<CodeMirrorProps, {}> {
  componentDidMount() {
    if (!this.container) {
      return;
    }
    const cm = CodeMirrorInstance(this.container, { value: this.props.value || '', ...this.props.options });
    cm.on('change', this.handleChange);
    cm.on('keydown', this.handleKeyDown as any);
    this.codeMirror = cm;
  }
  componentWillReceiveProps(nextProps: CodeMirrorProps) {
    const val = nextProps.value || '';
    if (this.codeMirror && this.codeMirror.getValue() !== val) {
      this.codeMirror.setValue(val);
    }
  }
  handleChange = (cm: CodeMirrorInstance.Editor) => {
    if (this.props.onChange) {
      this.props.onChange(cm.getValue());
    }
  }
  handleKeyDown = (cm: CodeMirrorInstance.Editor, event: KeyboardEvent) => {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }
  }
  container: HTMLDivElement | null = null;
  codeMirror: CodeMirrorInstance.Editor | undefined;
  shouldComponentUpdate(nextProps: CodeMirrorProps) {
    return nextProps.className !== this.props.className;
  }
  render() {
    return <div className={this.props.className} ref={e => this.container = e} />;
  }
}
