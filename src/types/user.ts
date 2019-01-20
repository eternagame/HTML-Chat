export class User{
    static annonymous = new User("");
    username: string;
    constructor(username: string)
    {
        this.username = username;
    }
}
