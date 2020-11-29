import { Button } from 'react-bootstrap';
const { Component } = require('react');

class MarkdownReader extends Component {
  constructor(props) {
    super(props);
    this.dom = [];
    let buffer = '';
    let is_text = true;
    for (const ch of this.props.value) {
      if (ch === '<' && is_text) {
        this.dom.push(buffer);
        buffer = '';
        is_text = false;
      } else if (ch === '>' && !is_text) {
        this.dom.push(
          <Button variant='outline-dark' size='sm' className='p-0'>
            {buffer}
          </Button>
        );
        buffer = '';
        is_text = true;
      } else if (ch === '\n' && is_text) {
        this.dom.push(buffer);
        this.dom.push(<br />);
        buffer = '';
      } else buffer += ch;
    }
  }

  render() {
    return <>{this.dom}</>;
  }
}

export { MarkdownReader };
