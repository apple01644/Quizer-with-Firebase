import { Button } from 'react-bootstrap';
import { Component } from 'react';

function formatAnswer(answer, real_answer) {
  let result = answer;
  while (result.length < real_answer.length)
    result += real_answer[result.length] === ' ' ? '.' : '●';
  return result;
}
function shuffleArray(array) {
  let curId = array.length;
  while (0 !== curId) {
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

class QuizPlay extends Component {
  initialize(first) {
    this.blocks = [];
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
        this.blocks.push(['button', buffer, answers.length]);
        real_answers.push(buffer);
        answers.push('');
        hints.push(formatAnswer('', buffer));
        buffer = '';
        is_text = true;
      } else if (ch === '\n' && is_text) {
        this.blocks.push(['text', buffer]);
        this.blocks.push(['br']);
        buffer = '';
      } else buffer += ch;
    }
    if (first === true) {
      this.state = {
        holding_index: 0,
        real_answers: real_answers,
        answers: answers,
        hints: hints,
        answer_input: '',
      };
    } else {
      this.setState({
        holding_index: 0,
        real_answers: real_answers,
        answers: answers,
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

  render() {
    return (
      <div>
        {this.blocks.map((pair) => {
          if (pair[0] === 'text') return pair[1];
          else if (pair[0] === 'button')
            return (
              <Button
                key={pair[2]}
                variant={
                  pair[2] === this.state.holding_index
                    ? 'outline-primary'
                    : pair[1] === this.state.answers[pair[2]]
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
              >
                {formatAnswer(this.state.answers[pair[2]], pair[1])}
              </Button>
            );
          else if (pair[0] === 'br') return <br />;
          else return null;
        })}
        <br />
        <div></div>
        <br />
        <div className='d-flex flex-column justify-content-start mx-3'>
          <Button
            variant='outline-dark'
            onClick={() => {
              const masks = this.state.hints[this.state.holding_index]
                .split('')
                .map((ch, idx) => [ch, idx])
                .filter(([ch, idx]) => ch === '●')
                .map(([ch, idx]) => idx);
              if (masks.length > 0) {
                shuffleArray(masks);
                const idx = masks[0];

                const hints = Array.from(this.state.hints);
                hints[this.state.holding_index] =
                  hints[this.state.holding_index].substr(0, idx) +
                  this.state.real_answers[this.state.holding_index][idx] +
                  hints[this.state.holding_index].substr(idx + 1);
                this.setState({
                  hints: hints,
                });
              }
            }}
          >
            {this.state.hints[this.state.holding_index]
              .split('')
              .map((ch, idx) => {
                if (
                  this.state.real_answers[this.state.holding_index][idx] ===
                  this.state.answers[this.state.holding_index][idx]
                )
                  return (
                    <a key={idx} className='text-success'>
                      {ch}
                    </a>
                  );
                else
                  return (
                    <a key={idx} className='text-danger'>
                      {ch}
                    </a>
                  );
              })}
          </Button>
          <div className='justify-content-center align-items-stretch'>
            <input
              className='my-0'
              type='text'
              placeholder='Type answer'
              value={this.state.answer_input}
              onChange={(e) => {
                const answers = Array.from(this.state.answers);
                if (
                  answers[this.state.holding_index] !==
                  this.state.real_answers[this.state.holding_index]
                )
                  answers[this.state.holding_index] = e.target.value;
                this.setState({
                  answers: answers,
                  answer_input: e.target.value,
                });
              }}
            />
            <Button
              className='ml-2'
              variant='warning'
              onClick={() => {
                const answers = Array.from(this.state.answers);
                answers[this.state.holding_index] = this.state.real_answers[
                  this.state.holding_index
                ];
                this.setState({
                  answers: answers,
                  answer_input: this.state.real_answers[
                    this.state.holding_index
                  ],
                });

                const able_questions = this.state.answers
                  .map((answer, idx) => [answer, idx])
                  .filter(
                    ([answer, idx]) => answer !== this.state.real_answers[idx]
                  )
                  .map(([answer, idx]) => idx);

                if (able_questions.length > 0) {
                  shuffleArray(able_questions);
                  this.setState({ holding_index: able_questions[0] });
                }
              }}
            >
              Pass
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export { QuizPlay };
