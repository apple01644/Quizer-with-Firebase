import { Card, Button, Form, Accordion } from 'react-bootstrap';
import { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      posts_of_this_category: [],
      chapters_of_this_category: [],
      post_summary_group_by_chapter: {},

      checkstate_of_posts: {},

      categories: [],
    };
  }

  selectCategory(category_name) {
    this.setState({
      posts_of_this_category: [],
      chapters_of_this_category: [],
      post_summary_group_by_chapter: {},
    });
    const chapter_unordered_set = {};
    const checkstate_of_posts = {};
    const posts_of_this_category = Object.entries(this.state.posts).filter(
      ([post_id, post]) => {
        return post.category === category_name;
      }
    );

    Object.entries(posts_of_this_category).forEach(
      ([__unused__, [post_id, post]]) => {
        const chapter = post.chapter;
        if (!(chapter in chapter_unordered_set))
          chapter_unordered_set[chapter] = [];
        chapter_unordered_set[chapter].push([post_id, post.title]);
        checkstate_of_posts[post_id] = false;
      }
    );

    const chapter_ordered_set = {};
    Object.keys(chapter_unordered_set)
      .sort()
      .forEach(function (key) {
        chapter_ordered_set[key] = chapter_unordered_set[key].sort();
      });

    this.setState({
      chapters_of_this_category: Object.keys(chapter_ordered_set),
      post_summary_group_by_chapter: chapter_ordered_set,
      posts_of_this_category: posts_of_this_category,
      checkstate_of_posts: checkstate_of_posts,
    });
  }

  componentDidMount() {
    firebase
      .database()
      .ref('/posts/')
      .once('value')
      .then((s) => {
        const posts_db = s.val();
        const category_set = {};
        Object.entries(posts_db).forEach(([post_id, post], incr) => {
          const category = post.category;
          category_set[category] = null;
        });
        this.setState({
          posts: posts_db,
          categories: Object.keys(category_set),
        });

        const params = new URLSearchParams(this.props.location.search);
        if (
          !params.has('category') ||
          !(params.get('category') in category_set)
        ) {
          this.props.history.push(`/`);
          this.selectCategory('미분류');
        } else this.selectCategory(params.get('category'));
      });
  }

  handleChange = (e) => {
    const { id, value } = e.target;
    this.setState({
      [id]: value,
    });
  };

  selectedQuizzes() {
    const quizzes = [];
    Object.entries(this.state.checkstate_of_posts).forEach(([key, value]) => {
      if (value) quizzes.push(key);
    });
    return quizzes;
  }

  startQuiz() {
    const quizzes = this.selectedQuizzes();
    if (quizzes.length > 0) this.props.setpage('quiz_game', { list: quizzes });
  }

  hasQuiz() {
    const quizzes = this.selectedQuizzes();
    return quizzes.length !== 0;
  }

  render() {
    const crud_bar = (
      <div className='mb-2'>
        <Link
          to={`/new_post`}
          children={
            <Button
              className='mt-2 '
              size='sm'
              disabled={!this.props.isAuth}
              children={'New'}
            />
          }
        />
        <Button
          className='mt-2 ml-2'
          size='sm'
          variant='info'
          onClick={() => this.startQuiz()}
          disabled={!this.hasQuiz()}
          children={'Start Quiz'}
        />
      </div>
    );

    const category_bar = (
      <div
        className='btn-group btn-group-toggle align-self-center mb-2'
        data-toggle='buttons'
      >
        {this.state.categories.map((category_name, idx) => (
          <Button
            key={idx}
            size='sm'
            variant='secondary'
            className='d-inline-flex'
            children={category_name}
            onClick={() => {
              this.props.history.push(`/?category=${category_name}`);
              this.selectCategory(category_name);
            }}
          />
        ))}
      </div>
    );

    return (
      <div className='flex-fill d-flex flex-column align-self-stretch'>
        {crud_bar}
        {category_bar}
        <Accordion defaultActiveKey='0'>
          {Object.entries(this.state.post_summary_group_by_chapter).map(
            ([chapter_name, posts], category_id) => (
              <Card key={category_id} className='border-0 rounded-0"'>
                <div className='d-flex flex-row bg-success align-items-center'>
                  <Form.Check
                    type='checkbox'
                    value={chapter_name}
                    onChange={(e) => {
                      const query = {};
                      for (const [post_id] of this.state
                        .post_summary_group_by_chapter[chapter_name]) {
                        query[post_id] = e.target.checked;
                      }
                      this.setState({ checkstate_of_posts: query });
                    }}
                  />
                  <Accordion.Toggle
                    as={Button}
                    variant='transperent'
                    className='flex-fill p-0 rounded-0 border-0 text-white'
                    eventKey={category_id.toString()}
                    children={chapter_name}
                  />
                </div>
                <Accordion.Collapse eventKey={category_id.toString()}>
                  <Card.Body className='p-0 border-bottom border-secondary'>
                    {posts.map(([post_id, post_name], post_incr) => (
                      <Form.Group
                        controlId={post_id}
                        key={post_incr}
                        className={
                          'd-flex flex-row align-items-center m-0' +
                          (post_incr % 2 === 0 ? ' bg-white' : ' bg-light')
                        }
                      >
                        <Form.Check
                          type='checkbox'
                          onChange={(e) => {
                            this.setState({
                              checkstate_of_posts: Object.assign(
                                this.state.checkstate_of_posts,
                                {
                                  [post_id]: e.target.checked,
                                }
                              ),
                            });
                          }}
                          checked={this.state.checkstate_of_posts[post_id]}
                        />
                        <div className='flex-fill'>
                          <Link
                            to={`/view?post_id=${post_id}`}
                            children={
                              <Button
                                className='px-0 py-1'
                                variant='white'
                                size='sm'
                                children={post_name}
                              />
                            }
                          />
                        </div>
                      </Form.Group>
                    ))}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            )
          )}
        </Accordion>
      </div>
    );
  }
}

const QuizHome = withRouter(Main);
export { QuizHome };
