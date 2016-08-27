import { connect } from 'camo';
import path from 'path';

const dbPath = path.resolve('./db/nedb/');


let uri = `nedb://${dbPath}`;

function connectDb() {
  return connect(uri).then(db => {
    console.log(' nedb connected');
    return db;
  });
}

export default connectDb;


