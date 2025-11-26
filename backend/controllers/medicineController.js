const Medicine = require("../models/medicine");

//create new medicine
exports.createMedicine = async (req, res) => {
    try {
        const medicineData = req.body;
        
        // Generate unique ID if not provided
        if (!medicineData.id) {
            medicineData.id = `M${Math.floor(10000 + Math.random() * 90000)}`;
        }

        // Set stock level based on quantity and threshold
        const quantity = parseInt(medicineData.quantity) || 0;
        const threshold = parseInt(medicineData.lowStockThreshold) || 10;
        medicineData.stockLevel = quantity <= threshold ? 'Low Stock' : 'In Stock';

        const medicine = new Medicine(medicineData);
        await medicine.save();
        res.status(201).json(medicine);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get recently added medicines (last 7 days by default)
exports.getMedicines = async (req,res) => {
    try{
        // Get days parameter from query, default to 7 days
        const days = parseInt(req.query.days) || 7;
        
        // Calculate date threshold
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        
        // Find medicines created within the specified time period
        const medicines = await Medicine.find({
            createdAt: { $gte: dateThreshold }
        }).sort({ createdAt: -1 }); // Sort by newest first
        
        res.json({
            medicines: medicines,
            message: `Showing medicines added in the last ${days} days`,
            totalCount: medicines.length,
            dateThreshold: dateThreshold
        });
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

// Get all medicines (for admin purposes or when you need to see everything)
exports.getAllMedicines = async (req,res) => {
    try{
        const medicines = await Medicine.find().sort({ createdAt: -1 });
        res.json({
            medicines: medicines,
            message: "All medicines retrieved",
            totalCount: medicines.length
        });
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single medicine
exports.getMedicineById = async (req,res) => {
    try{
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({message:"Medicine not found"});
        res.json(medicine);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update medicine
exports.updateMedicine = async (req, res) => {
    try{
        const updateData = req.body;
        
        // Update stock level based on quantity and threshold
        if (updateData.quantity !== undefined || updateData.lowStockThreshold !== undefined) {
            const quantity = parseInt(updateData.quantity) || 0;
            const threshold = parseInt(updateData.lowStockThreshold) || 10;
            updateData.stockLevel = quantity <= threshold ? 'Low Stock' : 'In Stock';
        }

        const updated = await Medicine.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true}
        );
        if(!updated) return res.status(404).json({message: "Medicine not found"});
        
        // Create notification for medicine update
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            medicineID: req.params.id,
            message: `Medicine "${updated.medicineName}" has been updated`,
            type: 'medicine_updated',
            category: 'medicine'
        });
        await notification.save();
        
        res.json({
            medicine: updated,
            notification: {
                message: "Medicine updated and notification sent"
            }
        });
    } catch (error) {
        res.status(400).json({message:error.message});
    }
};

//Delete medicine
exports.deleteMedicine = async (req, res) => {
    try{
        const deleted = await Medicine.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Medicine not found"});
        
        // Create notification for medicine deletion
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            medicineID: req.params.id,
            message: `Medicine "${deleted.medicineName}" has been removed from stock`,
            type: 'medicine_deleted',
            category: 'medicine'
        });
        await notification.save();
        
        res.json({
            message: "Medicine deleted",
            notification: {
                message: "Medicine deleted and notification sent"
            }
        });
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Get medicine by name
exports.getMedicineByName = async (req, res) => {
    try {
        const { medicineName } = req.params;
        const medicine = await Medicine.findOne({ medicineName });
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicine statistics
exports.getMedicineStats = async (req, res) => {
    try {
        const medicines = await Medicine.find();
        const total = medicines.length;
        
        // Calculate low stock items
        const lowStock = medicines.filter(medicine => {
            const currentStock = parseInt(medicine.quantity) || 0;
            const threshold = parseInt(medicine.lowStockThreshold) || 10;
            return currentStock <= threshold;
        }).length;

        // Calculate expiring soon items (within next 30 days by default)
        const expiryDays = 30;
        const today = new Date();
        const expiringSoon = medicines.filter(medicine => {
            if (!medicine.expiryDate) return false;
            const expiryDate = new Date(medicine.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= expiryDays && daysUntilExpiry >= 0;
        }).length;

        res.json({
            total,
            lowStock,
            expiringSoon
        });
    } catch (error) {
        console.error('Error getting medicine stats:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search medicines in database
exports.searchMedicines = async (req, res) => {
    try {
        console.log('Search endpoint called with query:', req.query);
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            console.log('Empty query provided');
            return res.json({
                medicines: [],
                message: "Please provide a search query",
                totalCount: 0
            });
        }

        console.log('Searching for:', query);
        // Search in medicine name, brand, and category
        const searchRegex = new RegExp(query, 'i'); // Case insensitive search
        
        const medicines = await Medicine.find({
            $or: [
                { medicineName: searchRegex },
                { brand: searchRegex },
                { category: searchRegex }
            ]
        }).sort({ createdAt: -1 });

        console.log('Found medicines:', medicines.length);
        res.json({
            medicines: medicines,
            message: `Found ${medicines.length} medicines matching "${query}"`,
            totalCount: medicines.length,
            searchQuery: query
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get medicines by category
exports.getMedicinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        const medicines = await Medicine.find({ category: category }).sort({ createdAt: -1 });
        
        res.json({
            medicines: medicines,
            message: `Found ${medicines.length} medicines in category "${category}"`,
            totalCount: medicines.length,
            category: category
        });
    } catch (error) {
        console.error('Error fetching medicines by category:', error);
        res.status(500).json({ message: error.message });
    }
};
