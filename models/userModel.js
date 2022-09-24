const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }
  async save() {
    const db = getDb();
    await db.collection('users').insertOne(this);
  }
  async addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(
      cp => cp.productId.toString() === product._id.toString()
    );

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  async getCart() {
    const db = getDb();
    const productsIds = this.cart.items.map(item => item.productId);
    const products = await db
      .collection('products')
      .find({ _id: { $in: productsIds } })
      .toArray();
    return products.map(p => {
      return {
        ...p,
        quantity: this.cart.items.find(i => p._id.equals(i.productId)).quantity,
      };
    });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      item => !item.productId.equals(productId)
    );
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  async addOrder() {
    const db = getDb();
    const products = await this.getCart();

    const order = {
      items: products,
      user: {
        _id: new ObjectId(this._id),
        name: this.name,
      },
    };
    await db.collection('orders').insertOne(order);
    this.cart = { items: [] };
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: [] } } }
      );
  }

  async getOrders() {
    const db = getDb();
    const orders = await db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
    return orders;
  }
  static async findById(id) {
    const db = getDb();
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(id) });

    return user;
  }
}

module.exports = User;
