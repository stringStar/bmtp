var jsdom = require("jsdom");
var Crawler = require("crawler");
var https = require("https");
var request = require("request");
var superagent = require("superagent");
var fs = require("fs");
var paht = require("path");

import DB from "../db";

import { WallType, ChildType, WallInfo } from "../models/wallcover/index";
async function editImage(params) {
  const data = await WallInfo.find({});
  console.log(data.length);
  try {
    for(var i of data) {
        var a = new WallInfo(i);
        await a.save();
    }
  } catch (e) {
    console.log(e);
  }
}

editImage();
