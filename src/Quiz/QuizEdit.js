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
    const post_db = this.props.posts[post_id];
    if (post_db === undefined) {
      alert('잘못된 post_id 입니다. Home으로 이동합니다.');
      this.props.history.push('/');
    } else {
      this.setState(post_db);
      this.setState({ post_id: post_id });
    }
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

            firebase
              .database()
              .ref(`posts/${this.state.post_id}`)
              .set(renew_post)
              .then(() =>
                this.props.history.push(`/view?post_id=${this.state.post_id}`)
              )
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
                  this.props.history.push(
                    `/view?post_id=${this.state.post_id}`
                  );
              }}
              children={'Discard changes'}
            />
            <Button
              className='ml-2 mb-2'
              size='sm'
              type='Submit'
              variant='success'
              children={'Save Quiz'}
            />
          </div>
          <div className='d-flex flex-row mb-5'>
            <div className='mr-2' style={{ width: 'calc(50vw - 5rem)' }}>
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
              <Form.Group controlId='md' className='mb-0'>
                <Form.Control
                  as='textarea'
                  rows={25}
                  placeholder='여기에 내용 입력'
                  onChange={handleChange}
                  defaultValue={this.state.md}
                />
              </Form.Group>
            </div>
            <div
              className='ml-2 align-self-stretch mh-100'
              style={{ width: 'calc(50vw - 5rem)' }}
            >
              <MarkdownReaderV2 data={this.state.md} className='h-100' />
            </div>
          </div>
        </Form>
      </div>
    );
  }
}

const QuizEdit = withRouter(Main);
export { QuizEdit };
