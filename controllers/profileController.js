const Profile = require('../models/User');

exports.getInformation = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllInformation = async (req, res) => {
    try {
        const accounts = await Profile.find();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};