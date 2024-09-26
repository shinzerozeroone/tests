const { Builder, By, Key } = require('selenium-webdriver');
const assert = require('assert');

async function lambdaTest() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://lambdatest.github.io/sample-todo-app/');
    console.log('Проверка заголовка страницы');
    assert.strictEqual(await driver.getTitle(), 'Sample page - lambdatest.com', "Заголовок неверный");
    console.log('Заголовок верный');

    console.log('Проверка наличия текста "5 of 5 remaining"');
    await driver.findElement(By.xpath("//*[text()='5 of 5 remaining']"));
    console.log('Текст "5 of 5 remaining" присутствует');

    console.log('Получение чекбоксов');
    let inputBoxes = await driver.findElements(By.xpath("//li/span[@class='done-false']/preceding-sibling::input"));
    assert.strictEqual(inputBoxes.length, 5, "Некорректный номер чекбоксов");
    
    for (let i = 0; i < inputBoxes.length; i++) {
      console.log(`Клик на чекбокс под номером ${i + 1}`);
      await inputBoxes[i].click();
      console.log('Клик сделан успешно');
      
      let itemClass = await driver.findElement(By.xpath(`//li[${i + 1}]/span`)).getAttribute('class');
      assert.ok(itemClass.includes('done-true'), "Пункт не зачеркнут");
      const afterClick = await driver.findElement(By.xpath(`//*[text()='${4 - i} of 5 remaining']`)).getText();
      console.log(`Статус после клика на элемент ${i + 1}: ${afterClick}`);
    }

    await driver.findElement(By.id('sampletodotext')).sendKeys("New item", Key.RETURN);
    
    console.log('Проверки нового добавленного элемента');
    let newItemIndex = inputBoxes.length + 1;
    let newItem = await driver.findElement(By.xpath(`//li[${newItemIndex}]`));
    let newCheckbox = await newItem.findElement(By.xpath("./input"));
    let newItemClass = await newItem.findElement(By.xpath("./span")).getAttribute('class');
    console.log(newItemClass)

    assert.ok(!newItemClass.includes('done-true'), "Новый элемент уже зачеркнут");
    console.log('Новый элемент не зачеркнут');

    console.log(`Клик на чекбокс нового элемента`);
    await newCheckbox.click();

    newItemClass = await newItem.findElement(By.xpath("./span")).getAttribute('class');
    assert.ok(newItemClass.includes('done-true'), "Новый элемент не зачеркнут после клика");

    const newItemRemainingText = await driver.findElement(By.xpath(`//*[text()='0 of 6 remaining']`)).getText();
    console.log(`Статус после клика на новый элемент ${newItemRemainingText}`);
  } catch (error) {
    console.error('Ошибка:', error);
    driver.takeScreenshot().then(function(image) {
      require('fs').writeFileSync('screenshot_error.png', image, 'base64');
    });
  } finally {
    console.log('Закрытие браузера');
    await driver.quit();
  }
}

lambdaTest();
