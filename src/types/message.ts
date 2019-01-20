import { User } from './user';

export class Message{
    content: string;
    sender: User;
    isHistory: boolean;
    constructor(content: string, sender?: User, isHistory: boolean = false){
        this.content = content;
        this.sender = sender || User.annonymous;
        this.isHistory = isHistory;
    }
}
