import { connect } from 'camo';
import path from 'path';

const dbPath = path.resolve('./db/nedb/');
const testDbPath = path.resolve('./test/db');

const env = process.env.NODE_ENV;
let uri;
if(env === 'test') {
  uri = `nedb://${testDbPath}`;
} else {
  uri = `nedb://${dbPath}`;
}

function connectDb() {
  return connect(uri).then(db => {
    console.log(`nedb connected in ${env}`);
    return db;
  });
}

export default connectDb;


