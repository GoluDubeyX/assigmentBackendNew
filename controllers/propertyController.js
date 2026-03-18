const Property = require('../models/Property');
const { validationResult } = require('express-validator');

//  Add a new property
//  POST /api/properties
//   Public
exports.addProperty = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const property = await Property.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Property added successfully',
      data: property
    });
  } catch (error) {
    console.error('Add Property Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate property entry'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add property',
      error: error.message
    });
  }
};

// Get all properties with filters
//  GET /api/properties
//  Public
exports.getProperties = async (req, res) => {
  try {
    const {
      location,
      maxPrice,
      minPrice,
      propertyType,
      status,
      bedrooms,
      sortBy,
      page = 1,
      limit = 10,
      search
    } = req.query;


    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

 
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    if (bedrooms) filter.bedrooms = Number(bedrooms);

  
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

  
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };


    const properties = await Property.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(); 

   
    const total = await Property.countDocuments(filter);

 
    const locations = await Property.distinct('location');

  
    const priceStats = await Property.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      },
      filters: {
        locations: locations.slice(0, 10),
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 }
      },
      data: properties
    });
  } catch (error) {
    console.error('Get Properties Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

// Get single property by ID
// GET /api/properties/:id
//  Public
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get Property Error:', error);
    
  
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
};

// Update property
//  PUT /api/properties/:id
//  Public
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('Update Property Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
};

//  Delete property
// DELETE /api/properties/:id
//  Public
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete Property Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
};