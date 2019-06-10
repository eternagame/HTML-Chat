export default function generateNick(username: string, connectionNubmer: number) {
  return `${username.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, '_').replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, '-').substr(0, 27)}^${connectionNubmer}`;
}
