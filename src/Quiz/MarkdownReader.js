import { Button } from 'react-bootstrap';
import { Component, createRef } from 'react';

const isNumber = (ch) => {
  const Numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return Numbers.findIndex((sign) => sign === ch) !== -1;
};
const isHeaderSign = (ch) => {
  const HeaderSigns = ['+', '*'];
  return HeaderSigns.findIndex((sign) => sign === ch) !== -1;
};
class FlipButton extends Component {
  render() {
    return (
      <Button
        as='p'
        size='sm'
        style={Object.assign(
          { boxShadow: 'none', borderColor: '#CCCCCC' },
          this.props.style
        )}
        className={
          'align-self-center p-0 m-0 bg-white ' +
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

  isSolved() {
    return this.props.user_value === this.props.value;
  }

  render() {
    return (
      <Button
        as='p'
        ref={this.props.ParentState.blank_ref_set[this.props.idx]}
        variant={this.isSolved() ? 'outline-success' : 'outline-danger'}
        size='sm'
        style={Object.assign({ boxShadow: 'none' }, this.props.style)}
        className={`align-self-center p-0 m-0 ${
          this.props.user_value !== this.props.value
            ? 'text-danger'
            : 'text-success'
        } ${this.props.selected ? 'bg-warning focus' : 'bg-white'}`}
        onClick={() => {
          this.props.setCursor(this.props.idx);
        }}
        children={
          this.isSolved()
            ? this.props.value
            : this.formatAnswer(this.props.value)
        }
      />
    );
  }
}

const CONTENT_TYPE = {
  TEXT: 0,
  BLANK: 1,
  TABLE: 2,
  BR: 3,
};

class MarkdownReaderV2 extends Component {
  constructor(props) {
    super(props);
    this.state = { content_array: [], blank_ref_set: {}, prev_cursor: 0 };
  }

  hideAll() {
    const content_array = Array.from(this.state.content_array);
    for (const idx in content_array) {
      if (content_array[idx].type === CONTENT_TYPE.BLANK)
        content_array[idx].hide = true;
    }
    this.setState({ content_array: content_array });
  }

  parseStyleSign(value, style) {
    const text = value.split('');
    const styled_text_array = [];
    let buffer = '';
    let option_italic = false;
    let option_bold = false;
    let option_underline = false;
    let option_del = false;

    const flushBuffer = () => {
      styled_text_array.push({
        options: {
          italic: option_italic,
          bold: option_bold,
          underline: option_underline,
          del: option_del,
        },
        value: buffer,
      });
      buffer = '';
    };

    for (const ch of text) {
      if (ch === '#') {
        flushBuffer();
        option_bold = !option_bold;
        option_underline = !option_underline;
      } else if (ch === '@') {
        flushBuffer();
        option_bold = !option_bold;
      } else if (ch === '\\') {
        flushBuffer();
        option_italic = !option_italic;
      } else if (ch === '_') {
        flushBuffer();
        option_underline = !option_underline;
      } else if (ch === ';') {
        flushBuffer();
        option_del = !option_del;
      } else buffer += ch;
    }
    if (buffer.length > 0) flushBuffer();

    return (
      <div className='d-flex' style={style}>
        {styled_text_array.map((styled_text) => {
          let result = <p children={styled_text.value} className='m-0' />;
          if (styled_text.options.italic === true)
            result = <em children={result} />;
          if (styled_text.options.bold === true)
            result = <strong children={result} />;
          if (styled_text.options.underline === true)
            result = <u children={result} />;
          if (styled_text.options.del === true)
            result = <del children={result} />;

          return result;
        })}
      </div>
    );
  }

  buildJSX(idx, content) {
    switch (content.type) {
      case CONTENT_TYPE.TEXT:
        if (isNumber(content.value[0]) || isHeaderSign(content.value[0])) {
          return (
            <p
              key={idx}
              className='font-weight-bold mb-0'
              style={{
                fontSize: `${content.fontSize_rem}rem`,
              }}
            >
              {this.parseStyleSign(content.value)}
            </p>
          );
        } else {
          return (
            <span
              key={idx}
              className='align-self-start'
              children={this.parseStyleSign(content.value)}
              style={{
                fontSize: `${content.fontSize_rem}rem`,
              }}
            />
          );
        }
      case CONTENT_TYPE.BR:
        return (
          <div
            key={idx}
            className='mr-auto'
            style={{
              width: 'calc(100vw - 6.5rem)',
              marginBottom: `${content.size}rem`,
            }}
          />
        );
      case CONTENT_TYPE.BLANK:
        if (this.props.quiz_mode !== true) {
          return (
            <FlipButton
              key={idx}
              idx={idx}
              ParentState={this.state}
              setParentState={(e) => this.setState(e)}
              value={content.value}
              style={{
                fontSize: `${content.fontSize_rem}rem`,
              }}
            />
          );
        } else {
          return (
            <QuizButton
              idx={idx}
              ParentState={this.state}
              setParentState={(e) => this.setState(e)}
              value={content.value}
              user_value={this.props.quiz_data[idx].user_value}
              selected={idx === this.props.quiz_data.cursor}
              setCursor={(idx) => {
                const quiz_data = this.props.quiz_data;
                quiz_data.cursor = idx;
                this.props.setParentState({
                  quiz_data: quiz_data,
                });
                this.props.onUpdateRealAnswer();
              }}
              style={{
                fontSize: `${content.fontSize_rem}rem`,
              }}
            />
          );
        }
      case CONTENT_TYPE.TABLE: {
        return (
          <table>
            {content.value.split('\n').map((row) => {
              return (
                <tr>
                  {row.split('|').map((block) => {
                    console.log(block, block[0] === ':');
                    if (block[0] === ':') {
                      return (
                        <td
                          className='border'
                          style={{ whiteSpace: 'nowrap' }}
                          children={this.parseStyleSign(block.substr(1), {
                            justifyContent: 'left',
                          })}
                        />
                      );
                    } else if (block[0] === ';') {
                      return (
                        <td
                          className='border'
                          style={{ whiteSpace: 'nowrap' }}
                          children={this.parseStyleSign(block.substr(1), {
                            justifyContent: 'right',
                          })}
                        />
                      );
                    } else
                      return (
                        <td
                          className='border'
                          style={{ whiteSpace: 'nowrap' }}
                          children={this.parseStyleSign(block, {
                            justifyContent: 'center',
                          })}
                        />
                      );
                  })}
                </tr>
              );
            })}
          </table>
        );
      }
      default:
        return <p key={idx} children={`Unknown type code ${content.type}`} />;
    }
  }

  update_content_array() {
    const LEX = {
      TEXT: 0,
      BLANK: 1,
      TABLE: 2,
      LINE_BREAK: 3,
    };
    let content_array = [];
    let quiz_data = { cursor: null };
    let blank_ref_set = {};
    let buffer = '';
    let lex = LEX.TEXT;
    let idx = 0;
    let start_of_line = true;
    let fontSize_rem = 1;
    let line_value = '';

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
        start_of_line: start_of_line,
        fontSize_rem: fontSize_rem,
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
          setLex(LEX.LINE_BREAK);
          break;
        case '{':
          if (hasBuffer) append_text(popBuffer());
          setLex(LEX.TABLE);
          break;

        default:
          if (ch !== '\\') buffer += ch;
      }
    };

    const lex_blank = (ch, hasBuffer) => {
      switch (ch) {
        case '>':
          if (hasBuffer) {
            const value = popBuffer();
            if (this.props.quiz_mode === true) {
              if (quiz_data.cursor === null) quiz_data.cursor = idx;
              quiz_data[idx] = {
                user_value: '',
                value: value,
              };
              blank_ref_set[idx] = createRef();
            }

            content_array.push({
              idx: idx++,
              type: CONTENT_TYPE.BLANK,
              fontSize_rem: fontSize_rem,
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

    const lex_line_break = (ch, hasBuffer) => {
      switch (ch) {
        case '\n':
          buffer += ch;
          break;

        default:
          content_array.push({
            idx: idx++,
            type: CONTENT_TYPE.BR,
            size: buffer.length,
          });
          buffer = '';
          if (ch === '{') setLex(LEX.TABLE);
          else setLex(LEX.TEXT);
      }
    };

    const lex_table = (ch, hasBuffer) => {
      switch (ch) {
        case '}':
          content_array.push({
            idx: idx++,
            type: CONTENT_TYPE.TABLE,
            value: buffer,
          });
          buffer = '';
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
      else if (lex === LEX.LINE_BREAK) lex_line_break(ch, hasBuffer);
      else if (lex === LEX.TABLE) lex_table(ch, hasBuffer);

      if (ch === '\n') {
        start_of_line = true;
        line_value = '';
        fontSize_rem = 1;
      } else {
        start_of_line = false;
        line_value += buffer;
        const length = line_value.length;
        let startingTab = 0;
        let startingNonWhitespace = '';
        for (let x = 0; x < 7 && x < length; ++x) {
          if (line_value[x] === ' ') startingTab += 1;
          else {
            startingNonWhitespace = line_value[x];
            break;
          }
        }
        if (startingTab <= 1) {
          let factor = startingTab;
          if (
            startingTab === 0 &&
            (isHeaderSign(startingNonWhitespace) ||
              startingNonWhitespace === '-')
          ) {
            factor = 1;
          }
          fontSize_rem = 1.5 - (factor / 1.25) * 0.5;
        } else fontSize_rem = 1;
      }
    }
    if (buffer.length > 0) append_text(popBuffer());

    if (this.props.quiz_mode === true) {
      quiz_data.finished = true;
      this.props.setParentState({ quiz_data: quiz_data }, () =>
        this.props.onUpdateRealAnswer()
      );
      this.setState({
        content_array: Array.from(content_array),
        blank_ref_set: blank_ref_set,
      });
    } else {
      this.setState({
        content_array: Array.from(content_array),
      });
    }
  }

  isSolved(blank) {
    return blank.value === blank.user_value;
  }

  nextQuiz() {
    const keys = Object.keys(this.props.quiz_data).filter(
      (k) => k !== 'cursor'
    );
    const start_idx = keys.findIndex((k) => {
      return parseInt(k) === this.props.quiz_data.cursor;
    });
    if (start_idx === -1) {
      return false;
    }
    const ffind = keys.findIndex(
      (k, idx) => idx > start_idx && !this.isSolved(this.props.quiz_data[k])
    );
    const bfind = keys.findIndex(
      (k, idx) => idx < start_idx && !this.isSolved(this.props.quiz_data[k])
    );
    const quiz_data = this.props.quiz_data;
    if (ffind !== -1) {
      quiz_data.cursor = parseInt(keys[ffind]);
      this.props.setParentState({ quiz_data: quiz_data }, () =>
        this.props.onUpdateRealAnswer()
      );

      return true;
    } else if (bfind !== -1) {
      quiz_data.cursor = parseInt(keys[bfind]);
      this.props.setParentState({ quiz_data: quiz_data }, () =>
        this.props.onUpdateRealAnswer()
      );

      return true;
    }
    return false;
  }

  resetQuiz() {
    const quiz_data = this.props.quiz_data;
    quiz_data.cursor = null;
    this.state.content_array.forEach((content, idx) => {
      if (content.type === CONTENT_TYPE.BLANK) {
        if (quiz_data.cursor === null) quiz_data.cursor = idx;
        quiz_data[idx] = {
          user_value: '',
          value: content.value,
        };
      }
    });
    this.props.setParentState({ quiz_data: quiz_data });
    this.props.onUpdateRealAnswer();
  }

  componentDidMount() {
    this.update_content_array();
  }

  componentDidUpdate(prevProps, prevState, sanpshot) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.update_content_array();
    }

    if (
      prevProps.quiz_data !== undefined &&
      this.state.prev_cursor !== this.props.quiz_data.cursor
    ) {
      this.state.blank_ref_set[
        this.props.quiz_data.cursor
      ].current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      this.setState({ prev_cursor: this.props.quiz_data.cursor });
    }
  }

  render() {
    return (
      (this.props.quiz_mode !== true ||
        this.props.quiz_data.finished === true) && (
        <div
          className={
            'px-3 py-2 border rounded w-100 text-left d-flex flex-row flex-wrap align-content-start ' +
            (this.props.className || '')
          }
          style={Object.assign(
            { whiteSpace: 'break-spaces' },
            this.props.style
          )}
        >
          {this.state.content_array.map((content, idx) =>
            this.buildJSX(idx, content)
          )}
        </div>
      )
    );
  }
}

export { MarkdownReaderV2 };
