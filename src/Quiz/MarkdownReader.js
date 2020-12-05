import { Button } from 'react-bootstrap';
import { Component, createRef } from 'react';

class FlipButton extends Component {
  constructor(props) {
    super(props);
    this.state = { hide: false };
  }

  render() {
    return (
      <Button
        variant='outline-dark'
        size='sm'
        className={'p-0 ' + (this.state.hide ? ' text-white' : '')}
        onClick={() => this.setState({ hide: !this.state.hide })}
      >
        {this.props.value}
      </Button>
    );
  }
}

class MarkdownReader extends Component {
  constructor(props) {
    super(props);
    this.dom = [];
    this.buttons = [];
    let buffer = '';
    let is_text = true;
    let idx = 0;
    for (const ch of this.props.value) {
      if (ch === '<' && is_text) {
        this.dom.push(buffer);
        buffer = '';
        is_text = false;
      } else if (ch === '>' && !is_text) {
        let ref = createRef();
        this.dom.push(<FlipButton key={idx} value={buffer} ref={ref} />);
        this.buttons.push(ref);
        buffer = '';
        is_text = true;
      } else if (ch === '\n' && is_text) {
        this.dom.push(buffer);
        this.dom.push(<br />);
        buffer = '';
      } else buffer += ch;
      idx += 1;
    }
    if (buffer.length > 0) this.dom.push(buffer);
  }

  hideAll() {
    for (const ref of this.buttons) {
      ref.current.setState({ hide: true });
    }
  }

  render() {
    return <>{this.dom}</>;
  }
}

export { MarkdownReader };
