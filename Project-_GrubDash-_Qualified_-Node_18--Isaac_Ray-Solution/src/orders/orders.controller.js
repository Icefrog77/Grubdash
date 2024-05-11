const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Validation for order existence
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    return res.status(404).json({ error: `Order not found: ${orderId}` });
}

// Validation for creating orders
function validateOrderCreate(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    if (!deliverTo) {
        return res.status(400).json({ error: "Order must include a deliverTo." });
    }
    if (!mobileNumber) {
        return res.status(400).json({ error: "Order must include a mobileNumber." });
    }
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: "Order must include at least one dish." });
    }
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== 'number') {
            return res.status(400).json({ error: `Dish ${index} must have a quantity that is a positive integer.` });
        }
    });

    next();
}

// Validation for updating orders
function validateOrderUpdate(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    const { orderId } = req.params;

    if (id && id !== orderId) {
        return res.status(400).json({ error: `Order id ${id} does not match route id.` });
    }
    if (!deliverTo) {
        return res.status(400).json({ error: "Order must include a deliverTo." });
    }
    if (!mobileNumber) {
        return res.status(400).json({ error: "Order must include a mobileNumber." });
    }
    if (!status || status === "invalid") {
        return res.status(400).json({ error: "Missing status." });
    }
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: "Order must include at least one dish." });
    }

    const invalidDish = dishes.find(dish => dish.quantity <= 0 || typeof dish.quantity !== 'number');
    if (invalidDish) {
        return res.status(400).json({
            error: `Each dish must have a quantity that is a positive integer, found quantity ${invalidDish.quantity} and id ${invalidDish.id}`
        });
    }  

    next();
}

// List all orders
function list(req, res) {
    res.json({ data: orders });
}

// Create a new order
function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// Read a specific order
function read(req, res) {
    res.json({ data: res.locals.order });
}

// Update a specific order
function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.status = status;

    res.json({ data: order });
  
}

// Delete a specific order
function deleteOrder(req, res) {
    const order_d = orders.find(order => order.id === req.params.orderId);
    const index = orders.indexOf(order_d)
    const status = order_d.status
    if (status !== "pending") {
        res.status(400).json({ error: "Order is not pending" });
    }
    else if (index > -1) {
        orders.splice(index, 1);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
}

module.exports = {
    list,
    create: [validateOrderCreate, create],
    read: [orderExists, read],
    update: [orderExists, validateOrderUpdate, update],
    delete: [orderExists, deleteOrder]
};