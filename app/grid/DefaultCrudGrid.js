/**
 * Ext.ux.App.view.DefaultCrudGrid
 * @extends Ext.grid.GridPanel
 * Default grid featuring a top toolbar and paging toolbar
 */
Ext.ux.App.view.DefaultCrudGrid = function(config) {
  var config = config || {};
  
  if (config.model == null     ) { throw new Error("Error - no Model supplied to DefaultCrudGrid");};
  if (config.controller == null) { throw new Error("Error - no Controller supplied to DefaultCrudGrid");};
  this.model = config.model;
  this.controller = config.controller;
  
  this.selectionModel = new Ext.grid.CheckboxSelectionModel();
  
  this.columnModel    = new Ext.grid.ColumnModel([this.selectionModel].concat(config.columns));
  this.columnModel.defaultSortable = true;
  this.columnModel.defaultWidth = 160;
  
  Ext.applyIf(config, {
    hasTopToolbar:    true,
    hasPagingToolbar: true,
    topToolbarConfig: {},
    
    clicksToEdit:     1,
    loadMask:         true,
    viewConfig:       {forceFit: true},
    tbar:             null,
    autoLoadStore:    true,
    id:               this.model.url_name + '_grid',
    store:            this.model.collectionStore(),
    sm:               this.selectionModel,
    cm:               this.columnModel
  });
  
  this.store = config.store;
  
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
    config.bbar = new Ext.ux.MVC.DefaultPagingToolbar({
      store: config.store,
      model: this.model
    })
    config.plugins = [config.bbar];
  };
  
  if (config.hasTopToolbar) {
    this.tbar = new Ext.ux.MVC.DefaultGridTopToolbar(config.topToolbarConfig);
    console.log('fucker');
    console.log(this.tbar);
    config.tbar = this.tbar;
    
    this.tbar.on('render', this.tbar.setupHandlers, this);
  };
  
  //attempt to retrieve state to keep on the same page we were on last time
  //TODO: refactor this out of here, should be an initializer like the paging toolbar one
  try {
    var start = Ext.state.Manager.getProvider().get(config.id).start || 0;
  } catch(e) {
    var start = 0;
  }
  
  if (config.autoLoadStore) {
    this.store.load({params: {start: start, limit: 25}});    
  };
  
  Ext.ux.App.view.DefaultCrudGrid.superclass.constructor.call(this, config);
  
  this.on('rowcontextmenu', this.showContextMenu, this);
  this.on('rowdblclick',    this.editHandler,     this);
  
  if (config.hasTopToolbar) {
    this.on('render', function() {
      // console.log("rendering grid");
      // 
      // console.log(this.tbar);
      // this.tbar.on('render', function() {
      //   console.log("rendering tbar");
      // });
      // 
      // boo = this;
      // 
      // //FIXME: ridiculous hack
      // var delayedTask = new Ext.util.DelayedTask();
      // delayedTask.delay(2000, function() {
      //   this.tbar.setupHandlers();
      // }, this);
      // 
      // 
      // // this.ownerCt.on('render', function() {
      // //   console.log("rendered ownerCt");
      // //   this.tbar.setupHandlers();
      // // }, this.tbar);
      
      this.createGridContextMenu();
    }, this);
  };
};
Ext.extend(Ext.ux.App.view.DefaultCrudGrid, Ext.grid.GridPanel, {
  /**
   * Navigates this window's grid to the first page
   */
  firstPage: function() {
    var store = this.store;
    store.load({params: {start: 0, limit: store.lastOptions.params.limit}});
  },
  
  /**
   * Navigates this window's grid to the previous page
   */
  previousPage: function() {
    return this.nextOrPreviousPage(this.store, 'Down');
  },
  
  /**
   * Navigates this window's grid to the next page
   */
  nextPage: function() {
    return this.nextOrPreviousPage(this.store, 'UP');
  },
  
  /**
   * Navigates this window's grid to the last page
   */
  lastPage: function() {
    var store = this.store;
    var limit = store.lastOptions.params.limit;
    var lastPage = Math.floor((store.totalLength - 1) / limit) * limit;
    
    this.store.load({params: {start: lastPage, limit: limit}});
  },
  
  /**
   * Refreshes this window's grid
   */
  refresh: function() {
    this.store.reload();
  },
  
  /**
   * Private.  Displays the grid's context menu on right click
   */
  showContextMenu: function(grid, rowIndex, e) {
    e.stopEvent();
    
    //to avoid user confusion, select the underlying row first (keep existing selections)
    this.getSelectionModel().selectRow(rowIndex, true);
    
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
      grid:          this,
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
    var selections = this.getSelectionModel().getSelections();
    
    Ext.each(selections, function(selection) {ids.push(selection.data.id);});
    return ids;
  }
  
});


Ext.reg('default_crud_grid', Ext.ux.App.view.DefaultCrudGrid);