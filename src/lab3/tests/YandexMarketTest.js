const { Builder, Browser, By } = require('selenium-webdriver');
const BrowserType = Browser.CHROME;
const URL = 'https://market.yandex.ru/';
const SLEEP_TIME1 = 1000;
const SLEEP_TIME3 = 3000;
const SLEEP_TIME5 = 5000;
const SLEEP_TIME7 = 7000;

let driver = new Builder().forBrowser(BrowserType).build();

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.locator = {
            hamburger: By.xpath("//div[@data-zone-name='catalog']"),
            laptopsAndComputers: By.xpath("//span[contains(text(), 'Ноутбуки и компьютеры')]"),
            internalHDD: By.xpath("//a[contains(text(), 'Внутренние жесткие диски')]")
        }
    }

    async openURL() {
        await driver.get(URL);
        await driver.manage().window().maximize();
        console.log('✔️  Перейти по ссылке');
        await driver.sleep(SLEEP_TIME1);
    }

    async getInternalHDD() {
        await this.driver.findElement(this.locator.hamburger).click();
        await this.driver.sleep(SLEEP_TIME5);

        // Навести на "Ноутбуки и компьютеры"
        let laptopsAndComputers = await this.driver.findElement(this.locator.laptopsAndComputers);
        let action = this.driver.actions({ async: true });
        await action.move({ origin: laptopsAndComputers }).perform();
        await this.driver.sleep(SLEEP_TIME1);

        // Клик по "Внутренние жесткие диски"
        await this.driver.findElement(this.locator.internalHDD).click();
        console.log('✔️  Открыта страница с внутренними жесткими дисками');
        await this.driver.sleep(SLEEP_TIME3);
    }
}

class HDDPage {
    constructor(driver) {
        this.driver = driver;
        this.variables = {
            nameHDDs: [],
            priceHDDs: [],
        }
        this.locator = {
            getCheaper: By.xpath("//button[contains(text(), 'подешевле')]"),
            getFiveNameHDDs: By.xpath("//div[@data-auto-themename='listDetailed']//h3[@data-auto='snippet-title']"),
            getFivePriceHDDs: By.xpath("//div[@data-auto-themename='listDetailed']//span[@data-auto='snippet-price-current']")
        }
    }

    async setThePrice() {
        await this.driver.findElement(this.locator.getCheaper).click();
        console.log('✔️  Сортировка списка по цене');
        await this.driver.sleep(SLEEP_TIME7);
    }

    // Скроллинг страницы для подгрузки товаров
    async scrollToLoadMore() {
        for (let i = 0; i < 3; i++) { // Scroll three times to load more items
            await this.driver.executeScript('window.scrollBy(0, 1000);');
            await this.driver.sleep(SLEEP_TIME3);
        }
    }

    async listHDDs() {
        await this.driver.sleep(SLEEP_TIME5);

        // Скроллим страницу вниз для подгрузки дополнительных товаров
        await this.scrollToLoadMore();

        let nameElements = await this.driver.findElements(this.locator.getFiveNameHDDs);
        let priceElements = await this.driver.findElements(this.locator.getFivePriceHDDs);

        console.log('=====================');
        console.log('СПИСОК ВНУТРЕННИХ ЖЕСТКИХ ДИСКОВ:');
        
        // Логируем только первые пять элементов
        for (let i = 0; i < Math.min(5, nameElements.length); i++) {
            this.variables.nameHDDs[i] = await nameElements[i].getText();
            this.variables.priceHDDs[i] = await priceElements[i].getText();
            console.log('------------------');
            console.log('💻 Название: ' + this.variables.nameHDDs[i]);
            console.log('💰 Цена: ' + this.variables.priceHDDs[i] + ' рублей');
        }
        
        console.log('=====================');
        
        // Проверка цен для не менее чем 10 товаров
        const prices = [];
        
        for (let i = 0; i < Math.min(10, priceElements.length); i++) {
            const priceText = await priceElements[i].getText();
            const priceValue = parseFloat(priceText.replace(/\s+/g, '').replace(/₽/, '')); // Удаляем пробелы и символ валюты
            prices.push(priceValue);
            
            if (i > 0 && priceValue < prices[i - 1]) {
                console.error(`Ошибка: цена товара ${this.variables.nameHDDs[i]} меньше цены предыдущего товара.`);
                return;
            }
        }

        console.log('✔️ Все цены отсортированы корректно.');
        
        console.log('=====================');
    }
}

describe('Вариант №4', function () {
    this.timeout(100000);
    it('Переход на страницу с внутренними жесткими дисками', async function () {
        try {
            let mainPage = new MainPage(driver);
            await mainPage.openURL();
            await mainPage.getInternalHDD();
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    });
    
    it('Вывод списка жестких дисков и сортировка', async function () {
        try {
            let hddPage = new HDDPage(driver);
            await hddPage.setThePrice();
            await hddPage.listHDDs();
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    });

    after(async function () {
        await driver.quit();
    });
});