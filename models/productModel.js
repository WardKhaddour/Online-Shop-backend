const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }
  async save() {
    const db = getDb();
    try {
      let dbOp;
      if (this._id) {
        //Update Product
        dbOp = db
          .collection('products')
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        dbOp = db.collection('products').insertOne(this);
      }
      const res = await dbOp;
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }
  static async fetchAll() {
    try {
      const db = getDb();
      const products = await db.collection('products').find().toArray();
      return products;
    } catch (err) {
      console.log(err);
    }
  }
  static async findById(productId) {
    try {
      const db = getDb();
      const product = await db
        .collection('products')
        .find({ _id: new ObjectId(productId) })
        .next();
      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteById(productId) {
    try {
      const db = getDb();
      await db
        .collection('products')
        .deleteOne({ _id: new ObjectId(productId) });
      console.log('Deleted');
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
