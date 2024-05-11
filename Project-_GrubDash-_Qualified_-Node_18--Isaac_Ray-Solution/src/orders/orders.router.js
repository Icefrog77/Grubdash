const express = require('express');
const router = express.Router();
const { list, create, read, update, delete: deleteOrder } = require('./orders.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router.route('/')
  .get(list)
  .post(create)
  .all(methodNotAllowed);

router.route('/:orderId')
  .get(read)
  .put(update)
  .delete(deleteOrder)
  .all(methodNotAllowed);

module.exports = router;