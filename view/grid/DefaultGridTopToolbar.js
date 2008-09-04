/**
 * Ext.ux.MVC.DefaultGridTopToolbar
 * @extends Ext.Toolbar
 * Default toolbar providing customisable Add, Edit, Delete and CSV Export buttons
 */
Ext.ux.MVC.DefaultGridTopToolbar = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    items:       [],
    itemsBefore: [],
    itemsAfter:  [],
    
    hasSearchField:     true,
    hasAddButton:       true,
    hasEditButton:      true,
    hasDeleteButton:    true,
    hasCSVExportButton: false,
    
    searchFieldConfig:  {},
    addButtonConfig:    {},
    editButtonConfig:   {},
    deleteButtonConfig: {},
    csvButtonConfig:    {},
    
    addButtonHandler:    Ext.emptyFn,
    editButtonHandler:   Ext.emptyFn,
    deleteButtonHandler: Ext.emptyFn,
    csvButtonHandler:    Ext.emptyFn
  });
  
  var items = config.itemsBefore;
  
  if (config.hasSearchField) {
    Ext.applyIf(config.searchFieldConfig, {
      width: 200,
      label: 'Search by Name:',
      enableKeyEvents: true
    });
    
    this.searchField = new Ext.app.SearchField(config.searchFieldConfig);
    items = items.concat([config.searchFieldConfig.label, ' ', this.searchField]);
  };
  
  if (config.hasAddButton) {
    this.addButton = new Ext.ux.MVC.DefaultAddButton(Ext.apply(config.addButtonConfig, {
      model:   config.model,
      handler: config.addButtonHandler
    }));
    
    items = items.concat(['-', this.addButton]);
  };
  
  if (config.hasEditButton) {
    this.editButton = new Ext.ux.MVC.DefaultEditButton(Ext.apply(config.editButtonConfig, {
      model:   config.model,
      handler: config.editButtonHandler
    }));
    
    items = items.concat(['-', this.editButton]);
  };
  
  if (config.hasDeleteButton) {
    this.deleteButton = new Ext.ux.MVC.DefaultDeleteButton(Ext.apply(config.deleteButtonConfig, {
      model:   config.model,
      handler: config.deleteButtonHandler
    }));
    
    items = items.concat(['-', this.deleteButton]);
  };
  
  if (config.hasCsvExportButton) {
    this.csvExportButton = new Ext.ux.MVC.DefaultCSVExportButton(Ext.apply(config.csvButtonConfig, {
      model:   config.model,
      handler: config.csvButtonHandler
    }));
    
    items = items.concat(['-', this.csvExportButton]);
  };
  
  items = items.concat(config.itemsAfter);
  config.items = items;
  
  /**
   * Adds handlers to grid events.  Call this after rendering the parent grid
   */
  this.setupHandlers = function() {
    this.ownerCt.getSelectionModel().on('selectionchange', function(selModel){
      if (selModel.selections.length == 0) {
        this.editButton.disable();
        this.deleteButton.disable();
      } else {
        this.editButton.enable();
        this.deleteButton.enable();
      }
    }, this);
    
    if (this.searchField) {
      //we can't get hold of the grid's store when creating the search field, so must
      //link them together now that everything has been rendered
      this.searchField.store = this.ownerCt.store;
      
      //we also need to stop any key events from propagating up the chain as they may
      //interfere with parent containers' key events
      this.searchField.on('keydown', function(f, e) { e.stopPropagation();});
    };
  };
  
  Ext.ux.MVC.DefaultGridTopToolbar.superclass.constructor.call(this, config);
  
};
Ext.extend(Ext.ux.MVC.DefaultGridTopToolbar, Ext.Toolbar);
Ext.reg('default_grid_top_toolbar', Ext.ux.MVC.DefaultGridTopToolbar);