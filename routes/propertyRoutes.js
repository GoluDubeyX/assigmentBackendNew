const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();
const {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');

// Validation rules
const propertyValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom(value => value >= 0).withMessage('Price cannot be negative'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 10 }).withMessage('Bedrooms must be between 0 and 10'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0, max: 10 }).withMessage('Bathrooms must be between 0 and 10'),
  body('area')
    .optional()
    .isNumeric().withMessage('Area must be a number')
    .custom(value => value >= 0).withMessage('Area cannot be negative'),
  body('propertyType')
    .optional()
    .isIn(['Apartment', 'House', 'Villa', 'Commercial', 'Land']).withMessage('Invalid property type'),
  body('status')
    .optional()
    .isIn(['Available', 'Sold', 'Rented', 'Under Contract']).withMessage('Invalid status')
];

// Routes
router.route('/')
  .post(propertyValidation, addProperty)
  .get(getProperties);

router.route('/:id')
  .get([
    param('id').isMongoId().withMessage('Invalid property ID')
  ], getPropertyById)
  .put([
    param('id').isMongoId().withMessage('Invalid property ID'),
    ...propertyValidation
  ], updateProperty)
  .delete([
    param('id').isMongoId().withMessage('Invalid property ID')
  ], deleteProperty);

module.exports = router;