const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleWare = require('../middlewares/auth');
const validateZod = require('../middlewares/validateZod');
const { updateUserSchema } = require('../validations/auth.schema');
const router = express.Router();

router
  .route('/update-me')
  .patch(
    authMiddleWare.protect,
    validateZod(updateUserSchema.partial()),
    userController.updateMe
  );
router
  .route('/delete-me')
  .patch(authMiddleWare.protect, userController.deleteMe);

module.exports = router;
