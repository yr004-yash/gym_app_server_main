const Client = require('../model/clients');
const Cart = require('../model/carts');
const Order = require('../model/order');
const Class = require('../model/classes');
const Membership = require('../model/membership');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const DB1 = process.env.DATABASE;
const mongooseInstance2 = mongoose.createConnection(DB1, {});

mongooseInstance2.on("connected", () => {
  console.log("Connection to DB2 is successfull");
});

mongooseInstance2.on("error", (err) => {
  console.log(err);
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(422).json({ error: "Please fill all the fields" });
    }

    const existingclient = await Client.findOne({ email: email });

    if (existingclient && existingclient.email === email) {
      return res.status(422).json({ error: 'client Already exists' });
    } else {
      const client1 = new Client({
        name: username,
        email: email,
        password: password,
      });

      await client1.save();

      const data = { username, email, password };

      if (client1) {
        return res.status(201).json({ message: 'client Registered Successfully', data });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.signIn = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const response = await Client.findOne({ email: email });

    if (!response) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log("response:", response);
    const ismatch = await bcrypt.compare(password, response.password);

    if (response && response.email === email && ismatch) {
      // Wait for the token to be generated
      const token = jwt.sign({ _id: response._id }, process.env.SECRET_KEY);
      console.log('The token is ', token);

      res.cookie('jwtoken', token, {
        expires: new Date(Date.now() + 200000000),
        httpOnly: true
      })

      console.log(response.name);
      res.status(201).json({
        message: "you are logged in successfully",
        clientName: response.name,
        clientId: response._id,
        token: token,
      });
    } else {
      res.status(500).json({ message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.getAllCartProducts = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const getAllProducts = await Cart.find({
      "cpId.clientId": clientId
    });

    res.status(201).json({
      message: 'Fetched product from cart successfully',
      cartProducts: getAllProducts
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const clientId = req.userID.toString();
    const { name, description, rating, money, availability, code, tags, size, brand, image } = req.body;

    const checkExistingProduct = await Cart.findOne({
      cpId: {
        clientId,
        productId
      },
      size
    });

    if (!checkExistingProduct) {
      const updateProduct = await Cart.updateOne(
        {
          cpId: {
            clientId,
            productId
          },
          size
        },
        {
          $set: {
            name,
            description,
            rating,
            image,
            money,
            availability,
            code,
            tags: JSON.parse(tags),
            size,
            brand,
            quantity: 1,
          },
        },
        {
          upsert: true
        }
      );
    } else {
      const updateProduct = await Cart.updateOne(
        {
          cpId: {
            clientId,
            productId
          },
          size
        },
        {
          $inc: {
            quantity: 1,
          },
        }
      );
    }

    // const addProduct = new Cart({
    //   name,
    //   description,
    //   rating,
    //   image: imagePath,
    //   money,
    //   availability,
    //   code,
    //   tags,
    //   size,
    //   brand,
    // });
    // console.log(newProduct);
    // await newProduct.save();
    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const clientId = req.userID.toString();
    const { size, quantity } = req.body;

    if (quantity === 0) {
      const deleteCartProduct = await Cart.deleteOne({
        cpId: {
          clientId,
          productId
        },
        size
      });
      return res.status(201).json({
        message: 'Product deleted from cart successfully'
      });
    }

    const updateCartQuantity = await Cart.updateOne(
      {
        cpId: {
          clientId,
          productId
        },
        size
      },
      {
        $set: {
          quantity: Number(quantity),
        },
      }
    );

    res.status(201).json({
      message: 'Quantity updated in cart successfully'
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getPaymentDetails = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const { TransactionId } = req.body;

    const PaymentDetails = await Order.findOne({
      ClientId: clientId,
      TransactionId,
    });

    res.status(201).json({
      message: 'Fetched payment status successfully',
      PaymentDetails,
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.paymentConfirmation = async (req, res) => {
  try {
    const { TransactionId, OrderId, PaymentStatus, ResponseMsg, CardToken, CustomMessage } = req.body;

    await Order.updateOne({
      TransactionId
    }, {
      $set: {
        TransactionId,
        OrderId,
        PaymentStatus,
        ResponseMsg,
        CardToken,
      },
    }, {
      upsert: true,
    });

    res.json({
      status: "Success",
      TransactionId,
      OrderId,
      PaymentStatus,
      ResponseMsg,
      CardToken,
      CustomMessage,
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSignature = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const { Amount, CurrencyCode, FirstName, Email, City, StreetAddress, CountryAddress, StateAddress, CustomMessage } = req.body;
    const TransactionId = Date.now() + "2353";

    const getSignature = await fetch(`${process.env.PAYMENT_URL}/gateway/v1/generatepaysignature`, {
      method: 'POST',
      body: JSON.stringify({
        ClientId: "blackfusefitness_dev",
        Amount,
        CurrencyCode,
        TransactionId,
      }),
      headers: {
        "Authorization": `Bearer ${process.env.PAYMENT_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const getSignatureData = await getSignature.json();
    const signature = getSignatureData.Signature;

    await Order.updateOne({
      ClientId: clientId,
      TransactionId,
    }, {
      $set: {
        ClientId: clientId,
        TransactionId,
        Amount,
        CurrencyCode,
        FirstName,
        Email,
        City,
        StreetAddress,
        CountryAddress,
        StateAddress,
        CustomMessage,
      },
    }, {
      upsert: true,
    });

    res.status(201).json({
      status: 'success',
      Signature: signature,
      TransactionId,
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.buyAllOrders = async (req, res) => {
  try {
    const clientId = req.userID.toString();

    let findAllProducts = await Cart.aggregate([
      { $match: { "cpId.clientId": clientId } },
      { $project: { _id: 0, "cpId.productId": 1, quantity: { $toInt: "$quantity" } } }
    ]);

    findAllProducts = findAllProducts.map((product) => {
      return {
        products: product.cpId.productId,
        quantity: product.quantity,
      }
    });

    await Client.updateOne({
      _id: clientId
    }, {
      $push: {
        purchasedProducts: {
          $each: findAllProducts
        }
      }
    });

    await Cart.deleteMany({
      "cpId.clientId": clientId
    });

    res.status(201).json({
      message: 'Buy all orders successfully',
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.checkIfRegisterClass = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const { classId } = req.body;

    const checkIfAlreadyPurchased = await Client.findOne({
      _id: clientId,
      purchasedClasses: {
        $in: [classId],
      }
    });

    const checkIfJoinClass = await Class.findOne({
      _id: classId,
    }, {
      _id: 0,
      remainCapacity: 1,
      Capacity: 1,
    });

    if (checkIfAlreadyPurchased) {
      return res.status(200).json({
        success: false,
        message: 'You have already purchased this class',
      });
    }

    if (checkIfJoinClass.remainCapacity >= checkIfJoinClass.Capacity) {
      return res.status(200).json({
        success: false,
        message: 'This class is full',
      });
    }

    res.status(201).json({
      success: true,
      message: 'You can buy this class',
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.buyClass = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const { classId } = req.body;

    await Class.updateOne(
      {
        _id: classId
      },
      {
        $inc: {
          remainCapacity: 1
        },
      }
    );

    await Client.updateOne(
      { _id: clientId },
      { $push: { purchasedClasses: classId } }
    );

    res.status(201).json({
      success: true,
      message: 'Buy class successfully',
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.checkIfRegisterMembership = async (req, res) => {
  try {
    const clientId = req.userID.toString();

    const checkIfAlreadyPurchased = await Client.findOne({
      _id: clientId,
    });

    if (checkIfAlreadyPurchased.purchasedMembership) {
      return res.status(200).json({
        success: false,
        message: 'You have already purchased membership',
      });
    }

    res.status(201).json({
      success: true,
      message: 'You can buy this menbership',
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.buyMembership = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const { name, price, duration } = req.body;

    const membership = await Membership.updateOne({
      clientId: clientId,
    }, {
      $set: {
        clientId: clientId,
        name: name,
        price: price,
        duration: duration,
      }
    }, {
      upsert: true,
    });

    await Client.updateOne(
      { _id: clientId },
      { $set: { purchasedMembership: membership.upsertedId } }
    );

    res.status(201).json({
      success: true,
      message: 'Buy membership successfully',
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.purchaseHistory = async (req, res) => {
  try {
    const clientId = req.userID.toString();
    const newId = new ObjectId(clientId);

    const purchaseHistory = await Client.aggregate([
      {
        $match: {
          _id: newId,
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'purchasedProducts.products',
          foreignField: '_id',
          as: 'allPurchasedProducts'
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'purchasedClasses',
          foreignField: '_id',
          as: 'purchasedClasses'
        }
      },
      {
        $lookup: {
          from: 'memberships',
          localField: 'purchasedMembership',
          foreignField: '_id',
          as: 'purchasedMembership'
        }
      },
    ]);

    res.status(201).json({
      message: 'Fetched purchase history successfully',
      purchaseHistory,
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.navigate = (req, res) => {
  if (req.token) {
    res.send({
      Status: "Success"
    })
  } else {
    res.send({
      Status: "Failed"
    })
  }
}

exports.logout = (req, res) => {

  res.clearCookie('jwtoken', { path: '/' });
  res.send('client Logout');

}