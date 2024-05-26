const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authenticateUsers');
const ClientController = require('../Controllers/ClientController');

router.get("/auth", authenticate, ClientController.navigate);

router.post("/register", ClientController.register);
router.post("/signin", ClientController.signIn);

router.get("/cart", authenticate, ClientController.getAllCartProducts);
router.post("/:productId/cart/updateQuantity", authenticate, ClientController.updateCartQuantity);
router.post("/:productId/cart", authenticate, ClientController.addToCart);

router.post("/signature", authenticate, ClientController.getSignature);
router.post("/paymentconfirmation", ClientController.paymentConfirmation);
router.get("/payment-details", authenticate, ClientController.getPaymentDetails);

router.post("/orders", authenticate, ClientController.buyAllOrders);

router.post("/checkIfRegisterClass", authenticate, ClientController.checkIfRegisterClass);
router.post("/class", authenticate, ClientController.buyClass);

router.post("/checkIfRegisterMembership", authenticate, ClientController.checkIfRegisterMembership);
router.post("/membership", authenticate, ClientController.buyMembership);

router.get("/purchase/history", authenticate, ClientController.purchaseHistory);

router.get("/logout", authenticate, ClientController.logout);

module.exports = router;