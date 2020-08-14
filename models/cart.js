var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var cartSchema = new Schema(
  {
    itemList: [{
        type:Schema.Types.ObjectId,
        ref:"Itemlist"
    }],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
