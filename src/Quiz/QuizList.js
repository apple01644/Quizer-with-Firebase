import 'firebase/database';
import { Card, Button, Form } from 'react-bootstrap';
import { FirebaseDatabaseNode } from '@react-firebase/database';
const { Component } = require('react');

class QuizList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const handleChange = (e) => {
      const { id, value } = e.target;
      this.setState({
        [id]: value,
      });
    };
    return (
      <div className='my-auto'>
        <FirebaseDatabaseNode path='posts/'>
          {(d) => {
            if (d.isLoading === null || d.isLoading || d.value === null)
              return <>Loading...</>;
            return (
              <>
                {this.props.auth.isSignedIn ? (
                  <Button
                    className='mt-2 '
                    size='sm'
                    onClick={() => {
                      this.props.setpage('quiz_new');
                    }}
                  >
                    New
                  </Button>
                ) : null}
                <Button
                  className='mt-2 ml-2'
                  size='sm'
                  onClick={() => {
                    const quizzes = [];
                    Object.entries(this.state).forEach(([key, value]) => {
                      if (value) quizzes.push(key);
                    });
                    if (quizzes.length > 0)
                      this.props.setpage('quiz_game', { list: quizzes });
                  }}
                >
                  Start Quiz
                </Button>
                <Form className='my-3'>
                  {Object.entries(d.value).map(([idx, post]) => (
                    <Card className='mx-3 my-2' key={idx}>
                      <Form.Group
                        controlId={`${idx}`}
                        className='d-flex flex-row justify-content-center align-items-center m-0'
                      >
                        <Form.Check type='checkbox' onChange={handleChange} />
                        <Button
                          variant='white'
                          onClick={() => {
                            this.props.setpage('quiz_view', { idx: idx });
                          }}
                        >
                          {post.title}
                        </Button>
                      </Form.Group>
                    </Card>
                  ))}
                </Form>
              </>
            );
          }}
        </FirebaseDatabaseNode>
      </div>
    );
  }
}

export { QuizList };
