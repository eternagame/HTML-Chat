interface State {
  postedMessages: Array<string>;
  firstConnection: boolean;
  toBePosted: Array<string>;
  connected: boolean;
  userData: {
      uid: number;
      username: string;
  }
}
let state: State = {
  postedMessages: [],
  firstConnection: true,
  toBePosted: [],
  connected: false,
  userData: {
      uid: 0,
      username: ''
  }
};

export {State, state}