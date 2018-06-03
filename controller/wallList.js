import { WallType, ChildType, WallInfo } from "../models/wallcover/index";
class Crawler {
    constructor() {
    }
    async getPriceTop(req, res, next) {
        const data = await WallInfo.find().sort({price: -1}).limit(20);
        BinData(0,"Li9wdWJsaWMvaW1hZ2VzLzE1MjY1NTE2NTcxNjQuanBn")
        
    }
}
export default new Crawler;