const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    position:{
        type:String,
    },
    profile: {
        firstName: String,
        lastName: String,
        avatarUrl: String,
        bio: String
    },
    preferences: {
        darkMode: Boolean,
        notificationEnabled: Boolean
    }
}, {
    timestamps: true
});

// Middleware to hash password before saving
// UserSchema.pre('save', function(next) {
//     const user = this;
//     if (!user.isModified('password')) return next();

//     bcrypt.hash(user.password, 10, (err, hash) => {
//         if (err) return next(err);
//         user.password = hash;
//         next();
//     });
// });

// Method to compare hashed password
UserSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);
