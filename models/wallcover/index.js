import mongoose from "mongoose";

const { Schema } = mongoose;
const firstType = new Schema({
  type_name: String,
  url: String
});
const secondType = new Schema({
  name: String,
  url: String,
  first_id: String
});
const WallInfoSchema = new Schema({
  name: String,
  image: String,
  color: String,
  design: String,
  material: String,
  roll: String,
  price: String,
  url: String
});

const WallType = mongoose.model("walltype", firstType);
const ChildType = mongoose.model("wallchildtype", secondType);
const WallInfo = mongoose.model("wallInfo", WallInfoSchema);
export { WallType, ChildType, WallInfo };
