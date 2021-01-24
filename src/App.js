import './App.css';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from 'react-router-dom';
import { QuizHome } from './Quiz';
import { MarkdownReaderV2 } from './Quiz/MarkdownReader';
import { QuizView } from './Quiz/QuizView';
import { QuizNew } from './Quiz/QuizNew';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import { Form } from 'react-bootstrap';

const firebaseConfig = require('./FirebaseConfig.json');

class TopMenu extends Component {
  render() {
    return (
      <div className='d-flex flex-row justify-content-end w-100 p-2 bg-dark '>
        {this.props.isAuth ? (
          <Button
            variant='outline-light'
            onClick={() => {
              firebase
                .auth()
                .signOut()
                .then(() => this.props.onChange())
                .catch((error) => {
                  console.log(error);
                  alert(error.message);
                  this.props.onChange();
                });
            }}
          >
            Logout
          </Button>
        ) : (
          <Button
            variant='outline-light'
            onClick={() => {
              const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
              firebase
                .auth()
                .signInWithPopup(googleAuthProvider)
                .then((e) => this.props.onChange())
                .catch((error) => {
                  console.log(error);
                  alert(error.message);
                  this.props.onChange();
                });
            }}
          >
            Login
          </Button>
        )}
      </div>
    );
  }
}

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post_data: { md: '', category: null, title: '', uid: null },
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const page_id = params.get('page');
    firebase
      .database()
      .ref(`/posts/${page_id}`)
      .once('value')
      .then((s) => {
        const post_db = s.val();
        this.setState({ post_data: post_db });
      });
  }

  render() {
    return (
      <div className='m-3 flex-fill d-flex flex-row w-100 h-100 justify-content-around text-left'>
        <Form.Control
          as='textarea'
          className='mx-3 px-3 py-2'
          style={{ resize: 'None' }}
          onChange={(e) => this.setState({ data: e.target.value })}
        />
        <MarkdownReaderV2 data={this.state.post_data.md} />
      </div>
    );
  }
}
const EditorwithRouter = withRouter(Editor);

class App extends Component {
  constructor(props) {
    super(props);
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    this.state = { currentUser: firebase.auth().currentUser };
  }

  render() {
    const common_properties = {
      isAuth: this.state.currentUser !== null,
      User: this.state.currentUser,
    };
    return (
      <Router>
        <div className='App'>
          <Switch>
            <Route path='/new_post'>
              <QuizNew {...common_properties} />
            </Route>
            <Route path='/view'>
              <QuizView {...common_properties} />
            </Route>
            <Route path='/'>
              <TopMenu
                {...common_properties}
                onChange={() =>
                  this.setState({ currentUser: firebase.auth().currentUser })
                }
              />
              <QuizHome {...common_properties} />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
