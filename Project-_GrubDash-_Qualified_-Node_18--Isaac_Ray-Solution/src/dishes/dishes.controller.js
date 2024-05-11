const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// List all dishes
function list(req, res) {
  res.json({ data: dishes });
}

// Create a new dish
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// Read a specific dish
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// Update a specific dish
function update(req, res) {
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    if (id && id !== dishId) {
      return res.status(400).json({ error: `Invalid ID ${id}`});
    }

    const dish = res.locals.dish;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({ data: dish });
}

// Middleware to find a dish by ID
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish not found: ${dishId}`,
  });
}
function validateDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Dish must include a name" });
    }
    if (!description) {
        return res.status(400).json({ error: "Dish must include a description" });
    }
    if (price === undefined) {
        return res.status(400).json({ error: "Dish must include a price" });
    }
    if (price <= 0 || typeof price !== 'number') {
        return res.status(400).json({ error: "Dish must have a price that is an integer greater than 0" });
    }
    if (!image_url) {
        return res.status(400).json({ error: "Dish must include an image_url" });
    }

    next();
}
module.exports = {
    list,
    create: [validateDish, create],
    read: [dishExists, read],
    update: [dishExists, validateDish, update]
};