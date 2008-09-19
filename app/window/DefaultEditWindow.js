/**
 * Ext.ux.App.view.DefaultEditWindow
 * @extends Ext.ux.App.view.DefaultCrudFormWindow
 * Provides sensible default configuration for a window containing an edit form
 */
Ext.ux.App.view.DefaultEditWindow = function(config) {
  var config = config || {};
  
  //save my fingers...
  var singular = config.model.human_singular_name;
  
  Ext.applyIf(config, {
    id:           "edit_" + config.model.model_name + "_window",
    title:        "Edit " + config.model.human_singular_name,
    autoLoadForm: true,    
    url:          config.model.singleDataUrl(config.object_id),
    
    formConfig: {},
    
    saveButtonHandler: function() {
      if (this.ownerCt.fireEvent('beforesave')) {
        this.form.submit({
          url:     config.url, 
          waitMsg: 'Saving Data...',
          scope:   this,
          
          failure: function() {
            Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + singular + ', please see any fields with red icons');
          },
          
          success: function(formElement, action) {
            Ext.ux.MVC.Flash.flash('The ' + singular + ' was updated successfully', singular + ' Updated');
            if (this.ownerCt.fireEvent('save')) {this.ownerCt.close();}
          }
        });
      };
    },
    
    cancelButtonHandler: function() {
      if (this.ownerCt.fireEvent('beforecancel')) {
        this.ownerCt.close();
        this.ownerCt.fireEvent('cancel');
      };
    }
  });
  
  //automatically adds a field called '_method' with value 'PUT'
  Ext.applyIf(config.formConfig, {addPutMethodField: true});
  
  this.addEvents({
    'formloaded':     true,
    'formloadfailed': true
  });
    
  if (config.formConfig.addPutMethodField) {
    var putField = { xtype: 'hidden', name: '_method', value: 'put'};
    config.formConfig.items = [putField].concat(config.formConfig.items);
  };
  
  Ext.ux.App.view.DefaultEditWindow.superclass.constructor.call(this, config);
  
  this.loadForm = function() {
    this.form.load({
      url:    config.model.singleDataUrl(config.object_id),
      method: 'get',
      scope:  this,
      success: function() {
        this.fireEvent('formloaded');
      },
      failure: function() {
        this.fireEvent('formloadfailed');
      }
    });
  };
  
  //load the record into the form
  if (config.autoLoadForm) { this.loadForm(); }
};
Ext.extend(Ext.ux.App.view.DefaultEditWindow, Ext.ux.App.view.DefaultCrudFormWindow);
Ext.reg('default_edit_window', Ext.ux.App.view.DefaultEditWindow);