/**
 * Ext.ux.App.view.DefaultGridWindow
 * @extends Ext.Window
 * Provides sensible default configuration for most paging grid windows
 */
Ext.ux.App.view.DefaultGridWindow = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    title:     'Paging Grid',
    iconCls:   'grid_list',
    layout:    'fit',
    height:    480,
    width:     640,
    minHeight: 240,
    minWidth:  320,
    shim:      false,
    tools:     [],
    
    keys: [
      { key: 'a', scope: this, handler: this.addHandler },
      { key: 'e', scope: this, handler: this.editHandler },
      { key: 'd', scope: this, handler: this.deleteHandler },
      { key: 'f', scope: this, handler: this.firstPage },
      { key: 'p', scope: this, handler: this.previousPage },
      { key: 'n', scope: this, handler: this.nextPage },
      { key: 'l', scope: this, handler: this.lastPage },
      { key: 'r', scope: this, handler: this.refresh }
    ],
    
    hasTopToolbar:    true,
    hasPagingToolbar: true,
    
    gridConfig:       {},
    topToolbarConfig: {}
  });
  
  Ext.applyIf(config, {
    id: "index_" + config.gridConfig.model.model_name + "_window"
  });
  
  //Convenient way of adding a help tool to the top right of the window
  if (config.hasHelpTool) {
    config.tools.push({
      id:   'help',
      scope: this,
      handler: function() {
        this.controller.callAction('help');
      }
    });
  };
  
  if (config.gridConfig.model == null) {alert("Error - no Model supplied to DefaultGridWindow"); return false;};
  this.model = config.gridConfig.model;
  
  this.selectionModel = new Ext.grid.CheckboxSelectionModel();
  
  this.columnModel    = new Ext.grid.ColumnModel([this.selectionModel].concat(config.gridConfig.columns));
  this.columnModel.defaultSortable = true;
  this.columnModel.defaultWidth = 160;
  
  Ext.applyIf(config.gridConfig, {
    clicksToEdit:  1,
    loadMask:      true,
    viewConfig:    {forceFit: true},
    tbar:          null,
    autoLoadStore: true,
    id:            this.model.url_name + '_grid',
    store:         this.model.collectionStore(),
    sm:            this.selectionModel,
    cm:            this.columnModel
  });
  
  //Tell the top toolbar to use actions defined here, and to this this as scope
  Ext.applyIf(config.topToolbarConfig, {
    addButtonHandler:    this.addHandler,
    editButtonHandler:   this.editHandler,
    deleteButtonHandler: this.deleteHandler,
    
    addButtonConfig:    {scope: this},
    editButtonConfig:   {scope: this},
    deleteButtonConfig: {scope: this},
    
    model:      this.model,
    controller: config.controller
  });
  
  if (config.hasPagingToolbar) {
    config.gridConfig.bbar = new Ext.ux.MVC.DefaultPagingToolbar({store: config.gridConfig.store, model: this.model});
    config.gridConfig.plugins = [config.gridConfig.bbar];
  };
  
  if (config.hasTopToolbar) {
    this.tbar = new Ext.ux.MVC.DefaultGridTopToolbar(config.topToolbarConfig);
    
    config.gridConfig.tbar = this.tbar;
  };
  
  this.grid = new Ext.grid.GridPanel(config.gridConfig);
  if (config.hasTopToolbar) {
    this.grid.on('render', this.tbar.setupHandlers, this.tbar);
  };
    
  Ext.apply(config, {items: this.grid});
  
  Ext.ux.App.view.DefaultGridWindow.superclass.constructor.call(this, config);
  
  
  //attempt to retrieve state to keep on the same page we were on last time
  //TODO: refactor this out of here, should be an initializer like the paging toolbar one
  try {
    var start = Ext.state.Manager.getProvider().get(config.gridConfig.id).start || 0;
  } catch(e) {
    var start = 0;
  }
  
  if (config.gridConfig.autoLoadStore) {
    this.grid.store.load({params: {start: start, limit: 25}});    
  };
  
  this.grid.on('rowcontextmenu', this.showContextMenu, this);
  this.grid.on('rowdblclick', this.editHandler, this);
  this.on('render', this.createGridContextMenu);
};

