import './App.css';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QuizHome, QuizView, QuizNew, QuizEdit } from './Quiz';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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
              firebase
                .auth()
                .setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {
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

class App extends Component {
  constructor(props) {
    super(props);
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    this.state = { currentUser: firebase.auth().currentUser, posts: [] };
  }

  componentDidMount() {
    firebase
      .database()
      .ref('/posts/')
      .on('value', (s) => {
        this.setState({ posts: s.val() });
      });
  }

  render() {
    const common_properties = {
      isAuth: this.state.currentUser !== null,
      User: this.state.currentUser,
      posts: this.state.posts,
    };
    if (this.state.posts.length === 0) return <>Loading...</>;
    return (
      <Router>
        <div className='App'>
          <TopMenu
            {...common_properties}
            onChange={() => {
              this.setState({ currentUser: firebase.auth().currentUser });
              if (this.state.currentUser !== null) {
                firebase.auth().currentUser.getIdToken();
              }
            }}
          />
          <Switch>
            <Route
              path='/new_post'
              children={<QuizNew {...common_properties} />}
            />
            <Route
              path='/edit_post'
              children={<QuizEdit {...common_properties} />}
            />
            <Route
              path='/view'
              children={<QuizView {...common_properties} />}
            />
            <Route path='/'>
              <QuizHome {...common_properties} />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
