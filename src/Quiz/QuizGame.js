import { Button, Modal } from 'react-bootstrap';
import { MarkdownReaderV2 } from './MarkdownReader';
import { Component, createRef } from 'react';

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

class QuizGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      all_posts: [],
      deck: [],
      now_quiz: null,
      answer: '',
      hint: '',
      quiz_data: { finished: false },
    };
    this.markdown_reader = createRef();
    this.user_answer_field = createRef();
  }

  componentDidMount() {
    this.updateData().then(() => {
      this.updateDeck();
      this.popQuiz(true);
    });
  }

  componentDidUpdate(prevProps, prevState, snapshow) {
    if (
      !Array.isArray(prevProps.data) ||
      (Array.isArray(prevProps.data) &&
        Array.isArray(this.props.data) &&
        JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data))
    ) {
      this.updateData().then(() => {
        this.updateDeck();
        this.popQuiz(true);
      });
    }
  }

  updateData() {
    const update_data = async () =>
      this.setState({
        all_posts: this.props.posts,
        deck: [],
        now_quiz: null,
      });
    return update_data();
  }

  updateDeck(callback) {
    const new_deck = Array.from(shuffleArray(Array.from(this.props.data)));
    this.setState({ deck: new_deck }, callback);
  }

  resetQuiz() {
    this.markdown_reader.current.resetQuiz();
  }

  popQuiz(skip_confirm) {
    if (this.state.deck.length === 0) {
      if (skip_confirm !== true) {
        if (window.confirm('모든 문제를 풀었습니다!\n계속 진행하시겠습니까?'))
          (() => {})('Do nothing');
        else this.props.handleClose();
      }
      this.updateDeck(() => {
        this.setState({
          now_quiz: this.state.all_posts[this.state.deck[0]],
          deck: this.state.deck.slice(1),
          answer: '',
          hint: '',
          quiz_data: { finished: false },
        });
      });
    } else {
      this.setState({
        now_quiz: this.state.all_posts[this.state.deck[0]],
        deck: this.state.deck.slice(1),
        answer: '',
        hint: '',
        quiz_data: { finished: false },
      });
    }
  }

  maskedAnswer() {
    const real_answer = this.getAnswer();
    let result = this.state.answer;
    while (result.length < real_answer.length)
      result += real_answer[result.length] === ' ' ? '.' : '●';
    return result;
  }

  getAnswer() {
    return this.state.quiz_data[this.state.quiz_data.cursor].value;
  }

  onChangeUserAnswer(e) {
    const user_answer = e.target.value;
    this.setState({ answer: user_answer });
    if (user_answer === this.getAnswer()) {
      e.target.value = '';
      this.setState({ answer: '', hint: '' });
      const quiz_data = this.state.quiz_data;
      quiz_data[this.state.quiz_data.cursor].user_value =
        quiz_data[this.state.quiz_data.cursor].value;
      this.setState({ quiz_data: quiz_data });
      if (this.markdown_reader.current.nextQuiz() === true) {
        this.setState({ hint: this.maskedAnswer() });
      } else {
        if (
          this.props.data.length === 1 // Do nothing
        );
        else this.popQuiz();
      }
    } else {
      const real_answer = this.getAnswer();
      let new_hint = '';
      this.state.hint.split('').forEach((ch, idx) => {
        if (ch === real_answer[idx] || user_answer[idx] === real_answer[idx])
          new_hint += real_answer[idx];
        else new_hint += real_answer[idx] === ' ' ? '.' : '●';
      });
      this.setState({ hint: new_hint });
    }
  }

  addHint() {
    const real_answer = this.getAnswer();
    let new_hint = '';
    let new_user_answer = '';
    let add_flag = true;
    this.state.hint.split('').forEach((ch, idx) => {
      if (ch === real_answer[idx]) {
        new_hint += real_answer[idx];
        new_user_answer += real_answer[idx];
      } else {
        if (real_answer[idx] === ' ') {
          new_hint += '.';
          if (new_user_answer[new_user_answer.length - 1] !== ' ')
            new_user_answer += real_answer[idx];
        } else if (add_flag) {
          new_hint += real_answer[idx];
          new_user_answer += real_answer[idx];
          add_flag = false;
        } else new_hint += '●';
      }
    });
    this.setState({ hint: new_hint });
    this.user_answer_field.current.value = new_user_answer.trimEnd();
    this.onChangeUserAnswer({ target: this.user_answer_field.current });
  }

  passQuiz() {
    this.user_answer_field.current.value = '';
    this.setState({ answer: '', hint: '' });
    const quiz_data = this.state.quiz_data;
    if (this.state.quiz_data.cursor !== undefined)
      quiz_data[this.state.quiz_data.cursor].user_value =
        quiz_data[this.state.quiz_data.cursor].value;
    this.setState({ quiz_data: quiz_data });
    if (this.markdown_reader.current.nextQuiz() === true) {
      this.setState({ hint: this.maskedAnswer() });
    } else {
      if (this.props.data.length === 1) this.resetQuiz();
      else this.popQuiz();
    }
  }

  onUpdateRealAnswer() {
    this.setState({ hint: this.maskedAnswer() });
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => this.props.handleClose()}
        backdrop='static'
        centered={true}
        animation={false}
        style={{ maxWidth: 'none' }}
        dialogClassName='modal-100w m-0 mw-100'
      >
        <Modal.Header className='flex-column text-center p-1'>
          {this.state.now_quiz && (
            <p
              className='mb-0'
              children={`${this.state.now_quiz.category}-${this.state.now_quiz.chapter}`}
            />
          )}
          <Modal.Title
            as='p'
            children={
              this.state.now_quiz !== null ? (
                <b children={this.state.now_quiz.title} />
              ) : (
                'Loading...'
              )
            }
          />
        </Modal.Header>
        <Modal.Body className='px-0 py-0'>
          {this.state.now_quiz !== null && (
            <MarkdownReaderV2
              style={{ overflowY: 'scroll', height: 'calc(100vh - 13.9rem)' }}
              data={this.state.now_quiz && this.state.now_quiz.md}
              ref={this.markdown_reader}
              quiz_mode={true}
              quiz_data={this.state.quiz_data}
              onUpdateRealAnswer={() => this.onUpdateRealAnswer()}
              setParentState={(d, callback) => this.setState(d, callback)}
              editing_value={
                this.user_answer_field.current &&
                this.user_answer_field.current.value
              }
            />
          )}
        </Modal.Body>

        <Modal.Footer className='d-flex justify-content-end align-items-stretch'>
          <Button
            variant='danger'
            className='mr-auto'
            onClick={() => this.props.handleClose()}
            children='Close'
          />
          <div className='d-flex flex-column flex-fill'>
            <div
              className='form-control flex-fill bg-white border d-flex flex-row justify-content-center mb-2'
              style={{ width: 'auto' }}
              children={
                this.state.quiz_data.cursor !== undefined &&
                this.state.hint
                  .split('')
                  .map((ch, idx) => (
                    <p
                      className={
                        this.getAnswer()[idx] === ch
                          ? 'text-success'
                          : 'text-danger'
                      }
                      style={{ whiteSpace: 'pre' }}
                      children={ch}
                      key={idx}
                    />
                  ))
              }
            />
            <input
              className='form-control flex-fill text-center'
              type='text'
              placeholder=''
              style={{ width: 'auto' }}
              ref={this.user_answer_field}
              onChange={(e) => this.onChangeUserAnswer(e)}
              onInput={(e) => {
                if (e.nativeEvent.data === '.') {
                  e.preventDefault();
                  this.addHint();
                }
              }}
            />
          </div>
          <Button
            variant='primary'
            children='Hint'
            onClick={() =>
              alert('답 입력칸에서 .(마침표)키를 누르면 힌트가 나옵니다.')
            }
          />
          <Button
            variant='warning'
            children='Pass'
            onClick={() => this.passQuiz()}
          />
          <Button
            variant='secondary'
            children={this.props.data.length === 1 ? 'Reset' : 'Next'}
            onClick={() =>
              this.props.data.length === 1 ? this.resetQuiz() : this.popQuiz()
            }
          />
        </Modal.Footer>
      </Modal>
    );
  }
}
export { QuizGame };
