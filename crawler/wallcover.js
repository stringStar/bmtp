var jsdom = require("jsdom");
var Crawler = require("crawler");
var https = require("https");
var request = require("request");
var superagent = require("superagent");
var fs = require("fs");
var paht = require("path");

import DB from "../db";

import { WallType, ChildType, WallInfo } from "../models/wallcover/index";

const getPageHref = new Crawler({
  maxConnections: 10000,
  forceUTF8: true
});

const imageCrawler = new Crawler({
  encoding: null,
  jQuery: false // set false to suppress warning message.
});

function decode(str) {
  if (!str) return;
  str = str.replace(/&#x(\w+;)/g, function(match, s) {
    return String.fromCharCode(parseInt(s, 16));
  });
  return str.replace(/<[^>]+>/g, "");
}

function getWallType() {
  let BTSO = encodeURI(`https://www.wallcover.com/`);
  var headers = {
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  };
  var options = {
    gzip: true
  };
  return new Promise((result, rej) => {
    getPageHref.queue({
      uri: BTSO,
      headers,
      gzip: true,
      callback: function(err, res, done) {
        if (err) {
          rej(err);
          console.log("Get Wall Err");
          console.error(err);
        } else {
          let info = [];
          let $ = res.$;
          if (typeof $ == "function") {
            console.log("Get WALL Type");
            $(".nav-item.level0.nav-1.level-top.first .nav-item.level1").each(
              function() {
                const typeName = $(this)
                  .find("a span:first-of-type")
                  .html();
                const url = $(this)
                  .children("a")
                  .attr("href");

                const childs = $(this).find(".nav-item.level2");
                let child = [];
                childs.each(function() {
                  const url = $(this)
                    .children("a")
                    .attr("href");
                  const name = $(this)
                    .find("span")
                    .html();
                  child.push({ url, name: decode(name) });
                });
                info.push({ type_name: decode(typeName), url, child });
                result(info);
              }
            );
          } else {
            rej("res is not html");
            console.error(err);
            return false;
          }
        }
        done();
      }
    });
  });
}

async function getTag(params) {
  try {
    const data = await getWallType();
    console.log(data);
    for (let i of data) {
      const { url, type_name, child } = i;
      const wall = new WallType({ url, type_name });
      await wall.save();
      const wallId = await WallType.findOne({ type_name });
      const id = wallId._id;
      const childs = child.map(v => ({
        name: v.name,
        url: v.url,
        first_id: id
      }));
      await ChildType.insertMany(childs);
    }
    getPageList();
  } catch (e) {
    console.log(e);
  }
}

async function getPageList() {
  console.log("get page wpro");
  const headers = {
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  };
  const data = await ChildType.find();
  try {
    let len = 0;
    for (let i of data) {
      let BTSO = encodeURI(i.url);
      let childTypeId = i._id;
      len++;
      console.log(len);
      if (len == data.length) {
        console.log("already get all list");
      }
      await new Promise(result => {
        console.log("queuesize: " + getPageHref.queueSize);
        getPageHref.queue({
          uri: BTSO,
          headers,
          rateLimit: 1000,
          gzip: true,
          callback: async function(err, res, done) {
            if (err) {
              console.log(err);
              return false;
            } else {
              console.log("Get All List");
              let info = [];
              let $ = res.$;
              if (typeof $ == "function") {
                $(".products-grid li.item.last").each(function() {
                  const href = $(this)
                    .children("a")
                    .attr("href");
                  const name = $(this)
                    .children(".product-info")
                    .find("a")
                    .text();
                  const wall = new WallInfo({
                    url: href,
                    name: decode(name),
                    seconde_type: childTypeId
                  });
                  wall.save();
                });
                result();
              } else {
                rej();
                console.error(err);
              }
              done();
            }
          }
        });
      }).catch(e => {
        console.log(e);
      });
    }
    getWallInfo();
  } catch (e) {
    console.log(e);
  }
}

async function getWallInfo() {
  var headers = {
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  };
  var options = {
    headers,
    gzip: true
  };
  const data = await WallInfo.find();
  for (let i of data) {
    let BTSO = encodeURI(i.url);
    let id = i._id;
    await new Promise((reslut, rej) => {
      getPageHref.queue({
        uri: BTSO,
        headers,
        rateLimit: 1000,
        gzip: true,
        callback: async function(err, res, done) {
          if (err) {
            rej(err);
            console.error(err);
          } else {
            console.log("Get Wall Info");
            let info = [];
            let $ = res.$;
            if (typeof $ == "function") {
              const imageurl = $(".cloud-zoom.product-image-gallery img").attr(
                "src"
              );
              const imageType = imageurl.split(".")[
                imageurl.split(".").length - 1
              ];
              const imageName = new Date().getTime() + "." + imageType;
              await creatImageFile(imageurl, imageName);
              const price = $(".preisbox .produkt-price .price").text();
              const content = $(
                "#detail .grid12-6:nth-of-type(2) .grid12-12:last-of-type div"
              );
              const color = content
                .eq(0)
                .children("strong")
                .text();

              const design = content
                .eq(1)
                .children("strong")
                .text();

              const material = content
                .eq(2)
                .children("strong")
                .text();

              const roll = content
                .eq(3)
                .children("strong")
                .text();
              console.log(id);
              // console.log(1111, price, color, design, material, roll);
              WallInfo.update(
                { _id: { $gt: id } },
                {
                  price,
                  color,
                  design,
                  material,
                  roll,
                  image: "./public/images/" + imageName
                },
                function(err, raw) {
                  if (err) console.log(err);
                }
              );
              reslut();
            } else {
              rej("res is not html");
              console.error(err);
              return false;
            }
          }
          done();
        }
      });
    });
  }
}

function creatImageFile(url, filename) {
  return new Promise((reslut, rej) => {
    imageCrawler.queue({
      uri: url,
      filename: filename,
      callback: function(err, res, done) {
        if (err) {
          console.error(err.stack);
          rej("get image error");
        } else {
          console.log("Get Image");
          fs
            .createWriteStream("./public/images/" + res.options.filename)
            .write(res.body);
          reslut();
        }
        done();
      }
    });
  });
}

process.on("uncaughtException", err => {
  console.error("An uncaught error occurred!");
  console.error(err.stack);
});
// getTag();
// getPageList();
// console.log(process);
setTimeout(() => {
  getWallInfo();
}, 3000);
