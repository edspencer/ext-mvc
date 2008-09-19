/**
 * Ext.ux.MVC.view.DefaultGridContextMenu
 * @extends Ext.menu.Menu
 * Provides a default context menu implementation suitable for most grids
 */
Ext.ux.MVC.view.DefaultGridContextMenu = function(config) {
  var config = config || {};
  
  if (!config.model) { throw new Error("You must provide a model to DefaultGridContextMenu"); }
  if (!config.grid)  { throw new Error("You must provide a grid to DefaultGridContextMenu"); }
  
  Ext.applyIf(config, {
    hasEditMenuItem:   true,
    hasAddMenuItem:    true,
    hasDeleteMenuItem: true,
    items:             []
  });
  
  this.singular = config.model.human_singular_name;
  this.plural   = config.model.human_plural_name;
  
  if (config.hasEditMenuItem) {
    this.editMenuItem = new Ext.menu.Item({
      iconCls: 'edit',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Edit selected " + this.singular
    });
    
    config.items.push(this.editMenuItem);
  };
  
  if (config.hasDeleteMenuItem) {
    this.deleteMenuItem = new Ext.menu.Item({
      iconCls: 'delete',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Delete selected " + this.singular
    });
    
    config.items.push(this.deleteMenuItem);
  };
  
  if (config.hasAddMenuItem) {
    this.addMenuItem = new Ext.menu.Item({
      iconCls: 'add',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Add a new " + this.singular
    });
    
    config.items.push(this.addMenuItem);
  };
    
  Ext.ux.MVC.view.DefaultGridContextMenu.superclass.constructor.call(this, config);
  
  //update text pluralisation based on number of rows selected
  this.on('beforeshow', this.updateItemText, this);
};

Ext.extend(Ext.ux.MVC.view.DefaultGridContextMenu, Ext.menu.Menu, {
  /**
   * Updates the text on every menu item which requires pluralisation
   */
  updateItemText: function() {
    this.updateEditItemText();
    this.updateDeleteItemText();
  },
  
  /**
   * Updates the text on the edit menu item to provide pluralisation based on the number
   * of selected rows on the grid
   */
  updateEditItemText: function() {
    if (this.editMenuItem) {
      this.editMenuItem.setText(this.singularOrPlural('Edit'));
    };
  },
  
  /**
   * Updates the text on the delete menu item to provide pluralisation based on the number
   * of selected rows on the grid
   */
  updateDeleteItemText: function() {
    if (this.deleteMenuItem) {
      this.deleteMenuItem.setText(this.singularOrPlural('Delete'));
    };
  },
  
  /**
   * Private helper method to return a pluralised menu item text string based on how many
   * grid rows are currently selected
   */
  singularOrPlural: function(action_word) {
    if (this.grid.getSelectionModel().getCount() == 1) {
      return action_word + " selected " + this.singular;
    } else {
      return action_word + " selected " + this.plural;
    };
  }
});

Ext.reg('default_grid_context_menu', Ext.ux.MVC.view.DefaultGridContextMenu);