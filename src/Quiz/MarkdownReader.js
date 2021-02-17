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
          (this.props.ParentState.blank_array[this.props.blank_array_idx].hide
            ? 'text-white'
            : 'text-dark')
        }
        onClick={() => {
          const blank_array = this.props.ParentState.blank_array;
          blank_array[this.props.blank_array_idx].hide = !blank_array[
            this.props.blank_array_idx
          ].hide;
          this.props.setParentState({
            blank_array: blank_array,
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
        ref={this.props.ParentState.blank_ref_set[this.props.blank_array_idx]}
        variant={this.isSolved() ? 'outline-success' : 'outline-danger'}
        size='sm'
        style={Object.assign({ boxShadow: 'none' }, this.props.style)}
        className={`align-self-center p-0 m-0 ${
          this.props.user_value !== this.props.value
            ? 'text-danger'
            : 'text-success'
        } ${this.props.selected ? 'bg-warning focus' : 'bg-white'}`}
        onClick={() => {
          this.props.setCursor(this.props.blank_array_idx);
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
    this.state = {
      content_array: [],
      blank_array: [],
      blank_ref_set: {},
      prev_cursor: 0,
    };

    this.content = undefined;
  }

  hideAll() {
    const blank_array = Array.from(this.state.blank_array);
    for (const idx in blank_array) {
      blank_array[idx].hide = true;
    }
    this.setState({ blank_array: blank_array });
  }

  parseStyleSign(
    value,
    lineHeight,
    style,
    blank_array_idx,
    set_blank_array_idx
  ) {
    const text = value.split('');
    const content_array = [];
    let buffer = '';
    let option_italic = false;
    let option_bold = false;
    let option_underline = false;
    let option_del = false;

    if (blank_array_idx === undefined && value.search('<') !== -1)
      throw blank_array_idx;

    const flushBuffer = (type) => {
      if (type === CONTENT_TYPE.TEXT) {
        content_array.push({
          options: {
            italic: option_italic,
            bold: option_bold,
            underline: option_underline,
            del: option_del,
          },
          value: buffer,
          type: type,
        });
      } else if (type === CONTENT_TYPE.BLANK) {
        content_array.push({
          value: buffer,
          type: type,
          fontSize_rem: lineHeight,
          blank_array_idx: blank_array_idx++,
        });
      } else {
        content_array.push({
          options: {
            italic: option_italic,
            bold: option_bold,
            underline: option_underline,
            del: option_del,
          },
          value: `Unknown type ${type}`,
          type: CONTENT_TYPE.TEXT,
        });
      }
      buffer = '';
    };
    for (const ch of text) {
      if (ch === '#') {
        flushBuffer(CONTENT_TYPE.TEXT);
        option_bold = !option_bold;
        option_underline = !option_underline;
      } else if (ch === '@') {
        flushBuffer(CONTENT_TYPE.TEXT);
        option_bold = !option_bold;
      } else if (ch === '\\') {
        flushBuffer(CONTENT_TYPE.TEXT);
        option_italic = !option_italic;
      } else if (ch === '_') {
        flushBuffer(CONTENT_TYPE.TEXT);
        option_underline = !option_underline;
      } else if (ch === ';') {
        flushBuffer(CONTENT_TYPE.TEXT);
        option_del = !option_del;
      } else if (ch === '<') {
        flushBuffer(CONTENT_TYPE.TEXT);
        buffer += ch;
      } else if (ch === '>') {
        if (buffer.length > 0 && buffer[0] === '<') {
          buffer = buffer.substr(1);
          flushBuffer(CONTENT_TYPE.BLANK);
        } else buffer += ch;
      } else buffer += ch;
    }
    if (buffer.length > 0) flushBuffer(CONTENT_TYPE.TEXT);

    const jsx_result = (
      <div className='d-flex' style={style}>
        {content_array.map((content, idx) => {
          if (content.type === CONTENT_TYPE.BLANK) {
            return this.buildBlank(idx, content, lineHeight);
          } else {
            let result = (
              <p
                key={idx}
                children={content.value}
                style={{ fontSize: `${lineHeight}rem` }}
                className='m-0'
              />
            );
            if (content.options.italic === true)
              result = <em key={idx} children={result} />;
            if (content.options.bold === true)
              result = <strong key={idx} children={result} />;
            if (content.options.underline === true)
              result = <u key={idx} children={result} />;
            if (content.options.del === true)
              result = <del key={idx} children={result} />;

            return result;
          }
        })}
      </div>
    );
    if (set_blank_array_idx !== undefined) set_blank_array_idx(blank_array_idx);
    return jsx_result;
  }

  buildBlank(idx, content) {
    if (this.props.quiz_mode !== true) {
      return (
        <FlipButton
          key={idx}
          blank_array_idx={content.blank_array_idx}
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
          key={idx}
          blank_array_idx={content.blank_array_idx}
          ParentState={this.state}
          setParentState={(e) => this.setState(e)}
          value={content.value}
          user_value={this.props.quiz_data[content.blank_array_idx].user_value}
          selected={content.blank_array_idx === this.props.quiz_data.cursor}
          setCursor={(blank_array_idx) => {
            const quiz_data = this.props.quiz_data;
            quiz_data.cursor = blank_array_idx;
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
  }

  buildJSX(idx, content) {
    switch (content.type) {
      case CONTENT_TYPE.TEXT:
        let blank_array_idx = content.blank_array_idx;
        if (isNumber(content.value[0]) || isHeaderSign(content.value[0])) {
          return (
            <div key={idx} className='font-weight-bold mb-0'>
              {this.parseStyleSign(
                content.value,
                content.fontSize_rem,
                {},
                blank_array_idx,
                (new_blank_array_idx) => (blank_array_idx = new_blank_array_idx)
              )}
            </div>
          );
        } else {
          return (
            <span
              key={idx}
              className='align-self-start'
              children={this.parseStyleSign(
                content.value,
                content.fontSize_rem,
                {},
                blank_array_idx,
                (new_blank_array_idx) => (blank_array_idx = new_blank_array_idx)
              )}
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
        return this.buildBlank(idx, content);
      case CONTENT_TYPE.TABLE: {
        let blank_array_idx = content.blank_array_idx;
        return (
          <table key={idx}>
            <tbody>
              {content.value.split('\n').map((row, row_idx) => {
                return (
                  <tr key={row_idx}>
                    {row.split('|').map((block, col_idx) => {
                      if (block[0] === ':') {
                        return (
                          <td
                            key={col_idx}
                            className='border'
                            style={{ whiteSpace: 'nowrap' }}
                            children={this.parseStyleSign(
                              block.substr(1),
                              1,
                              {
                                justifyContent: 'left',
                              },
                              blank_array_idx,
                              (new_blank_array_idx) =>
                                (blank_array_idx = new_blank_array_idx)
                            )}
                          />
                        );
                      } else if (block[0] === ';') {
                        return (
                          <td
                            key={col_idx}
                            className='border'
                            style={{ whiteSpace: 'nowrap' }}
                            children={this.parseStyleSign(
                              block.substr(1),
                              1,
                              {
                                justifyContent: 'right',
                              },
                              blank_array_idx,
                              (new_blank_array_idx) =>
                                (blank_array_idx = new_blank_array_idx)
                            )}
                          />
                        );
                      } else
                        return (
                          <td
                            key={col_idx}
                            className='border'
                            style={{ whiteSpace: 'nowrap' }}
                            children={this.parseStyleSign(
                              block,
                              1,
                              {
                                justifyContent: 'center',
                              },
                              blank_array_idx,
                              (new_blank_array_idx) =>
                                (blank_array_idx = new_blank_array_idx)
                            )}
                          />
                        );
                    })}
                  </tr>
                );
              })}
            </tbody>
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
      TABLE: 2,
      LINE_BREAK: 3,
    };
    let content_array = [];
    let blank_array = [];
    let quiz_data = { cursor: 0 };
    let blank_ref_set = {};
    let buffer = '';
    let lex = LEX.TEXT;
    let idx = 0;
    let start_of_line = true;
    let fontSize_rem = 1;
    let line_value = '';
    let small_buffer = '';
    let start_blank_array_idx = 0;

    function setLex(new_lex) {
      lex = new_lex;
      start_blank_array_idx = blank_array.length;
    }
    function popBuffer() {
      const data = buffer;
      small_buffer = '';
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
        blank_array_idx: start_blank_array_idx,
      });
    }

    const lex_text = (ch, hasBuffer) => {
      switch (ch) {
        case '\n':
          if (hasBuffer) append_text(popBuffer());
          setLex(LEX.LINE_BREAK);
          break;
        case '{':
          if (hasBuffer) append_text(popBuffer());
          small_buffer = '';
          setLex(LEX.TABLE);
          break;
        case '>':
          if (small_buffer[0] === '<') {
            const value = small_buffer.substr(1);
            if (this.props.quiz_mode === true) {
              quiz_data[blank_array.length] = {
                user_value: '',
                value: value,
              };
              blank_ref_set[blank_array.length] = createRef();
            }

            blank_array.push({
              idx: blank_array.length,
              value: value,
              hide: false,
            });
          }
          buffer += ch;
          small_buffer = '';
          break;
        case '<':
          small_buffer = '<';
          buffer += ch;
          break;
        default:
          if (ch !== '\\') buffer += ch;
          small_buffer += ch;
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
          if (ch === '{') {
            small_buffer = '';
            setLex(LEX.TABLE);
          } else {
            buffer = ch;
            small_buffer = ch;
            setLex(LEX.TEXT);
          }
      }
    };

    const lex_table = (ch, hasBuffer) => {
      switch (ch) {
        case '<':
          small_buffer = '<';
          buffer += ch;
          break;
        case '>':
          if (small_buffer[0] === '<' && small_buffer.length > 1) {
            const value = small_buffer.substr(1);
            if (this.props.quiz_mode === true) {
              quiz_data[blank_array.length] = {
                user_value: '',
                value: value,
              };
              blank_ref_set[blank_array.length] = createRef();
            }

            blank_array.push({
              idx: blank_array.length,
              value: value,
              hide: false,
            });
          }
          buffer += ch;
          break;
        case '|':
          small_buffer = '';
          buffer += ch;
          break;

        case '}':
          content_array.push({
            idx: idx++,
            type: CONTENT_TYPE.TABLE,
            value: buffer,
            blank_array_idx: start_blank_array_idx,
          });
          buffer = '';
          small_buffer = '';
          setLex(LEX.TEXT);
          break;

        default:
          buffer += ch;
          small_buffer += ch;
      }
    };
    for (const ch of this.props.data) {
      const hasBuffer = buffer.length > 0;
      if (lex === LEX.TEXT) lex_text(ch, hasBuffer);
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
      if (blank_array.length === 0) {
        this.nextQuiz();
        return;
      }
      quiz_data.finished = true;
      this.props.setParentState({ quiz_data: quiz_data }, () =>
        this.props.onUpdateRealAnswer()
      );
      this.setState({
        blank_array: Array.from(blank_array),
        content_array: Array.from(content_array),
        blank_ref_set: blank_ref_set,
      });
    } else {
      this.setState({
        blank_array: Array.from(blank_array),
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
    quiz_data.cursor = 0;
    this.state.blank_array.forEach((blank, blank_array_idx) => {
      quiz_data[blank_array_idx] = {
        user_value: '',
        value: blank.value,
      };
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
      if (this.props.quiz_data.cursor !== undefined)
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
