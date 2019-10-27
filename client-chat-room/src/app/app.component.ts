import { Component } from '@angular/core';
import Chatkit from '@pusher/chatkit-client';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Angular Chatroom';
  messages = [];
  users = [];
  currentUser: any;

  // tslint:disable-next-line:variable-name
  _username = '';
  get username(): string {
    return this._username;
  }
  set username(value: string) {
    this._username = value;
  }

  // tslint:disable-next-line:variable-name
  _message = '';
  get message(): string {
    return this._message;
  }
  set message(value: string) {
    this._message = value;
  }

  sendMessage() {
    const { message, currentUser } = this;
    currentUser.sendMessage({
      text: message,
      roomId: 'cbd17960-beeb-4bc7-b4d7-6c4cf2aa9d76',
    });
    this.message = '';
  }

  addUser() {
    const { username } = this;
    axios.post('http://localhost:5200/users', { username })
      .then(() => {
        const tokenProvider = new Chatkit.TokenProvider({
          url: 'http://localhost:5200/authenticate'
        });

        const chatManager = new Chatkit.ChatManager({
          instanceLocator: 'v1:us1:649678cd-29ee-418a-b100-30012bcd0d3a',
          userId: username,
          tokenProvider
        });

        return chatManager
          .connect()
          .then(currentUser => {
            currentUser.subscribeToRoom({
              roomId: 'cbd17960-beeb-4bc7-b4d7-6c4cf2aa9d76',
              messageLimit: 100,
              hooks: {
                onMessage: message => {
                  this.messages.push(message);
                },
                onPresenceChanged: (state, user) => {
                  this.users = currentUser.users.sort((a, b) => {
                    if (a.presence.state === 'online') {
                      return -1;
                    }
                    return 1;
                  });
                },
              },
            });

            this.currentUser = currentUser;
            this.users = currentUser.users;
          });
      })
      .catch(error => console.error(error));
  }
}
