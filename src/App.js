import './App.css';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { QuizList } from './Quiz/QuizList';
import { QuizView } from './Quiz/QuizView';
import { QuizEdit } from './Quiz/QuizEdit';
import { QuizNew } from './Quiz/QuizNew';
import firebase from 'firebase/app';
import 'firebase/auth';
import { FirebaseDatabaseProvider } from '@react-firebase/database';
import {
  FirebaseAuthConsumer,
  FirebaseAuthProvider,
} from '@react-firebase/auth';


const firebaseConfig = require('./FirebaseConfig.json');

class TopMenu extends Component {
  render() {
    if (this.props.auth.isSignedIn)
      return (
        <div className='d-flex flex-row justify-content-end w-100 p-2 bg-dark'>
          <Button
            variant='outline-light'
            onClick={() => {
              firebase.auth().signOut();
            }}
          >
            Logout
          </Button>
        </div>
      );
    else {
      return (
        <div className='d-flex flex-row justify-content-end w-100 p-2 bg-dark'>
          <Button
            variant='outline-light'
            onClick={() => {
              const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
              firebase.auth().signInWithPopup(googleAuthProvider);
            }}
          >
            Login with Google
          </Button>
          <Button
            variant='outline-light'
            className='ml-3'
            onClick={() => {
              firebase.auth().signInAnonymously();
            }}
          >
            Just go
          </Button>
        </div>
      );
    }
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { page: 'quiz_list', pagedata: null };
  }
  render() {
    return (
      <div className='App vw-100 vh-100 d-flex flex-column justify-content-center align-items-center'>
        <FirebaseAuthProvider {...firebaseConfig} firebase={firebase}>
          <FirebaseDatabaseProvider {...firebaseConfig} firebase={firebase}>
            <FirebaseAuthConsumer>
              {(auth) => (
                <div className='w-100 h-100'>
                  <TopMenu auth={auth} />
                  {this.state.page === 'quiz_list' ? (
                    <QuizList
                      auth={auth}
                      pagedata={this.state.pagedata}
                      setpage={(page, pagedata) => {
                        this.setState({ page: page, pagedata: pagedata });
                      }}
                    />
                  ) : null}
                  {this.state.page === 'quiz_view' ? (
                    <QuizView
                      auth={auth}
                      pagedata={this.state.pagedata}
                      setpage={(page, pagedata) => {
                        this.setState({ page: page, pagedata: pagedata });
                      }}
                    />
                  ) : null}
                  {this.state.page === 'quiz_edit' ? (
                    <QuizEdit
                      auth={auth}
                      pagedata={this.state.pagedata}
                      setpage={(page, pagedata) => {
                        this.setState({ page: page, pagedata: pagedata });
                      }}
                    />
                  ) : null}
                  {this.state.page === 'quiz_new' ? (
                    <QuizNew
                      auth={auth}
                      pagedata={this.state.pagedata}
                      setpage={(page, pagedata) => {
                        this.setState({ page: page, pagedata: pagedata });
                      }}
                    />
                  ) : null}
                </div>
              )}
            </FirebaseAuthConsumer>
          </FirebaseDatabaseProvider>
        </FirebaseAuthProvider>
      </div>
    );
  }
}

export default App;
