import { Form, Button } from 'react-bootstrap';
import { Component } from 'react';

class QuizNew extends Component {
  constructor(props) {
    super(props);
    this.state = { category: null };
  }
  render() {
    const btn_back = (
      <Button
        className=' mb-2'
        variant='danger'
        size='sm'
        onClick={() => {
          if (window.confirm('Do you really want to cancel creating new quiz?'))
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
        <div className='m-3 mh-100'>
          <Form
            className='mh-100'
            onSubmit={(e) => {
              e.preventDefault();
              const new_post = {
                title: this.state.title,
                md: this.state.md,
                category: this.state.category,
                uid: this.props.auth.user.uid,
              };
              (async () => {
                // TODO: go to list
              })();
            }}
          >
            {btn_back}
            <Button
              className='ml-2 mb-2'
              size='sm'
              type='Submit'
              variant='success'
            >
              Create Quiz
            </Button>
            <br />
            <Form.Group controlId='title' className='mb-2'>
              <Form.Control
                type='text'
                placeholder='여기에 제목 입력'
                onChange={handleChange}
                className='py-0'
              />
            </Form.Group>
            <Form.Group controlId='category' className='mb-2'>
              <Form.Control
                type='text'
                placeholder='여기에 카테고리 입력'
                onChange={handleChange}
                className='py-0'
              />
            </Form.Group>
            <Form.Group controlId='md' className='mb-2'>
              <Form.Control
                as='textarea'
                rows={8}
                placeholder='여기에 내용 입력'
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </div>
      </>
    );
  }
}

export { QuizNew };
