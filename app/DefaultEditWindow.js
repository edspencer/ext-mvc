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
            if (this.ownerCt.fireEvent('save')) {this.ownerCt.editNextId();}
          }
        });
      };
    },
    
    // Override the default behaviour for a form here.  We are passed an array of ids into config.ids,
    // if there is more than one, open the edit screen for the next id
    cancelButtonHandler: function() {
      if (this.ownerCt.fireEvent('beforecancel')) {
        this.ownerCt.editNextId();
        this.ownerCt.fireEvent('cancel');
      };
    }
  });
  
  /**
   * Opens the next ID in config.ids into this form.  Called after save and cancel
   * Closes the window if there are no more IDs to load
   */
  this.editNextId = function() {
    if (config.ids.length > 0) {
      config.ids.shift();
      config.controller.callAction('edit', config.ids);
    } else {
      this.ownerCt.close();
    }
  };
  
  Ext.ux.App.view.DefaultEditWindow.superclass.constructor.call(this, config);
  
  this.loadFormWithId = function(id) {
    config.model.loadFormWithId(id, this.form);
  };
  
  //load the record into the form
  if (config.autoLoadForm) {
    this.loadFormWithId(config.ids[0]);
  };
};
Ext.extend(Ext.ux.App.view.DefaultEditWindow, Ext.ux.App.view.DefaultCrudFormWindow);
Ext.reg('default_edit_window', Ext.ux.App.view.DefaultEditWindow);