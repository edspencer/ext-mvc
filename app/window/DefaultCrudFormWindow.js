/**
 * Ext.ux.App.view.DefaultCrudFormWindow
 * @extends Ext.Window
 * Provides base setup for DefaultNewWindow and DefaultEditWindow.  Would not usually be 
 * instantiated directly
 */
Ext.ux.App.view.DefaultCrudFormWindow = function(config) {
  var config = config || {};
  
  if (!config.model) { throw new Error("You must supply a model to a default form window");}
  
  //save my fingers...
  var singular = config.model.human_singular_name;
  
  Ext.applyIf(config, {
    iconCls:     config.model.model_name,
    height:      480,
    width:       640,
    minHeight:   240,
    minWidth:    320,
    layout:      'fit',
    collapsible: false,
    url:         config.model.collectionDataUrl(),
    
    formConfig:  {},
    
    hasSaveButton:   true,
    hasCancelButton: true,
    
    saveButtonConfig:   {},
    cancelButtonConfig: {},
    
    cancelButtonHandler: function() {
      if (this.fireEvent('beforecancel')) {
        this.close();
        this.fireEvent('cancel');
      };
    }
  });
  
  Ext.applyIf(config.formConfig, {
    defaults: {
      anchor: "-20",
      xtype:  'textfield'
    },
    autoScroll:  true,
    cls:         'x-panel-mc' //without this some weird borders appear in column layouts :(
  });
  
  this.form = new Ext.form.FormPanel(config.formConfig);
  
  if (config.hasSaveButton) {
    this.saveButton = new Ext.Button(
      Ext.applyIf(config.saveButtonConfig, {
        text:    'Save',
        iconCls: 'save',
        scope:   this,
        handler: config.saveButtonHandler,
        tooltip: 'Saves this ' + singular + ' (keyboard shortcut: CTRL + s)'
      })
    );
    
    this.form.addButton(this.saveButton);
  };
  
  if (config.hasCancelButton) {
    this.cancelButton = new Ext.Button(
      Ext.applyIf(config.cancelButtonConfig, {
        text:    'Cancel',
        iconCls: 'cancel',
        scope:   this,
        handler:  config.cancelButtonHandler,
        tooltip: 'Cancel save'
      })
    );
    
    this.form.addButton(this.cancelButton);
  };
  
  /**
   * Provide an optional helpConfig to config in order to display usage tips
   */
  if (config.helpConfig) {
    this.helpPanel = new Ext.Panel(
      Ext.applyIf(config.helpConfig, {
        region: 'west',
        split:  false,
        width:  200,
        cls:    'x-panel-help',
        bodyStyle: 'padding: 10px; font-size: 12px;'
      })
    );
    
    this.form.region = 'center';
    
    var mainPanel = new Ext.Panel({
      layout: 'border',
      items:  [this.form, this.helpPanel]
    });
    
    config.items = [mainPanel];
  } else {
    config.items = [this.form];
  };
  
  Ext.ux.App.view.DefaultCrudFormWindow.superclass.constructor.call(this, config);
  
  this.addEvents({
    'beforesave'  : true,
    'save'        : true,
    'savefailed'  : true,
    'beforecancel': true,
    'cancel'      : true
  });
};
Ext.extend(Ext.ux.App.view.DefaultCrudFormWindow, Ext.Window);
