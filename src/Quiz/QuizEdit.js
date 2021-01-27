import { Form, Button } from 'react-bootstrap';
import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { MarkdownReaderV2 } from './MarkdownReader';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { post_id: null };
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const post_id = params.get('post_id');
    firebase
      .database()
      .ref(`/posts/${post_id}`)
      .once('value')
      .then((s) => {
        const post_db = s.val();
        if (post_db === null) {
          alert('잘못된 post_id 입니다. Home으로 이동합니다.');
          this.props.history.push('/');
        } else {
          this.setState(post_db);
          this.setState({ post_id: post_id });
          console.log(this.state);
        }
      });
  }

  render() {
    const handleChange = (e) => {
      const { id, value } = e.target;
      this.setState({
        [id]: value,
      });
    };
    if (this.state.post_id === null) return <>Loading...</>;
    return (
      <div className='m-3 mh-100'>
        <Form
          className='mh-100'
          onSubmit={(e) => {
            e.preventDefault();
            const renew_post = {
              title: this.state.title,
              md: this.state.md,
              category: this.state.category,
              chapter: this.state.chapter,
              uid: this.props.User.uid,
            };

            console.log(this.state);
            console.log(renew_post);

            firebase
              .database()
              .ref(`posts/${this.state.post_id}`)
              .set(renew_post)
              .then(() => this.props.history.push(`/`))
              .catch((e) => {
                alert(e);
                console.log(e);
              });
          }}
        >
          <div>
            <Button
              className=' mb-2'
              variant='danger'
              size='sm'
              onClick={() => {
                if (
                  window.confirm('Do you really want to cancel editing a quiz?')
                )
                  this.props.history.push(`/`);
              }}
              children={'Back to List'}
            />
            <Button
              className='ml-2 mb-2'
              size='sm'
              type='Submit'
              variant='success'
              children={'Save Quiz'}
            />
          </div>
          <div className='d-flex flex-row'>
            <div className='mr-2' style={{ width: '40vh' }}>
              <Form.Group controlId='category' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 카테고리 입력'
                  onChange={handleChange}
                  defaultValue={this.state.category}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='chapter' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 챕터 입력'
                  onChange={handleChange}
                  defaultValue={this.state.chapter}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='title' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 제목 입력'
                  onChange={handleChange}
                  value={this.state.title}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='md' className='mb-2'>
                <Form.Control
                  as='textarea'
                  rows={25}
                  placeholder='여기에 내용 입력'
                  onChange={handleChange}
                  defaultValue={this.state.md}
                />
              </Form.Group>
            </div>
            <div className='ml-2 align-self-stretch' style={{ width: '40vh' }}>
              <MarkdownReaderV2 data={this.state.md} />
            </div>
          </div>
        </Form>
      </div>
    );
  }
}

const QuizEdit = withRouter(Main);
export { QuizEdit };
