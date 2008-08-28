/**
 * Ext.ux.MVC.DefaultGridTopToolbar
 * @extends Ext.Toolbar
 * Default toolbar providing customisable Add, Edit, Delete and CSV Export buttons
 */
Ext.ux.MVC.DefaultGridTopToolbar = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    itemsBefore: [],
    itemsAfter:  [],
    hasAddButton: true,
    hasEditButton: true,
    hasDeleteButton: true,
    hasCSVExportButton: false,
    
    addButtonConfig:    {},
    editButtonConfig:   {},
    deleteButtonConfig: {},
    csvButtonConfig:    {},
    
    addButtonHandler: function() {
      config.controller.callAction('new');
    },
    
    editButtonHandler: function() {
      var ids = this.idsFromSelectionModel(this.ownerCt.getSelectionModel());
      config.controller.callAction('edit', ids);
    },
    
    deleteButtonHandler: function() {
      var ids = this.idsFromSelectionModel(this.ownerCt.getSelectionModel());
      config.controller.callAction('destroy', ids);
    },
    
    csvButtonHandler: function() {
      alert("CSV");
    }
  });
  
  var items = config.itemsBefore;
  
  if (config.hasAddButton) {
    this.addButton = new Ext.ux.MVC.DefaultAddButton(Ext.apply(config.addButtonConfig, {
      model:   config.model,
      handler: config.addButtonHandler,
      scope:   this
    }));
    
    items = items.concat(['-', this.addButton]);
  };
  
  if (config.hasEditButton) {
    this.editButton = new Ext.ux.MVC.DefaultEditButton(Ext.apply(config.editButtonConfig, {
      model:   config.model,
      handler: config.editButtonHandler,
      scope:   this
    }));
    
    items = items.concat(['-', this.editButton]);
  };
  
  if (config.hasDeleteButton) {
    this.deleteButton = new Ext.ux.MVC.DefaultDeleteButton(Ext.apply(config.deleteButtonConfig, {
      model:   config.model,
      handler: config.deleteButtonHandler,
      scope:   this
    }));
    
    items = items.concat(['-', this.deleteButton]);
  };
  
  if (config.hasCsvExportButton) {
    this.csvExportButton = new Ext.ux.MVC.DefaultCSVExportButton(Ext.apply(config.csvButtonConfig, {
      model:   config.model,
      handler: config.csvButtonHandler,
      scope:   this
    }));
    
    items = items.concat(['-', this.csvExportButton]);
  };
  
  items = items.concat(config.itemsAfter);
  config.items = items;
  
  /**
   * Adds handlers to grid events.  Call this after rendering the parent grid
   */
  this.setupHandlers = function() {
    this.ownerCt.on('rowdblclick', config.editButtonHandler, this);
    
    this.ownerCt.getSelectionModel().on('selectionchange', function(selModel){
      if (selModel.selections.length == 0) {
        this.editButton.disable();
        this.deleteButton.disable();
      } else {
        this.editButton.enable();
        this.deleteButton.enable();
      }
    }, this);
  };
  
  /**
   * Returns an array of currently selected record IDs from a given selection model
   * @param {Ext.grid.AbstractSelectionModel} selModel The selection model to find currently selected record IDs from
   & @return {Array} The array of record IDs
   */
  this.idsFromSelectionModel = function(selModel) {
    var ids = [];
    var selections = selModel.getSelections();
    
    Ext.each(selections, function(selection) {ids.push(selection.data.id);});
    return ids;
  };

  Ext.ux.MVC.DefaultGridTopToolbar.superclass.constructor.call(this, config);
  
};
Ext.extend(Ext.ux.MVC.DefaultGridTopToolbar, Ext.Toolbar);
Ext.reg('default_grid_top_toolbar', Ext.ux.MVC.DefaultGridTopToolbar);