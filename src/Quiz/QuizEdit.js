import {
  FirebaseDatabaseNode,
  FirebaseDatabaseMutation,
} from '@react-firebase/database';
import { Form, Button } from 'react-bootstrap';
const { Component } = require('react');

class QuizEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const btn_back = (
      <Button
        className='mt-2'
        size='sm'
        onClick={() => {
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
        <FirebaseDatabaseNode path={`posts/${this.props.pagedata.idx}`}>
          {(d) => {
            if (d.isLoading === null || d.isLoading || d.value === null)
              return <>Loading...</>;
            const post = d.value;
            return (
              <FirebaseDatabaseMutation
                path={`posts/${this.props.pagedata.idx}`}
                type='update'
              >
                {({ runMutation }) => {
                  return (
                    <div className='m-3 mh-100'>
                      <Form
                        className='mh-100'
                        onSubmit={(e) => {
                          e.preventDefault();
                          const new_post = {
                            title: this.state.title || post.title,
                            md: this.state.md || post.md,
                            uid: post.uid,
                          };
                          (async () => {
                            await runMutation(new_post);
                            this.props.setpage('quiz_list');
                          })();
                        }}
                      >
                        {btn_back}
                        <Button className='mt-2 ml-2' size='sm' type='Submit'>
                          Save Changes
                        </Button>
                        <br />
                        <Form.Group controlId='title'>
                          <Form.Label>제목</Form.Label>
                          <Form.Control
                            type='text'
                            defaultValue={post.title}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId='md'>
                          <Form.Label>
                            {'내용(가릴 부분은 <, >로 감싸기)'}
                          </Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={8}
                            defaultValue={post.md}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Form>
                    </div>
                  );
                }}
              </FirebaseDatabaseMutation>
            );
          }}
        </FirebaseDatabaseNode>
      </>
    );
  }
}

export { QuizEdit };
