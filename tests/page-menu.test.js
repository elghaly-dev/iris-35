const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const menu = fs.readFileSync(path.join(__dirname, "..", "page-menu.js"), "utf8");

test("page menu button names a chat assistant in every shipped language", () => {
  assert.equal(menu.includes("Ask ChatGPT"), false);
  for (const s of [
    "Ask a chat assistant about this page",
    "اسأل مساعد المحادثة عن هذه الصفحة",
    "Спросить чат-ассистента об этой странице",
    "向聊天助手询问这个页面",
  ]) assert.ok(menu.includes(s), s);
});

test("page menu button keeps the same link target", () => {
  assert.match(menu, /"https:\/\/chatgpt\.com\/\?q=" \+ q/);
  assert.match(menu, /main\.href = chatgptUrl\(q\);/);
});
