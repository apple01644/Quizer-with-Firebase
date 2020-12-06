import { FirebaseDatabaseMutation } from '@react-firebase/database';
import { Form, Button } from 'react-bootstrap';
const { Component } = require('react');

class QuizNew extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const btn_back = (
      <Button
        className='mt-2'
        variant='danger'
        size='sm'
        onClick={() => {
          if (window.confirm('Do you really want to cancel creating new quiz?'))
            this.props.setpage('quiz_list');
        }}
      >
        Back to List
      </Button>
    );
    const handleChange = (e) => {
      const { id, value } = e.target;
      this.setState({
        [id]: value,
      });
    };
    return (
      <>
        <FirebaseDatabaseMutation path={`posts/`} type='push'>
          {({ runMutation }) => {
            return (
              <div className='m-3 mh-100'>
                <Form
                  className='mh-100'
                  onSubmit={(e) => {
                    e.preventDefault();
                    const new_post = {
                      title: this.state.title,
                      md: this.state.md,
                      category: this.state.category,
                      uid: this.props.auth.user.uid,
                    };
                    (async () => {
                      await runMutation(new_post);
                      this.props.setpage('quiz_list');
                    })();
                  }}
                >
                  {btn_back}
                  <Button
                    className='mt-2 ml-2'
                    size='sm'
                    type='Submit'
                    variant='success'
                  >
                    Create Quiz
                  </Button>
                  <br />
                  <Form.Group controlId='title'>
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='여기에 제목 입력'
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId='category'>
                    <Form.Label>카테고리</Form.Label>
                    <Form.Control type='text' onChange={handleChange} />
                  </Form.Group>
                  <Form.Group controlId='md'>
                    <Form.Label>{'내용(가릴 부분은 <, >로 감싸기)'}</Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={8}
                      placeholder='여기에 내용 입력'
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              </div>
            );
          }}
        </FirebaseDatabaseMutation>
      </>
    );
  }
}

export { QuizNew };
