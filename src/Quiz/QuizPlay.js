import { Button } from 'react-bootstrap';
import { Component, createRef } from 'react';
import {
  MaskedHint,
  DocumentViewWithScroll,
  UserAnswerInput,
} from './QuizPlay.style';

function formatAnswer(answer, real_answer) {
  let result = answer;
  while (result.length < real_answer.length)
    result += real_answer[result.length] === ' ' ? '.' : '●';
  return result;
}

class QuizPlay extends Component {
  initialize(first) {
    this.blocks = [];
    this.quiz_buttons = [];
    this.quiz_view = createRef();
    const real_answers = [];
    const answers = [];
    const hints = [];

    let buffer = '';
    let is_text = true;
    for (const ch of this.props.value) {
      if (ch === '<' && is_text) {
        this.blocks.push(['text', buffer]);
        buffer = '';
        is_text = false;
      } else if (ch === '>' && !is_text) {
        buffer.toLowerCase();

        let real_answer = '';
        let hint = '';
        let is_prehint = false;

        for (let k = 0; k < buffer.length; ++k) {
          if (buffer[k] === '\\') is_prehint = true;
          else {
            if (is_prehint) {
              is_prehint = false;
              real_answer += buffer[k];
              hint += buffer[k];
            } else {
              real_answer += buffer[k];
              hint += buffer[k] === ' ' ? '.' : '●';
            }
          }
        }

        this.blocks.push(['button', real_answer, answers.length]);
        this.quiz_buttons.push(createRef());
        real_answers.push(real_answer);
        answers.push('');
        hints.push(hint);
        buffer = '';
        is_text = true;
      } else if (ch === '\n' && is_text) {
        this.blocks.push(['text', buffer]);
        this.blocks.push(['br']);
        buffer = '';
      } else buffer += ch;
    }
    if (buffer.length > 0) this.blocks.push(['text', buffer]);

    if (first === true) {
      this.state = {
        holding_index: 0,
        real_answers: real_answers,
        user_answers: answers,
        hints: hints,
        answer_input: '',
      };
    } else {
      this.setState({
        holding_index: 0,
        real_answers: real_answers,
        user_answers: answers,
        hints: hints,
        answer_input: '',
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.initialize();
    }
  }
  constructor(props) {
    super(props);
    this.initialize(true);
  }

  setUserAnswer(e) {
    const answers = Array.from(this.state.user_answers);
    const hints = Array.from(this.state.hints);
    const user_answer = e.target.value || '';
    const real_answer = this.state.real_answers[this.state.holding_index];

    if (e.target.value.indexOf('.') !== -1) {
      e.target.value = e.target.value.replaceAll('.', '');
      this.getHint();
      return;
    }

    if (answers[this.state.holding_index] !== real_answer)
      answers[this.state.holding_index] = user_answer;

    for (
      let idx = 0;
      idx < real_answer.length && idx < user_answer.length;
      ++idx
    ) {
      if (user_answer[idx] !== ' ' && user_answer[idx] === real_answer[idx]) {
        hints[this.state.holding_index] =
          hints[this.state.holding_index].substr(0, idx) +
          real_answer[idx] +
          hints[this.state.holding_index].substr(idx + 1);
      }
    }
    this.setState({
      user_answers: answers,
      answer_input: user_answer,
      hints: hints,
    });
    if (
      user_answer === real_answer &&
      this.state.holding_index + 1 < answers.length
    ) {
      this.quiz_view.current.scrollTop =
        this.quiz_buttons[this.state.holding_index + 1].current.offsetTop -
        this.quiz_view.current.offsetTop;
      this.setState({
        holding_index: this.state.holding_index + 1,
        answer_input: '',
      });
    }
  }

  getHint() {
    const masks = this.state.hints[this.state.holding_index]
      .split('')
      .map((ch, idx) => [ch, idx])
      .filter(([ch, idx]) => ch === '●')
      .map(([ch, idx]) => idx);
    if (masks.length > 0) {
      let idx = masks[0];

      const hints = Array.from(this.state.hints);
      if (hints[this.state.holding_index][0] === '●') {
        idx = 0;
      }

      hints[this.state.holding_index] =
        hints[this.state.holding_index].substr(0, idx) +
        this.state.real_answers[this.state.holding_index][idx] +
        hints[this.state.holding_index].substr(idx + 1);
      this.setState({
        hints: hints,
      });
    }
  }

  passQuestion() {
    const answers = Array.from(this.state.user_answers);
    answers[this.state.holding_index] = this.state.real_answers[
      this.state.holding_index
    ];
    this.setState({
      user_answers: answers,
      answer_input: this.state.real_answers[this.state.holding_index],
    });

    if (this.state.holding_index + 1 < answers.length) {
      this.quiz_view.current.scrollTop =
        this.quiz_buttons[this.state.holding_index + 1].current.offsetTop -
        this.quiz_view.current.offsetTop;
      this.setState({
        holding_index: this.state.holding_index + 1,
        answer_input: '',
      });
    }
  }

  didAnswerAllQuestions() {
    let k = this.state.real_answers.length - 1;
    while (this.state.real_answers[k] === this.state.user_answers[k] && k >= 0)
      k -= 1;

    return k === -1;
  }

  render() {
    return (
      <div>
        <DocumentViewWithScroll
          className='border-bottom border-secondary my-2 px-3 text-left'
          ref={this.quiz_view}
        >
          {this.blocks.map((pair, idx) => {
            if (pair[0] === 'text') return pair[1];
            else if (pair[0] === 'button') {
              return (
                <Button
                  key={idx}
                  ref={this.quiz_buttons[pair[2]]}
                  variant={
                    pair[2] === this.state.holding_index
                      ? 'outline-primary'
                      : pair[1] === this.state.user_answers[pair[2]]
                      ? 'outline-success'
                      : 'outline-danger'
                  }
                  size='sm'
                  className='p-0'
                  onClick={() => {
                    this.setState({
                      holding_index: pair[2],
                      answer_input: '',
                    });
                  }}
                  style={
                    pair[1] === this.state.user_answers[pair[2]]
                      ? { pointEvents: 'none' }
                      : {}
                  }
                >
                  {formatAnswer(this.state.user_answers[pair[2]], pair[1])}
                </Button>
              );
            } else if (pair[0] === 'br') return <br key={idx} />;
            else return null;
          })}
        </DocumentViewWithScroll>
        <div className='d-flex flex-column justify-content-start mx-3'>
          <Button
            variant='outline-dark'
            className='d-flex flex-row justify-content-center'
            onClick={() => this.getHint()}
          >
            {this.state.hints[this.state.holding_index]
              .split('')
              .map((ch, idx) => {
                if (
                  this.state.real_answers[this.state.holding_index][idx] ===
                    this.state.user_answers[this.state.holding_index][idx] &&
                  this.state.real_answers[this.state.holding_index][idx] !== ' '
                )
                  return (
                    <div key={idx} className='text-success m-0 p-0'>
                      {ch}
                    </div>
                  );
                else
                  return (
                    <MaskedHint key={idx} className='text-danger m-0 p-0'>
                      {ch}
                    </MaskedHint>
                  );
              })}
          </Button>
          <div className='justify-content-between mt-2'>
            <UserAnswerInput
              className='my-0'
              type='text'
              placeholder='Type answer'
              value={this.state.answer_input}
              onChange={(e) => this.setUserAnswer(e)}
            />
            {this.state.real_answers !== undefined &&
            this.didAnswerAllQuestions() ? (
              <Button
                variant='success'
                onClick={() => this.props.goNextQuestion()}
              >
                Next
              </Button>
            ) : (
              <Button variant='warning' onClick={() => this.passQuestion()}>
                Pass
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export { QuizPlay };
