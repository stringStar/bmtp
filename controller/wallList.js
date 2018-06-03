import { WallType, ChildType, WallInfo } from "../models/wallcover/index";
class Crawler {
  constructor() {}
  async getPriceTop(req, res, next) {
    try {
      const data = await WallInfo.find()
        .sort({ price: -1 })
        .limit(20);
      console.log("price top list", data);
      res.send({
        error_code: 0,
        data,
        total: data.length
      });
    } catch (e) {
      console.error(e);
      res.send({
        error_code: 1,
        message: "系统错误"
      });
    }
  }
}
export default new Crawler();
