import { Component, createRef } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import { MarkdownReaderV2 } from './MarkdownReader';
import { Link, withRouter } from 'react-router-dom';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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
    return firebase
      .database()
      .ref(`/posts/`)
      .once('value')

      .then((s) => {
        this.setState({ all_posts: s.val(), deck: [], now_quiz: null });
      });
  }

  updateDeck(callback) {
    const new_deck = Array.from(shuffleArray(Array.from(this.props.data)));
    this.setState({ deck: new_deck }, callback);
  }

  popQuiz(skip_confirm) {
    if (this.state.deck.length === 0) {
      if (skip_confirm !== true) {
        if (this.props.data.length === 1);
        else if (
          window.confirm('모든 문제를 풀었습니다!\n계속 진행하시겠습니까?')
        )
          (() => {})('Do nothing');
        else this.props.handleClose();
      }
      if (this.props.data.length === 1);
      else
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
      } else this.popQuiz();
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
    let add_flag = true;
    this.state.hint.split('').forEach((ch, idx) => {
      if (ch === real_answer[idx]) new_hint += real_answer[idx];
      else {
        if (real_answer[idx] === ' ') new_hint += '.';
        else if (add_flag) {
          new_hint += real_answer[idx];
          add_flag = false;
        } else new_hint += '●';
      }
    });
    this.setState({ hint: new_hint });
  }

  passQuiz() {
    this.user_answer_field.current.value = '';
    this.setState({ answer: '', hint: '' });
    const quiz_data = this.state.quiz_data;
    quiz_data[this.state.quiz_data.cursor].user_value =
      quiz_data[this.state.quiz_data.cursor].value;
    this.setState({ quiz_data: quiz_data });
    if (this.markdown_reader.current.nextQuiz() === true) {
      this.setState({ hint: this.maskedAnswer() });
    } else this.popQuiz();
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
        style={{ 'max-width': 'none' }}
        dialogClassName='modal-90w mx-3 mw-100'
      >
        <Modal.Header className='flex-column text-center'>
          {this.state.now_quiz && (
            <h6
              children={`${this.state.now_quiz.category}-${this.state.now_quiz.chapter}`}
            />
          )}
          <Modal.Title
            children={
              this.state.now_quiz !== null ? (
                <b children={this.state.now_quiz.title} />
              ) : (
                'Loading...'
              )
            }
          />
        </Modal.Header>
        <Modal.Body>
          <MarkdownReaderV2
            data={this.state.now_quiz && this.state.now_quiz.md}
            ref={this.markdown_reader}
            quiz_mode={true}
            quiz_data={this.state.quiz_data}
            onUpdateRealAnswer={() => this.onUpdateRealAnswer()}
            setParentState={(d, callback) => this.setState(d, callback)}
          />
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
                      style={{ 'white-space': 'pre' }}
                      children={ch}
                    />
                  ))
              }
            />
            <input
              ref={this.user_answer}
              className='form-control flex-fill text-center'
              type='text'
              placeholder=''
              style={{ width: 'auto' }}
              ref={this.user_answer_field}
              onChange={(e) => this.onChangeUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === '.') {
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
            children='Next'
            onClick={() => this.popQuiz()}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts_list: [],
      posts_count: 0,
      post_index_in_list: 0,

      post_data: null,
      post_id: null,

      prev_post_id: null,
      next_post_id: null,

      show_QuizGame: false,
    };
    this.now_index = 0;
    this.markdown_reader = createRef();
  }

  setPageList(posts) {
    const posts_of_this_category = Object.entries(posts).filter(
      ([post_id, post_data]) =>
        post_data.category === this.state.post_data.category
    );
    const posts_list = [];
    const chapter_unordered_set = {};

    Object.entries(posts_of_this_category).forEach(
      ([__unused__, [post_id, post]]) => {
        const chapter = post.chapter;
        if (!(chapter in chapter_unordered_set))
          chapter_unordered_set[chapter] = [];
        chapter_unordered_set[chapter].push([post_id, post.title]);
      }
    );

    Object.keys(chapter_unordered_set)
      .sort()
      .forEach((chapter) => {
        chapter_unordered_set[chapter].sort().forEach(([post_id, post]) => {
          posts_list.push(post_id);
        });
      });

    this.setState({
      posts_list: posts_list,
      posts_count: posts_list.length,
      post_index_in_list: posts_list.findIndex((e) => e === this.state.post_id),
    });
  }

  setNextPage() {
    const prev_post_id = this.state.posts_list[
      (this.state.post_index_in_list - 1 + this.state.posts_count) %
        this.state.posts_count
    ];
    const next_post_id = this.state.posts_list[
      (this.state.post_index_in_list + 1) % this.state.posts_count
    ];

    this.setState({
      prev_post_id: prev_post_id,
      next_post_id: next_post_id,
    });
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const post_id = params.get('post_id');
    this.setState({ post_id: post_id });
  }

  componentDidUpdate(prevProps, prevState, sanpshot) {
    if (
      this.state.post_data === null ||
      prevState.post_id !== this.state.post_id
    ) {
      firebase
        .database()
        .ref(`/posts/${this.state.post_id}`)
        .once('value')
        .then((s) => {
          const post_db = s.val();
          if (post_db === null) {
            alert('잘못된 post_id 입니다. Home으로 이동합니다.');
            this.props.history.push('/');
          } else {
            this.setState({
              post_data: post_db,
            });
            if (this.state.posts_count !== 0) {
              this.setState({
                post_index_in_list: this.state.posts_list.findIndex(
                  (e) => e === this.state.post_id
                ),
              });
              this.setNextPage();
            }
          }
        });
    }
    if (
      prevState.post_data === null ||
      (this.state.post_data !== null &&
        prevState.post_data.category !== this.state.post_data.category)
    ) {
      firebase
        .database()
        .ref(`/posts/`)
        .once('value')
        .then((s) => {
          this.setPageList(s.val());
        });
    }
    if (prevState.posts_count === 0 && this.state.posts_count !== 0) {
      this.setNextPage();
    }
  }

  render() {
    if (this.state.post_data === null) return <>Loading...</>;
    return (
      <>
        {this.state.show_QuizGame !== undefined && (
          <QuizGame
            show={this.state.show_QuizGame}
            handleClose={() => this.setState({ show_QuizGame: false })}
            data={[this.state.post_id]}
          />
        )}
        <div className='d-flex pt-2'>
          <Link
            to={`/`}
            children={<Button size='sm' children={'Back to list'} />}
          />
          {this.props.isAuth &&
            this.state.post_data !== null &&
            this.props.User.uid === this.state.post_data.uid && (
              <>
                <Link to={`/edit_post?post_id=${this.state.post_id}`}>
                  <Button
                    className='ml-2'
                    size='sm'
                    variant='warning'
                    children={'Edit'}
                  />
                </Link>
                <Button
                  className='ml-2'
                  size='sm'
                  variant='danger'
                  onClick={() => {
                    if (this.state.post_id.length > 16)
                      if (
                        window.confirm(
                          'Do you really want to delete this quiz?'
                        )
                      ) {
                        firebase
                          .database()
                          .ref(`posts/${this.state.post_id}`)
                          .set(null)
                          .then(() => this.props.history.push(`/`))
                          .catch((e) => {
                            alert(e);
                            console.log(e);
                          });
                      }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          <Button
            className='ml-2'
            variant='info'
            size='sm'
            onClick={() => {
              this.setState({ show_QuizGame: true });
            }}
            children={'Quiz'}
          />
          <Button
            className='ml-2'
            variant='secondary'
            size='sm'
            onClick={() => this.markdown_reader.current.hideAll()}
            children={'Mask'}
          />
        </div>
        <br />
        <div className='m-3 mh-100 align-self-stretch'>
          <Card className='mh-100'>
            <Card.Body>
              <h6
                children={`${this.state.post_data.category}-${this.state.post_data.chapter}`}
              />
              <Card.Title
                className='font-weight-bold mb-0'
                children={this.state.post_data.title}
              />
              <MarkdownReaderV2
                data={this.state.post_data.md}
                ref={this.markdown_reader}
              />
            </Card.Body>
          </Card>

          <Link to={`/view?post_id=${this.state.prev_post_id}`}>
            <Button
              className='mt-2 ml-2'
              variant='secondary'
              size='sm'
              children={'◀'}
              onClick={() => {
                this.setState({ post_id: this.state.prev_post_id });
                window.scrollY = 0;
              }}
            />
          </Link>
          <Link to={`/view?post_id=${this.state.next_post_id}`}>
            <Button
              className='mt-2 ml-2'
              variant='secondary'
              size='sm'
              children={'▶'}
              onClick={() => {
                this.setState({ post_id: this.state.next_post_id });
                window.scrollY = 0;
              }}
            />
          </Link>
        </div>
      </>
    );
  }
}

const QuizView = withRouter(Main);
export { QuizView };
