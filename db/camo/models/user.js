import path from 'path';
import { Document, EmbeddedDocument } from 'camo';

class User extends Document {
  constructor() {
    super();

    this.email = String;
    this.firstName = String;
    this.lastName = String;
    this.createdAt = {
      type: Date,
      default: new Date()
    }
    this.auth = [Auth];
  }

}

class Auth extends EmbeddedDocument {
  constructor() {
    super();

    this.type = {
      type: String,
      choices: [
        'google', 
        'linkedin', 
        'facebook',
        'twitter',
      ]
    };
    this.profile = Object;
  }
}

export { User, Auth }
