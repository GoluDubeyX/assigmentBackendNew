const mongoose = require('mongoose');
const faker = require("faker");

mongoose.connect("mongodb://localhost:27017/property-listing")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

const propertySchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: String,
  description: String,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  propertyType: String,
  status: String,
  images: [String],
}, { timestamps: true });

const Property = mongoose.model("Property", propertySchema);

const generateFakeProperty = () => ({
  title: faker.lorem.words(3),
  price: faker.datatype.number({ min: 5000, max: 500000 }),
  location: faker.address.city(),
  description: faker.lorem.sentence(),
  bedrooms: faker.datatype.number({ min: 1, max: 5 }),
  bathrooms: faker.datatype.number({ min: 1, max: 4 }),
  area: faker.datatype.number({ min: 500, max: 5000 }),
  propertyType: faker.random.arrayElement([
    "Villa", "Apartment", "House", "Flat"
  ]),
  status: faker.random.arrayElement([
    "Available", "Rented", "Sold"
  ]),
  images: []
});

const seedData = async () => {
  try {
    await Property.deleteMany();

    const fakeData = Array.from({ length: 20 }, generateFakeProperty);

    await Property.insertMany(fakeData);

    console.log("✅ Fake Data Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();