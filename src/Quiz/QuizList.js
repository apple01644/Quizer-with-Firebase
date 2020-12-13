import 'firebase/database';
import { Card, Button, Form, Accordion } from 'react-bootstrap';
import { FirebaseDatabaseNode } from '@react-firebase/database';
import { Component, createRef } from 'react';

class QuizList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkboxes = {};
  }

  QuizListWithCategory(posts_db) {
    const handleChange = (e) => {
      const { id, value } = e.target;
      this.setState({
        [id]: value,
      });
    };

    const categories = { '0.other': [] };
    Object.entries(posts_db).forEach(([post_id, post], incr) => {
      this.checkboxes[post_id] = this.checkboxes[post_id] || createRef();
      let category = post.category || '0.other';
      if (category.length === 0) category = '0.other';

      if (!(category in categories)) categories[category] = [];
      categories[category].push([post_id, post]);
    });

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

    return (
      <Accordion defaultActiveKey='0'>
        {Object.entries(ordered_categories).map(
          ([category_name, posts], category_id) => (
            <Card key={category_id} className='border-0 rounded-0"'>
              <div className='d-flex flex-row bg-success align-items-center'>
                <Form.Check
                  type='checkbox'
                  onChange={(e) => {
                    const query = {};
                    posts.forEach(([post_idx]) => {
                      query[post_idx] = e.target.checked;
                      this.checkboxes[post_idx].current.checked =
                        e.target.checked;
                    });
                    this.setState(query);
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
                  {posts.map(([post_idx, post], post_incr) => (
                    <Form.Group
                      controlId={post_idx}
                      key={post_incr}
                      className={
                        'd-flex flex-row align-items-center m-0' +
                        (post_incr % 2 === 0 ? ' bg-white' : ' bg-light')
                      }
                    >
                      <Form.Check
                        type='checkbox'
                        onChange={handleChange}
                        ref={this.checkboxes[post_idx]}
                      />
                      <div className='flex-fill '>
                        <Button
                          className='px-0 py-1'
                          variant='white'
                          size='sm'
                          onClick={() => {
                            this.props.setpage('quiz_view', {
                              idx: post_idx,
                            });
                          }}
                        >
                          {post.title}
                        </Button>
                      </div>
                    </Form.Group>
                  ))}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          )
        )}
      </Accordion>
    );
  }

  render() {
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
                  variant='info'
                  onClick={() => {
                    const quizzes = [];
                    Object.entries(this.state).forEach(([key, value]) => {
                      if (value) quizzes.push(key);
                    });
                    if (quizzes.length > 0)
                      this.props.setpage('quiz_game', { list: quizzes });
                  }}
                  disable={(() => {
                    const quizzes = [];
                    Object.entries(this.state).forEach(([key, value]) => {
                      if (value) quizzes.push(key);
                    });
                    return quizzes.length === 0;
                  })().toString()}
                >
                  Start Quiz
                </Button>
                <Form className='my-3'>
                  {this.QuizListWithCategory(d.value)}
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
