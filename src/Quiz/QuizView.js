import { Component, createRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { MarkdownReaderV2 } from './MarkdownReader';
import { QuizGame } from './';
import { Link, withRouter } from 'react-router-dom';

import firebase from 'firebase/app';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts_list: [],
      posts_count: 0,
      post_index_in_list: 0,

      post_data: undefined,
      post_id: null,

      prev_post_id: null,
      next_post_id: null,

      show_QuizGame: false,
    };
    this.now_index = 0;
    this.markdown_reader = createRef();
  }

  setPageList(posts) {
    const posts_of_this_category = Object.entries(posts).filter(
      ([post_id, post_data]) =>
        post_data.category === this.state.post_data.category
    );
    const posts_list = [];
    const chapter_unordered_set = {};

    Object.entries(posts_of_this_category).forEach(
      ([__unused__, [post_id, post]]) => {
        const chapter = post.chapter;
        if (!(chapter in chapter_unordered_set))
          chapter_unordered_set[chapter] = [];
        chapter_unordered_set[chapter].push([post_id, post.title]);
      }
    );

    Object.keys(chapter_unordered_set)
      .sort()
      .forEach((chapter) => {
        chapter_unordered_set[chapter]
          .sort((a, b) => a[1].localeCompare(b[1]))
          .forEach(([post_id, post]) => {
            posts_list.push(post_id);
          });
      });

    this.setState({
      posts_list: posts_list,
      posts_count: posts_list.length,
      post_index_in_list: posts_list.findIndex((e) => e === this.state.post_id),
    });
  }

  setNextPage(post_index_in_list) {
    const prev_post_id = this.state.posts_list[
      (post_index_in_list - 1 + this.state.posts_count) % this.state.posts_count
    ];
    const next_post_id = this.state.posts_list[
      (post_index_in_list + 1) % this.state.posts_count
    ];

    this.setState({
      prev_post_id: prev_post_id,
      next_post_id: next_post_id,
    });
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const post_id = params.get('post_id');
    this.setState({ post_id: post_id });
  }

  componentDidUpdate(prevProps, prevState, sanpshot) {
    if (
      this.state.post_data === undefined ||
      prevState.post_id !== this.state.post_id
    ) {
      const post_db = this.props.posts[this.state.post_id];
      if (post_db === undefined) {
        alert('잘못된 post_id 입니다. Home으로 이동합니다.');
        this.props.history.push('/');
      } else {
        this.setState({
          post_data: post_db,
        });
        if (this.state.posts_count !== 0) {
          this.setState({
            post_index_in_list: this.state.posts_list.findIndex(
              (e) => e === this.state.post_id
            ),
          });
        }
      }
    }
    if (
      (prevState.post_data === undefined &&
        this.state.post_data !== undefined) ||
      (prevState.post_data !== undefined &&
        prevState.post_data.category !== this.state.post_data.category)
    ) {
      this.setPageList(this.props.posts);
    }
    if (
      (prevState.posts_count === 0 && this.state.posts_count !== 0) ||
      prevState.post_index_in_list !== this.state.post_index_in_list
    ) {
      this.setNextPage(this.state.post_index_in_list);
    }
  }

  render() {
    if (this.state.post_data === undefined) return <>Loading...</>;
    let jsx_markdown_reader_v2 = undefined;
    try {
      jsx_markdown_reader_v2 = (
        <MarkdownReaderV2
          data={this.state.post_data.md}
          ref={this.markdown_reader}
        />
      );
    } catch (e) {
      jsx_markdown_reader_v2 = e;
    }
    return (
      <>
        {this.state.show_QuizGame !== undefined && (
          <QuizGame
            show={this.state.show_QuizGame}
            handleClose={() => this.setState({ show_QuizGame: false })}
            data={[this.state.post_id]}
            posts={this.props.posts}
          />
        )}
        <div className='d-flex pt-2'>
          {this.state.post_data && (
            <Link
              to={`/?category=${this.state.post_data.category}&chapter=${this.state.post_data.chapter}`}
              children={<Button size='sm' children={'Back to list'} />}
            />
          )}
          {this.props.isAuth &&
            this.state.post_data !== null &&
            this.props.User.uid === this.state.post_data.uid && (
              <>
                <Link to={`/edit_post?post_id=${this.state.post_id}`}>
                  <Button
                    className='ml-2'
                    size='sm'
                    variant='warning'
                    children={'Edit'}
                  />
                </Link>
                <Button
                  className='ml-2'
                  size='sm'
                  variant='danger'
                  onClick={() => {
                    if (this.state.post_id.length > 16)
                      if (
                        window.confirm(
                          'Do you really want to delete this quiz?'
                        )
                      ) {
                        firebase
                          .database()
                          .ref(`posts/${this.state.post_id}`)
                          .set(null)
                          .then(() => this.props.history.push(`/`))
                          .catch((e) => {
                            alert(e);
                            console.log(e);
                          });
                      }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          <Button
            className='ml-2'
            variant='info'
            size='sm'
            onClick={() => {
              this.setState({ show_QuizGame: true });
            }}
            children={'Quiz'}
          />
          <Button
            className='ml-2'
            variant='secondary'
            size='sm'
            onClick={() => this.markdown_reader.current.hideAll()}
            children={'Mask'}
          />
        </div>
        <br />
        <div className='m-3 mh-100 align-self-stretch'>
          <Card className='mh-100'>
            <Card.Body>
              <div className='d-flex flex-row flex-fill justify-content-between'>
                <Link to={`/view?post_id=${this.state.prev_post_id}`}>
                  <Button
                    className='mt-2 ml-2'
                    variant='secondary'
                    size='sm'
                    children={'◀'}
                    onClick={() => {
                      this.setState({ post_id: this.state.prev_post_id });
                      window.scrollY = 0;
                    }}
                  />
                </Link>
                <div>
                  <p
                    className='mb-0'
                    children={`${this.state.post_data.category}-${this.state.post_data.chapter}`}
                  />
                  <Card.Title
                    as='p'
                    className='font-weight-bold mb-2'
                    children={this.state.post_data.title}
                  />
                </div>
                <Link to={`/view?post_id=${this.state.next_post_id}`}>
                  <Button
                    className='mt-2 ml-2'
                    variant='secondary'
                    size='sm'
                    children={'▶'}
                    onClick={() => {
                      this.setState({ post_id: this.state.next_post_id });
                      window.scrollY = 0;
                    }}
                  />
                </Link>
              </div>
              {jsx_markdown_reader_v2}
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }
}

const QuizView = withRouter(Main);
export { QuizView };
