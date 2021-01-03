import './App.css';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QuizHome } from './Quiz';

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

class App extends Component {
  constructor(props) {
    super(props);
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    this.state = { currentUser: firebase.auth().currentUser };
  }

  render() {
    console.log(this.props);

    return (
      <Router>
        <div className='App'>
          <Switch>
            <Route path='/about'>1</Route>
            <Route path='/topics'>2</Route>
            <Route path='/'>
              <TopMenu
                isAuth={this.state.currentUser !== null}
                onChange={() =>
                  this.setState({ currentUser: firebase.auth().currentUser })
                }
              />
              <QuizHome isAuth={this.state.currentUser !== null} />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
