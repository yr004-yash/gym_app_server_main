const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        default: 30,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;