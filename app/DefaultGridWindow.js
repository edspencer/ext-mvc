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
    
    hasTopToolbar: true,
    hasPagingToolbar: true,
    
    gridConfig: {},
    topToolbarConfig: {}
  });
  
  if (config.gridConfig.model == null) {alert("Error - no Model supplied to DefaultGridWindow"); return false;};
  this.model = config.gridConfig.model;
  
  this.selectionModel = new Ext.grid.CheckboxSelectionModel();
  
  this.columnModel    = new Ext.grid.ColumnModel([this.selectionModel].concat(config.gridConfig.columns));
  this.columnModel.defaultSortable = true;
  this.columnModel.defaultWidth = 160;
  
  Ext.applyIf(config.gridConfig, {
    clicksToEdit: 1,
    loadMask: true,
    viewConfig: {forceFit: true},
    tbar: null,
    autoLoadStore: true,
    id: this.model.url_name + '_grid',
    store: this.model.collectionStore(),
    sm: this.selectionModel,
    cm: this.columnModel
  });
  
  if (config.hasPagingToolbar) {
    config.gridConfig.bbar = new Ext.ux.MVC.DefaultPagingToolbar({store: config.gridConfig.store, model: this.model});
    config.gridConfig.plugins = [config.gridConfig.bbar];
  };
  
  if (config.hasTopToolbar) {
    var tbar = new Ext.ux.MVC.DefaultGridTopToolbar(
      Ext.apply({model: this.model, controller: config.controller}, config.topToolbarConfig)
    );
    
    config.gridConfig.tbar = tbar;
  };
  
  this.grid = new Ext.grid.GridPanel(config.gridConfig);
  if (config.hasTopToolbar) {
    this.grid.on('render', tbar.setupHandlers, tbar);
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
  
};
Ext.extend(Ext.ux.App.view.DefaultGridWindow, Ext.Window);
Ext.reg('default_grid_window', Ext.ux.App.view.DefaultGridWindow);