import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    'id': Number,
    'ids': Array
});

const users = mongoose.model('users', userSchema);

export default users;