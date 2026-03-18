const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    max: [10, 'Bedrooms cannot exceed 10']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    max: [10, 'Bathrooms cannot exceed 10']
  },
  area: {
    type: Number,
    min: [0, 'Area cannot be negative']
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Villa', 'Commercial', 'Land'],
    default: 'Apartment'
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Rented', 'Under Contract'],
    default: 'Available'
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

propertySchema.index({ location: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text' });


propertySchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(this.price);
});


propertySchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    price: this.formattedPrice,
    location: this.location,
    type: this.propertyType
  };
};

module.exports = mongoose.model('Property', propertySchema);