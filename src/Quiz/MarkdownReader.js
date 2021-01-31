import { Button } from 'react-bootstrap';
import { Component } from 'react';

class FlipButton extends Component {
  render() {
    return (
      <Button
        as='div'
        variant='outline-dark'
        size='sm'
        style={{ boxShadow: 'none' }}
        className={
          'p-0 bg-white ' +
          (this.props.ParentState.content_array[this.props.idx].hide
            ? 'text-white'
            : 'text-dark')
        }
        onClick={() => {
          const content_array = this.props.ParentState.content_array;
          content_array[this.props.idx].hide = !content_array[this.props.idx]
            .hide;
          this.props.setParentState({
            content_array: content_array,
          });
        }}
        children={this.props.value}
      />
    );
  }
}

class QuizButton extends Component {
  formatAnswer() {
    let result = this.props.user_value;
    if (result === undefined) result = '';
    while (result.length < this.props.value.length)
      result += this.props.value[result.length] === ' ' ? '.' : '●';
    return result;
  }
  render() {
    return (
      <Button
        as='div'
        variant={
          this.props.user_value !== this.props.value
            ? 'outline-danger'
            : 'outline-success'
        }
        size='sm'
        style={{ boxShadow: 'none' }}
        className={`p-0 ${
          this.props.user_value !== this.props.value
            ? 'text-danger'
            : 'text-success'
        } ${this.props.selected ? 'bg-warning focus' : 'bg-white'}`}
        onClick={() => {
          const quiz_data = this.props.ParentState.quiz_data;
          quiz_data.cursor = this.props.idx;
          this.props.setParentState({
            quiz_data: quiz_data,
          });
        }}
        children={this.formatAnswer(this.props.value)}
      />
    );
  }
}

const CONTENT_TYPE = {
  TEXT: 0,
  BLANK: 1,
  TITLE: 2,
  BR: 3,
};

class MarkdownReaderV2 extends Component {
  constructor(props) {
    super(props);
    this.state = { content_array: [], quiz_data: {}, quiz_setup: false };
  }

  hideAll() {
    const content_array = Array.from(this.state.content_array);
    for (const idx in content_array) {
      if (content_array[idx].type === CONTENT_TYPE.BLANK)
        content_array[idx].hide = true;
    }
    this.setState({ content_array: content_array });
  }

  buildJSX(idx, content) {
    switch (content.type) {
      case CONTENT_TYPE.TEXT:
        return (
          <span
            key={idx}
            className='align-self-start'
            children={content.value}
          />
        );
      case CONTENT_TYPE.BR:
        return <br key={idx} />;
      case CONTENT_TYPE.BLANK:
        if (this.props.quiz_mode !== true) {
          return (
            <FlipButton
              key={idx}
              idx={idx}
              ParentState={this.state}
              setParentState={(e) => this.setState(e)}
              value={content.value}
            />
          );
        } else {
          return (
            <QuizButton
              key={idx}
              idx={idx}
              ParentState={this.state}
              setParentState={(e) => this.setState(e)}
              value={content.value}
              user_value={this.state.quiz_data[idx].user_value}
              selected={idx === this.state.quiz_data.cursor}
            />
          );
        }
      case CONTENT_TYPE.TITLE:
        return (
          <p key={idx} className='font-weight-bold mb-0'>
            <u>{content.value}</u>
          </p>
        );
      default:
        return <p key={idx} children={`Unknown type code ${content.type}`} />;
    }
  }

  update_content_array() {
    const LEX = {
      TEXT: 0,
      BLANK: 1,
      TITLE: 2,
    };
    let content_array = [];
    let quiz_data = { cursor: null };
    let buffer = '';
    let lex = LEX.TEXT;
    let idx = 0;

    function setLex(new_lex) {
      lex = new_lex;
    }
    function popBuffer() {
      const data = buffer;
      buffer = '';
      return data;
    }

    function append_text(text) {
      content_array.push({
        idx: idx++,
        type: CONTENT_TYPE.TEXT,
        value: text,
      });
    }

    const lex_text = (ch, hasBuffer) => {
      switch (ch) {
        case '<':
          if (hasBuffer) append_text(popBuffer());
          setLex(LEX.BLANK);
          break;

        case '\n':
          if (hasBuffer) append_text(popBuffer());
          content_array.push({
            idx: idx++,
            type: CONTENT_TYPE.BR,
          });
          break;

        case '*':
          if (!hasBuffer) setLex(LEX.TITLE);
          else buffer += ch;
          break;

        default:
          if (ch !== '\\') buffer += ch;
      }
    };

    const lex_blank = (ch, hasBuffer) => {
      switch (ch) {
        case '>':
          if (hasBuffer) {
            if (this.props.quiz_mode === true) {
              if (quiz_data.cursor === null) quiz_data.cursor = idx;
              quiz_data[idx] = {
                user_value: '',
              };
            }
            const value = popBuffer();
            content_array.push({
              idx: idx++,
              type: CONTENT_TYPE.BLANK,
              value: value,
              hide: false,
            });
          }
          setLex(LEX.TEXT);
          break;
        default:
          if (ch !== '\\') buffer += ch;
      }
    };

    const lex_title = (ch, hasBuffer) => {
      switch (ch) {
        case '\n':
          if (hasBuffer) {
            content_array.push({
              idx: idx - 1,
              type: CONTENT_TYPE.TITLE,
              value: popBuffer(),
            });
          }
          setLex(LEX.TEXT);
          break;

        default:
          buffer += ch;
      }
    };

    for (const ch of this.props.data) {
      const hasBuffer = buffer.length > 0;
      if (lex === LEX.TEXT) lex_text(ch, hasBuffer);
      else if (lex === LEX.BLANK) lex_blank(ch, hasBuffer);
      else if (lex === LEX.TITLE) lex_title(ch, hasBuffer);
    }
    if (buffer.length > 0) append_text(popBuffer());

    if (this.props.quiz_mode === true) {
      console.log(quiz_data);
      this.setState(
        {
          content_array: Array.from(content_array),
          quiz_data: quiz_data,
        },
        () => {
          this.setState({ quiz_setup: true });
        }
      );
    } else {
      this.setState({
        content_array: Array.from(content_array),
      });
    }
  }

  componentDidMount() {
    this.update_content_array();
  }

  componentDidUpdate(prevProps, prevState, sanpshot) {
    if (prevProps.data !== this.props.data) {
      this.update_content_array();
    }
  }

  render() {
    return (
      (this.props.quiz_mode !== true || this.state.quiz_setup === true) && (
        <div
          className={
            'px-3 py-2 border rounded w-100 text-left ' + this.props.className
          }
        >
          {console.log(
            'this.state.quiz_setup',
            this.state.quiz_setup,
            this.state.quiz_data
          )}
          {this.state.content_array.map((content, idx) =>
            this.buildJSX(idx, content)
          )}
        </div>
      )
    );
  }
}

export { MarkdownReaderV2 };
