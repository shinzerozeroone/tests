const { By, Key } = require('selenium-webdriver');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async findPageElement(locator) {
    return await this.driver.findElement(locator);
  }

  async clickElement(element) {
    await element.click();
  }

  async enterText(element, text) {
    await element.sendKeys(text, Key.RETURN);
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }
}

module.exports = BasePage;
