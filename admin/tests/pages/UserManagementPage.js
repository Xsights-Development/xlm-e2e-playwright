// admin/tests/pages/UserManagementPage.js
const { BasePage } = require('./BasePage');

/**
 * User Management Page Object cho Admin
 */
class UserManagementPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      // Page elements
      pageTitle: '[data-testid="page-title"]',
      pageTitleAlt: 'h1:has-text("User Management")',
      
      // Search & Filter
      searchInput: '[data-testid="search-input"]',
      searchInputAlt: 'input[placeholder*="Search"]',
      
      searchButton: '[data-testid="search-button"]',
      searchButtonAlt: 'button:has-text("Search")',
      
      filterDropdown: '[data-testid="filter-dropdown"]',
      filterDropdownAlt: 'select[name="filter"]',
      
      // Table
      userTable: '[data-testid="user-table"]',
      userTableAlt: 'table',
      
      tableRows: '[data-testid="user-row"]',
      tableRowsAlt: 'tbody tr',
      
      // Actions
      addUserButton: '[data-testid="add-user-button"]',
      addUserButtonAlt: 'button:has-text("Add User")',
      addUserButtonAlt2: 'button:has-text("Thêm người dùng")',
      
      editButton: '[data-testid="edit-button"]',
      editButtonAlt: 'button:has-text("Edit")',
      
      deleteButton: '[data-testid="delete-button"]',
      deleteButtonAlt: 'button:has-text("Delete")',
      
      // Modal/Dialog
      modal: '[data-testid="user-modal"]',
      modalAlt: '.modal',
      modalAlt2: '[role="dialog"]',
      
      modalTitle: '[data-testid="modal-title"]',
      modalTitleAlt: '.modal-title',
      
      // Form fields trong modal
      nameInput: '[data-testid="name-input"]',
      nameInputAlt: 'input[name="name"]',
      
      emailInput: '[data-testid="email-input"]',
      emailInputAlt: 'input[name="email"]',
      
      roleDropdown: '[data-testid="role-dropdown"]',
      roleDropdownAlt: 'select[name="role"]',
      
      statusToggle: '[data-testid="status-toggle"]',
      statusToggleAlt: 'input[type="checkbox"][name="status"]',
      
      saveButton: '[data-testid="save-button"]',
      saveButtonAlt: 'button:has-text("Save")',
      
      cancelButton: '[data-testid="cancel-button"]',
      cancelButtonAlt: 'button:has-text("Cancel")',
      
      // Confirmation dialog
      confirmDialog: '[data-testid="confirm-dialog"]',
      confirmDialogAlt: '.confirm-dialog',
      
      confirmButton: '[data-testid="confirm-button"]',
      confirmButtonAlt: 'button:has-text("Confirm")',
      
      // Notifications
      successMessage: '[data-testid="success-message"]',
      successMessageAlt: '.alert-success',
      
      errorMessage: '[data-testid="error-message"]',
      errorMessageAlt: '.alert-error',
      
      // Pagination
      pagination: '[data-testid="pagination"]',
      paginationAlt: '.pagination',
      
      nextPageButton: '[data-testid="next-page"]',
      nextPageButtonAlt: 'button:has-text("Next")',
      
      prevPageButton: '[data-testid="prev-page"]',
      prevPageButtonAlt: 'button:has-text("Previous")',
    };
  }

  /**
   * Navigate to User Management page
   */
  async goto() {
    await this.navigate('/admin/users');
    await this.waitForPageLoad();
  }

  /**
   * Search for user
   */
  async searchUser(searchTerm) {
    const selectors = [
      this.selectors.searchInput,
      this.selectors.searchInputAlt
    ];

    for (const selector of selectors) {
      try {
        await this.fillInput(selector, searchTerm);
        console.log(`✓ Search input filled using: ${selector}`);
        break;
      } catch (error) {
        continue;
      }
    }
    
    // Click search button if exists
    try {
      await this.clickElement(this.selectors.searchButton);
    } catch (error) {
      // Might auto-search on input
      await this.pressKey('Enter');
    }
    
    await this.wait(1000);
  }

  /**
   * Click Add User button
   */
  async clickAddUser() {
    const selectors = [
      this.selectors.addUserButton,
      this.selectors.addUserButtonAlt,
      this.selectors.addUserButtonAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ Add user button clicked`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find add user button');
  }

  /**
   * Wait for modal to appear
   */
  async waitForModal() {
    const selectors = [
      this.selectors.modal,
      this.selectors.modalAlt,
      this.selectors.modalAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelector(selector, { timeout: 5000 });
        console.log(`✓ Modal appeared`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Modal did not appear');
  }

  /**
   * Fill user form in modal
   */
  async fillUserForm(userData) {
    // Wait for modal
    await this.waitForModal();
    
    // Fill name
    if (userData.name) {
      const nameSelectors = [
        this.selectors.nameInput,
        this.selectors.nameInputAlt
      ];
      for (const selector of nameSelectors) {
        try {
          await this.fillInput(selector, userData.name);
          break;
        } catch (error) {
          continue;
        }
      }
    }
    
    // Fill email
    if (userData.email) {
      const emailSelectors = [
        this.selectors.emailInput,
        this.selectors.emailInputAlt
      ];
      for (const selector of emailSelectors) {
        try {
          await this.fillInput(selector, userData.email);
          break;
        } catch (error) {
          continue;
        }
      }
    }
    
    // Select role
    if (userData.role) {
      const roleSelectors = [
        this.selectors.roleDropdown,
        this.selectors.roleDropdownAlt
      ];
      for (const selector of roleSelectors) {
        try {
          await this.selectOption(selector, userData.role);
          break;
        } catch (error) {
          continue;
        }
      }
    }
    
    // Toggle status if needed
    if (userData.status !== undefined) {
      const statusSelectors = [
        this.selectors.statusToggle,
        this.selectors.statusToggleAlt
      ];
      for (const selector of statusSelectors) {
        try {
          if (userData.status) {
            await this.check(selector);
          } else {
            await this.uncheck(selector);
          }
          break;
        } catch (error) {
          continue;
        }
      }
    }
  }

  /**
   * Click Save button
   */
  async clickSave() {
    const selectors = [
      this.selectors.saveButton,
      this.selectors.saveButtonAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ Save button clicked`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find save button');
  }

  /**
   * Click Cancel button
   */
  async clickCancel() {
    const selectors = [
      this.selectors.cancelButton,
      this.selectors.cancelButtonAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Add new user (complete flow)
   */
  async addUser(userData) {
    await this.clickAddUser();
    await this.fillUserForm(userData);
    await this.clickSave();
    await this.wait(1000);
  }

  /**
   * Get number of users in table
   */
  async getUserCount() {
    const selectors = [
      this.selectors.tableRows,
      this.selectors.tableRowsAlt
    ];

    for (const selector of selectors) {
      try {
        return await this.count(selector);
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  }

  /**
   * Get success message
   */
  async getSuccessMessage() {
    const selectors = [
      this.selectors.successMessage,
      this.selectors.successMessageAlt
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelector(selector, { timeout: 5000 });
        return await this.getText(selector);
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible() {
    const selectors = [
      this.selectors.successMessage,
      this.selectors.successMessageAlt
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) return true;
    }
    
    return false;
  }

  /**
   * Click edit button for specific user (by row index)
   */
  async clickEditUser(rowIndex = 0) {
    const row = await this.page.locator(this.selectors.tableRowsAlt).nth(rowIndex);
    const editButton = row.locator(this.selectors.editButtonAlt);
    await editButton.click();
    await this.wait(500);
  }

  /**
   * Click delete button for specific user (by row index)
   */
  async clickDeleteUser(rowIndex = 0) {
    const row = await this.page.locator(this.selectors.tableRowsAlt).nth(rowIndex);
    const deleteButton = row.locator(this.selectors.deleteButtonAlt);
    await deleteButton.click();
    await this.wait(500);
  }

  /**
   * Confirm delete action
   */
  async confirmDelete() {
    const selectors = [
      this.selectors.confirmButton,
      this.selectors.confirmButtonAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ Delete confirmed`);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Delete user (complete flow)
   */
  async deleteUser(rowIndex = 0) {
    await this.clickDeleteUser(rowIndex);
    await this.confirmDelete();
    await this.wait(1000);
  }

  /**
   * Go to next page
   */
  async goToNextPage() {
    const selectors = [
      this.selectors.nextPageButton,
      this.selectors.nextPageButtonAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        await this.wait(1000);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Check if table is visible
   */
  async isTableVisible() {
    const selectors = [
      this.selectors.userTable,
      this.selectors.userTableAlt
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) return true;
    }
    
    return false;
  }
}

module.exports = { UserManagementPage };