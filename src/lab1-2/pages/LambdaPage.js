const { By, Key } = require('selenium-webdriver');
const BasePage = require('../BasePage');

class LambdaPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  async openLambdaTestPage() {
    return await this.driver.get('https://lambdatest.github.io/sample-todo-app/');
  }

  async getTitle() {
    return await this.getPageTitle();
  }

  async findRemainingTextElement() {
    return await this.findPageElement(By.xpath("//*[text()='5 of 5 remaining']"));
  }

  async findInputBoxes() {
    return await this.driver.findElements(By.xpath("//li/span[@class='done-false']/preceding-sibling::input"));
  }

  async clickCheckbox(inputBox) {
    return await this.clickElement(inputBox);
  }

  async enterNewItem(text) {
    const inputField = await this.findPageElement(By.id('sampletodotext'));
    return await this.enterText(inputField, text);
  }

  async findItemAtIndex(index) {
    return await this.findPageElement(By.xpath(`//li[${index}]`));
  }

  async findCheckbox(newItem) {
    return await newItem.findElement(By.xpath("./input"));
  }

  async getItemClass(newItem) {
    const spanElement = await newItem.findElement(By.xpath("./span"));
    return await spanElement.getAttribute('class');
  }
}

module.exports = LambdaPage;