Ext.extend(Ext.ux.App.view.DefaultGridWindow, Ext.Window, {
  /**
   * Navigates this window's grid to the first page
   */
  firstPage: function() {
    var store = this.grid.store;
    store.load({params: {start: 0, limit: store.lastOptions.params.limit}});
  },
  
  /**
   * Navigates this window's grid to the previous page
   */
  previousPage: function() {
    return this.nextOrPreviousPage(this.grid.store, 'Down');
  },
  
  /**
   * Navigates this window's grid to the next page
   */
  nextPage: function() {
    return this.nextOrPreviousPage(this.grid.store, 'UP');
  },
  
  /**
   * Navigates this window's grid to the last page
   */
  lastPage: function() {
    var store = this.grid.store;
    var limit = store.lastOptions.params.limit;
    var lastPage = Math.floor((store.totalLength - 1) / limit) * limit;
    
    this.grid.store.load({params: {start: lastPage, limit: limit}});
  },
  
  /**
   * Refreshes this window's grid
   */
  refresh: function() {
    this.grid.store.reload();
  },
  
  /**
   * Private.  Displays the grid's context menu on right click
   */
  showContextMenu: function(grid, rowIndex, e) {
    e.stopEvent();
    
    //to avoid user confusion, select the underlying row first (keep existing selections)
    grid.getSelectionModel().selectRow(rowIndex, true);
    
    //make sure the context menu has been rendered
    if (!this.contextMenu.el) { this.contextMenu.render();}
    this.contextMenu.showAt(e.getXY());
  },
  
  /**
   * Private. Called on render, creates the Ext.Menu which is reused for the context menu
   * whenever the user right clicks a row in the grid
   */
  createGridContextMenu: function() {
    this.contextMenu = new Ext.ux.MVC.view.DefaultGridContextMenu({
      model:         this.model,
      grid:          this.grid,
      scope:         this,
      addHandler:    this.addHandler,
      editHandler:   this.editHandler,
      deleteHandler: this.deleteHandler
    });
    
    return this.contextMenu;
  },
  
  //private - the dirty logic powering nextPage and previousPage
  nextOrPreviousPage : function(store, direction) {
    var lastOpts = store.lastOptions.params;
    
    if (direction == 'UP') {
      if (lastOpts.start + lastOpts.limit < store.totalLength) {
        lastOpts.start = lastOpts.start + lastOpts.limit;
      }
    } else {
      if (lastOpts.start - lastOpts.limit >= 0) {
        lastOpts.start = lastOpts.start - lastOpts.limit;
      }
    };
    
    store.load({params: lastOpts});
  },
  
  /**
   * Calls the 'new' action on this Window's controller
   */
  addHandler: function() {
    this.controller.callAction('new');
  },
  
  /**
   * Calls the 'edit' action on this Window's controller, passing it an array of 
   * record ids as an argument
   */
  editHandler: function() {
    var ids = this.getSelectedRecordIds();
    this.controller.callAction('edit', ids);
  },
  
  /**
   * Calls the 'delete' action on this Window's controller, passing it an array of 
   * record ids as an argument
   */
  deleteHandler: function() {
    var ids = this.getSelectedRecordIds();
    this.controller.callAction('destroy', ids);
  },
  
  /**
   * Returns an array of currently selected record IDs from a given selection model
   * @param {Ext.grid.AbstractSelectionModel} selModel The selection model to find currently selected record IDs from
   * @return {Array} The array of record IDs
   */
  getSelectedRecordIds: function() {
    var ids = [];
    var selections = this.grid.getSelectionModel().getSelections();
    
    Ext.each(selections, function(selection) {ids.push(selection.data.id);});
    return ids;
  }
  
});

Ext.reg('default_grid_window', Ext.ux.App.view.DefaultGridWindow);