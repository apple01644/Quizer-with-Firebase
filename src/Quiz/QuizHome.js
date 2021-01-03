import { Card, Button, Form, Accordion } from 'react-bootstrap';
import { Component, createRef } from 'react';
import { Link } from 'react-router-dom';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

class QuizHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      post_with_categories: {},
      checkstate_of_posts: {},
    };
  }

  componentDidMount() {
    firebase
      .database()
      .ref('/posts/')
      .once('value')
      .then((s) => {
        const posts_db = s.val();
        const categories = { '0.other': [] };

        const checkstate_of_posts = {};

        Object.entries(posts_db).forEach(([post_id, post], incr) => {
          checkstate_of_posts[post_id] = false;
          let category = post.category || '0.other';
          if (category.length === 0) category = '0.other';

          if (!(category in categories)) categories[category] = [];
          categories[category].push([post_id, post]);
        });
        this.setState({ checkstate_of_posts: checkstate_of_posts });

        const ordered_categories = {};
        Object.keys(categories)
          .sort()
          .forEach(function (key) {
            ordered_categories[key] = categories[key];
          });

        for (const category_name in ordered_categories) {
          ordered_categories[category_name].sort((a, b) =>
            a[1].title.localeCompare(b[1].title)
          );
        }

        this.setState({
          post_with_categories: ordered_categories,
          posts: posts_db,
        });
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
    return (
      <div className='flex-fill d-flex flex-column align-self-stretch'>
        <div className='mb-2'>
          <Button
            className='mt-2 '
            size='sm'
            onClick={() => {
              this.props.setpage('quiz_new');
            }}
            disabled={!this.props.isAuth}
          >
            New
          </Button>
          <Button
            className='mt-2 ml-2'
            size='sm'
            variant='info'
            onClick={() => this.startQuiz()}
            disabled={!this.hasQuiz()}
          >
            Start Quiz
          </Button>
        </div>
        <div className=''>
          <Accordion defaultActiveKey='0'>
            {Object.entries(this.state.post_with_categories).map(
              ([category_name, posts], category_id) => (
                <Card key={category_id} className='border-0 rounded-0"'>
                  <div className='d-flex flex-row bg-success align-items-center'>
                    <Form.Check
                      type='checkbox'
                      value={category_name}
                      onChange={(e) => {
                        const query = {};
                        for (const [post_id, post] of this.state
                          .post_with_categories[category_name]) {
                          console.log(post_id, 'checking', e.target.checked);
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
                    >
                      {category_name}
                    </Accordion.Toggle>
                  </div>
                  <Accordion.Collapse eventKey={category_id.toString()}>
                    <Card.Body className='p-0 border-bottom border-secondary'>
                      {posts.map(([post_id, post], post_incr) => (
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
                            onClick={(e) => {
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
                          <div className='flex-fill '>
                            <Link to={`/view?page=${post_id}`}>
                              <Button
                                className='px-0 py-1'
                                variant='white'
                                size='sm'
                              >
                                {post.title}
                              </Button>
                            </Link>
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
      </div>
    );
  }
}

export { QuizHome };
