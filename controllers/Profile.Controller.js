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
            email: user.email,
            address: [user.addresses],
            viewedProducts: [user.viewedProducts],
            purchasedProducts: [user.purchasedProducts]
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

exports.addAddress = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming userId is extracted from middleware, e.g., JWT
        console.log(userId);
        const { address } = req.body;

        if (!address || address.trim() === '') {
            return res.status(400).json({ message: 'Address is required' });
        }

        // Find the user and add the address
        const user = await Profile.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.push(address);
        await user.save();

        res.json({ message: 'Address added successfully', addresses: user.addresses });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};