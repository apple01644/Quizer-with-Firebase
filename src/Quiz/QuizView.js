import {
  FirebaseDatabaseNode,
  FirebaseDatabaseMutation,
} from '@react-firebase/database';
import { createRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { MarkdownReader } from './MarkdownReader';
const { Component } = require('react');

class QuizView extends Component {
  markdown_reader = createRef();
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
    return (
      <>
        <FirebaseDatabaseNode path={`posts/${this.props.pagedata.idx}`}>
          {(d) => {
            if (d.isLoading === null || d.isLoading || d.value === null)
              return (
                <>
                  {btn_back}
                  <br />
                  Loading...
                </>
              );
            const post = d.value;
            return (
              <>
                {btn_back}

                {this.props.auth.isSignedIn &&
                this.props.auth.user.uid === post.uid ? (
                  <>
                    <Button
                      className='mt-2 ml-2'
                      size='sm'
                      variant='warning'
                      onClick={() => {
                        this.props.setpage('quiz_edit', {
                          idx: this.props.pagedata.idx,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <FirebaseDatabaseMutation
                      path={`posts/${this.props.pagedata.idx}`}
                      type='set'
                    >
                      {({ runMutation }) => {
                        return (
                          <Button
                            className='mt-2 ml-2'
                            size='sm'
                            variant='danger'
                            onClick={() => {
                              (async () => {
                                const result = await runMutation(null);
                                console.log(result);
                                this.props.setpage('quiz_list');
                              })();
                            }}
                          >
                            Delete
                          </Button>
                        );
                      }}
                    </FirebaseDatabaseMutation>
                  </>
                ) : null}
                <Button
                  className='mt-2 ml-2'
                  variant='info'
                  size='sm'
                  onClick={() => {
                    this.props.setpage('quiz_game', {
                      list: [this.props.pagedata.idx],
                    });
                  }}
                >
                  Quiz
                </Button>
                <Button
                  className='mt-2 ml-2'
                  variant='secondary'
                  size='sm'
                  onClick={() => this.markdown_reader.current.hideAll()}
                >
                  Mask
                </Button>
                <br />
                <div className='m-3 mh-100'>
                  <Card className='mh-100'>
                    <Card.Body>
                      <Card.Title>{post.title}</Card.Title>
                      <MarkdownReader
                        value={post.md}
                        ref={this.markdown_reader}
                      />
                    </Card.Body>
                  </Card>
                </div>
              </>
            );
          }}
        </FirebaseDatabaseNode>
      </>
    );
  }
}

export { QuizView };
