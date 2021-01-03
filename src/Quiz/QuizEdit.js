import {
  FirebaseDatabaseNode,
  FirebaseDatabaseMutation,
} from '@react-firebase/database';
import { Form, Button } from 'react-bootstrap';
import { Component, createRef } from 'react';
import ReactMarkdown from 'react-markdown';

class QuizEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.markdown_viewer = createRef();
  }
  render() {
    const btn_back = (
      <Button
        className='mt-2'
        size='sm'
        variant='danger'
        onClick={() => {
          if (window.confirm('Do you really want to discard changes?'))
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
            if (post.category === undefined) post.category = null;
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
                            category: post.category,
                            uid: post.uid,
                          };
                          if (this.state.category !== undefined)
                            new_post.category = this.state.category;
                          if (
                            new_post.category !== null &&
                            new_post.category.length === 0
                          )
                            new_post.category = null;
                          console.log(this.state);
                          console.log(new_post);
                          (async () => {
                            await runMutation(new_post);
                            this.props.setpage('quiz_view', {
                              idx: this.props.pagedata.idx,
                            });
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
                        <Form.Group controlId='category'>
                          <Form.Label>카테고리</Form.Label>
                          <Form.Control
                            type='text'
                            defaultValue={post.category}
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
                            onChange={(e) => {
                              handleChange(e);
                              console.log(e, this.markdown_viewer);
                            }}
                          />
                        </Form.Group>
                      </Form>
                      <ReactMarkdown
                        className='border'
                        ref={this.markdown_viewer}
                      />
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
