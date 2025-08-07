class WebElements {
  constructor(page) {
    this.page = page;
  }

  async click(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.click(options);
      console.log(`Clicked element: ${selector}`);
    } catch (error) {
      console.error(`Failed to click element: ${selector}`, error);
      throw error;
    }
  }

  async type(selector, text, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.clear();
      await element.fill(text, options);
      console.log(`Typed "${text}" into element: ${selector}`);
    } catch (error) {
      console.error(`Failed to type into element: ${selector}`, error);
      throw error;
    }
  }

  async typeSlowly(selector, text, delay = 100) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.clear();
      await element.type(text, { delay });
      console.log(`Typed "${text}" slowly into element: ${selector}`);
    } catch (error) {
      console.error(`Failed to type slowly into element: ${selector}`, error);
      throw error;
    }
  }

  async selectOption(selector, value, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.selectOption(value, options);
      console.log(`Selected option "${value}" from element: ${selector}`);
    } catch (error) {
      console.error(`Failed to select option from element: ${selector}`, error);
      throw error;
    }
  }

  async check(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.check(options);
      console.log(`Checked element: ${selector}`);
    } catch (error) {
      console.error(`Failed to check element: ${selector}`, error);
      throw error;
    }
  }

  async uncheck(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.uncheck(options);
      console.log(`Unchecked element: ${selector}`);
    } catch (error) {
      console.error(`Failed to uncheck element: ${selector}`, error);
      throw error;
    }
  }

  async hover(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.hover(options);
      console.log(`Hovered over element: ${selector}`);
    } catch (error) {
      console.error(`Failed to hover over element: ${selector}`, error);
      throw error;
    }
  }

  async doubleClick(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.dblclick(options);
      console.log(`Double-clicked element: ${selector}`);
    } catch (error) {
      console.error(`Failed to double-click element: ${selector}`, error);
      throw error;
    }
  }

  async rightClick(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 });
      await element.click({ button: 'right', ...options });
      console.log(`Right-clicked element: ${selector}`);
    } catch (error) {
      console.error(`Failed to right-click element: ${selector}`, error);
      throw error;
    }
  }

  async waitForElement(selector, options = {}) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ 
        state: options.state || 'visible', 
        timeout: options.timeout || 10000 
      });
      console.log(`Element is ready: ${selector}`);
      return element;
    } catch (error) {
      console.error(`Element not found: ${selector}`, error);
      throw error;
    }
  }

  async waitForElementToDisappear(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { state: 'hidden', timeout });
      console.log(`Element disappeared: ${selector}`);
    } catch (error) {
      console.error(`Element did not disappear: ${selector}`, error);
      throw error;
    }
  }

  async getText(selector) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      const text = await element.textContent();
      console.log(`Got text from element: ${selector} = "${text}"`);
      return text;
    } catch (error) {
      console.error(`Failed to get text from element: ${selector}`, error);
      throw error;
    }
  }

  async getAttribute(selector, attribute) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      const value = await element.getAttribute(attribute);
      console.log(`Got attribute "${attribute}" from element: ${selector} = "${value}"`);
      return value;
    } catch (error) {
      console.error(`Failed to get attribute from element: ${selector}`, error);
      throw error;
    }
  }

  async isVisible(selector) {
    try {
      const element = await this.page.locator(selector);
      return await element.isVisible();
    } catch (error) {
      return false;
    }
  }

  async isEnabled(selector) {
    try {
      const element = await this.page.locator(selector);
      return await element.isEnabled();
    } catch (error) {
      return false;
    }
  }

  async isChecked(selector) {
    try {
      const element = await this.page.locator(selector);
      return await element.isChecked();
    } catch (error) {
      return false;
    }
  }

  async countElements(selector) {
    try {
      const elements = await this.page.locator(selector);
      return await elements.count();
    } catch (error) {
      console.error(`Failed to count elements: ${selector}`, error);
      return 0;
    }
  }

  async scrollToElement(selector) {
    try {
      const element = await this.page.locator(selector);
      await element.scrollIntoViewIfNeeded();
      console.log(`Scrolled to element: ${selector}`);
    } catch (error) {
      console.error(`Failed to scroll to element: ${selector}`, error);
      throw error;
    }
  }

  async pressKey(selector, key) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.press(key);
      console.log(`Pressed key "${key}" on element: ${selector}`);
    } catch (error) {
      console.error(`Failed to press key on element: ${selector}`, error);
      throw error;
    }
  }

  async uploadFile(selector, filePath) {
    try {
      const element = await this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.setInputFiles(filePath);
      console.log(`Uploaded file "${filePath}" to element: ${selector}`);
    } catch (error) {
      console.error(`Failed to upload file to element: ${selector}`, error);
      throw error;
    }
  }

  async waitForNetworkIdle() {
    try {
      await this.page.waitForLoadState('networkidle');
      console.log('Network is idle');
    } catch (error) {
      console.error('Failed to wait for network idle', error);
    }
  }

  async waitForTimeout(milliseconds) {
    try {
      await this.page.waitForTimeout(milliseconds);
      console.log(`Waited for ${milliseconds}ms`);
    } catch (error) {
      console.error('Failed to wait for timeout', error);
    }
  }
}

module.exports = WebElements; 