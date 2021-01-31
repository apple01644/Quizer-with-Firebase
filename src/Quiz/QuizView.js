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
    };
    this.markdown_reader = createRef();
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
      if (skip_confirm !== true)
        if (window.confirm('모든 문제를 풀었습니다!\n계속 진행하시겠습니까?'))
          (() => {})('Do nothing');
        else this.handleClose();

      this.updateDeck(() => {
        this.setState({
          now_quiz: this.state.all_posts[this.state.deck[0]],
          deck: this.state.deck.slice(1),
        });
      });
    } else {
      this.setState({
        now_quiz: this.state.all_posts[this.state.deck[0]],
        deck: this.state.deck.slice(1),
      });
    }
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
        <Modal.Header className='flex-column'>
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
            quiz_mode={true}
            ref={this.markdown_reader}
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
            <Button
              as='div'
              className='form-control flex-fill bg-white border-danger text-danger mb-2'
              style={{ width: 'auto' }}
              children={'0000000'}
            />
            <input
              className='form-control flex-fill'
              type='text'
              placeholder='답 입력칸'
              style={{ width: 'auto' }}
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
            onClick={() => this.markdown_reader.passQuiz()}
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
