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
    console.log(this.props);
    this.state = { md: '' };
  }
  render() {
    const handleChange = (e) => {
      const { id, value } = e.target;
      this.setState({
        [id]: value,
      });
    };
    return (
      <div className='m-3 mh-100'>
        <Form
          className='mh-100'
          onSubmit={(e) => {
            e.preventDefault();
            const new_post_key = firebase.database().ref().child('posts').push()
              .key;
            const new_post = {
              title: this.state.title,
              md: this.state.md,
              category: this.state.category,
              chapter: this.state.chapter,
              uid: this.props.User.uid,
            };

            console.log(this.state);
            console.log(new_post);

            firebase
              .database()
              .ref(`posts/${new_post_key}`)
              .set(new_post)
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
                  window.confirm(
                    'Do you really want to cancel creating new quiz?'
                  )
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
              children={'Create Quiz'}
            />
          </div>
          <div className='d-flex flex-row'>
            <div className='mr-2' style={{ width: '40vh' }}>
              <Form.Group controlId='title' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 제목 입력'
                  onChange={handleChange}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='category' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 카테고리 입력'
                  onChange={handleChange}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='chapter' className='mb-2'>
                <Form.Control
                  type='text'
                  placeholder='여기에 챕터 입력'
                  onChange={handleChange}
                  className='py-0'
                />
              </Form.Group>
              <Form.Group controlId='md' className='mb-2'>
                <Form.Control
                  as='textarea'
                  rows={25}
                  placeholder='여기에 내용 입력'
                  onChange={handleChange}
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

const QuizNew = withRouter(Main);
export { QuizNew };
