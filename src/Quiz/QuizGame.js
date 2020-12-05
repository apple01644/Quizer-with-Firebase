import { FirebaseDatabaseNode } from '@react-firebase/database';
import { Button, Card, Modal } from 'react-bootstrap';
import { QuizPlay } from './QuizPlay';
const { Component } = require('react');

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
      posts: null,
      play_post: null,
      show_modal: false,
      all_quizes: props.pagedata.list,
      quiz_list: shuffleArray(Array.from(props.pagedata.list)),
    };
  }

  goNextQuestion() {
    let post = null;
    if (this.state.quiz_list.length > 1) {
      const old_list = Array.from(this.state.quiz_list);
      old_list.shift();
      this.setState({
        quiz_list: old_list,
      });
      post = this.state.posts[old_list[0]];
    } else {
      const new_list = shuffleArray(Array.from(this.state.all_quizes));
      this.setState({
        show_modal: true,
        quiz_list: new_list,
      });
      post = this.state.posts[new_list[0]];
    }
    this.setState({
      play_post: post,
    });
  }

  render() {
    console.log('state', this.state.play_post);
    return (
      <div className='my-auto'>
        <Button
          className='mt-2'
          size='sm'
          onClick={() => {
            this.props.setpage('quiz_list');
          }}
        >
          Back to List
        </Button>
        <Button
          className='mt-2 ml-2'
          size='sm'
          onClick={() => {
            this.goNextQuestion();
          }}
        >
          Next Quiz
        </Button>
        <br />

        <Modal
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>Notice</Modal.Title>
          </Modal.Header>
          <Modal.Body>A round is ended.</Modal.Body>
          <Modal.Footer>
            <Button
              variant='success'
              onClick={() => this.setState({ show_modal: false })}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
        <FirebaseDatabaseNode path='posts/' null={this.state.quiz_list}>
          {(d) => {
            if (d.isLoading === null || d.isLoading || d.value === null)
              return <>Loading...</>;
            const posts = {};
            Object.entries(d.value).forEach(
              ([key, value]) => (posts[key] = value)
            );
            this.setState({ posts: posts });
            const post = posts[this.state.quiz_list[0]];
            this.setState({
              play_post: post,
            });
            return <></>;
          }}
        </FirebaseDatabaseNode>
        {this.state.play_post != null ? (
          <div className='mt-3'>
            <Card.Title>{this.state.play_post.title}</Card.Title>
            <QuizPlay
              value={this.state.play_post.md}
              goNextQuestion={() => this.goNextQuestion()}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export { QuizGame };
