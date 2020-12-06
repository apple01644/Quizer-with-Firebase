import {
  FirebaseDatabaseNode,
  FirebaseDatabaseMutation,
} from '@react-firebase/database';
import { createRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { MarkdownReader } from './MarkdownReader';
const { Component } = require('react');

class QuizView extends Component {
  constructor(props) {
    super(props);
    this.state = { post_list: null, post_count: 0, post: null };
    this.now_index = 0;
    this.markdown_reader = createRef();
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

    let firebase_posts_data = null;
    if (this.state.post_list === null) {
      firebase_posts_data = (
        <FirebaseDatabaseNode path='posts/'>
          {(d) => {
            if (d.value !== null) {
              const posts_db = d.value;
              const categories = { other: [] };
              Object.entries(posts_db).forEach(([post_id, post], incr) => {
                let category = post.category || 'other';
                if (category.length === 0) category = 'other';

                if (!(category in categories)) categories[category] = [];
                categories[category].push([post_id, post]);
              });

              const post_list = [];
              let now_index = 0;
              for (const category_name in categories) {
                categories[category_name].sort((a, b) =>
                  a[1].title.localeCompare(b[1].title)
                );
                let find_index = -1;
                categories[category_name].forEach(([post_id]) => {
                  if (post_id === this.props.pagedata.idx) {
                    find_index = post_list.length;
                  }
                  post_list.push(post_id);
                });
                if (find_index !== -1) now_index = find_index;
              }
              this.now_index = now_index;
              this.setState({
                post_list: post_list,
                post_count: post_list.length,
              });
            }
            return <></>;
          }}
        </FirebaseDatabaseNode>
      );
    }
    let firebase_this_post_data = null;
    if (this.state.post === null)
      firebase_this_post_data = (
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
            this.setState({ post: d.value });
            return <></>;
          }}
        </FirebaseDatabaseNode>
      );
    return (
      <>
        {firebase_this_post_data}
        <>
          {btn_back}

          {this.props.auth.isSignedIn &&
          this.state.post !== null &&
          this.props.auth.user.uid === this.state.post.uid ? (
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
                        if (
                          window.confirm(
                            'Do you really want to delete this quiz?'
                          )
                        )
                          (async () => {
                            await runMutation(null);
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
              {this.state.post !== null ? (
                <Card.Body>
                  <Card.Title className='font-weight-bold'>
                    {this.state.post.title}
                  </Card.Title>
                  <MarkdownReader
                    value={this.state.post.md}
                    ref={this.markdown_reader}
                  />
                </Card.Body>
              ) : null}
            </Card>
            {firebase_posts_data}
            <Button
              className='mt-2 ml-2'
              variant='secondary'
              size='sm'
              onClick={() => {
                const new_index =
                  (this.now_index - 1 + this.state.post_count) %
                  this.state.post_count;
                this.now_index = new_index;
                window.scrollY = 0;
                this.setState({ post: null });
                this.props.setpage('quiz_view', {
                  idx: this.state.post_list[new_index],
                });
              }}
            >
              ◀
            </Button>
            <Button
              className='mt-2 ml-2'
              variant='secondary'
              size='sm'
              onClick={() => {
                const new_index = (this.now_index + 1) % this.state.post_count;
                this.now_index = new_index;
                window.scrollY = 0;
                this.setState({ post: null });
                this.props.setpage('quiz_view', {
                  idx: this.state.post_list[new_index],
                });
              }}
            >
              ▶
            </Button>
          </div>
        </>
      </>
    );
  }
}

export { QuizView };
