const { Builder } = require('selenium-webdriver');
const assert = require('assert');
const LambdaPage = require('../pages/LambdaPage');
const fs = require('fs');

describe('LambdaTest', function () {
  let page;
  let driver;
  let inputBoxes;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    page = new LambdaPage(driver);
    await page.openLambdaTestPage();
    this.timeout(10000);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  afterEach(async function() {
    const testStatus = this.currentTest.state;
    if (driver) {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '__').split('.')[0];
      const screenshotName = `${this.currentTest.title}_${timestamp}.png`;
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync(`./screenshots/${screenshotName}`, screenshot, 'base64');
    }
  });

  it('проверка заголовка страницы', async function () {
    assert.strictEqual(await page.getTitle(), 'Sample page - lambdatest.com', "Заголовок неверный");
  });

  it('проверка наличия текста о количестве элементов', async function () {
    await page.findRemainingTextElement();
  });

  it('проверка номеров чекбоксов', async function () {
    inputBoxes = await page.findInputBoxes();
    assert.strictEqual(inputBoxes.length, 5, "Некорректный номер чекбоксов");
  });

  it('проверка кликабельности чекбоксов', async function () {
    for (let i = 0; i < inputBoxes.length; i++) {
      await page.clickCheckbox(inputBoxes[i]);
      let itemClass = await page.getItemClass(await page.findItemAtIndex(i + 1));
      assert.ok(itemClass.includes('done-true'), "Пункт не зачеркнут");
    }
  });

  it('проверка нового добавленного элемента', async function () {
    await page.enterNewItem("New item");
    let newItemIndex = inputBoxes.length + 1;
    let newItem = await page.findItemAtIndex(newItemIndex);
    let newItemClass = await page.getItemClass(newItem);
    assert.ok(!newItemClass.includes('done-true'), "Новый элемент уже зачеркнут");    
  });
});