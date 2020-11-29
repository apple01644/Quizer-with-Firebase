import 'firebase/database';
import { Card, Button } from 'react-bootstrap';
import { FirebaseDatabaseNode } from '@react-firebase/database';
const { Component } = require('react');

class QuizList extends Component {
  render() {
    return (
      <div className='my-auto'>
        <FirebaseDatabaseNode path='posts/'>
          {(d) => {
            if (d.isLoading === null || d.isLoading || d.value === null)
              return <>Loading...</>;
            return (
              <>
                <Button
                  className='mt-2 '
                  size='sm'
                  onClick={() => {
                    this.props.setpage('quiz_new');
                  }}
                >
                  New
                </Button>
                <div className='my-3'>
                  {Object.entries(d.value).map(([idx, post]) => (
                    <Card
                      className='mx-3 my-2'
                      key={idx}
                      onClick={() => {
                        this.props.setpage('quiz_view', { idx: idx });
                      }}
                    >
                      <Card.Body>{post.title}</Card.Body>
                    </Card>
                  ))}
                </div>
              </>
            );
          }}
        </FirebaseDatabaseNode>{' '}
      </div>
    );
  }
}

export { QuizList };
