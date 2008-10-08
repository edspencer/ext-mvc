/**
 * Ext.ux.App.view.DefaultNewWindow
 * @extends Ext.ux.App.view.DefaultCrudFormWindow
 * Provides a sensible framework for creating windowed forms for a new object
 */
Ext.ux.App.view.DefaultNewWindow = function(config) {
  var config = config || {};
    
  //save my fingers...
  var singular = config.model.human_singular_name;
  
  Ext.applyIf(config, {
    id:       "new_" + config.model.model_name + "_window",
    title:    "New " + config.model.human_singular_name,
    
    saveButtonHandler: function() {
      if (this.ownerCt.fireEvent('beforesave')) {
        this.form.submit({
          url:     config.url, 
          waitMsg: 'Saving Data...',
          scope:   this,
          
          failure: function() {
            if (!this.ownerCt.fireEvent('savefailed')) {
              Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + singular + ', please see any fields with red icons');
            };
          },
          
          success: function(formElement, action) {
            Ext.ux.MVC.NotificationManager.inform({message: 'The ' + singular + ' was created successfully'});
            if (this.ownerCt.fireEvent('save')) {this.ownerCt.close();}
          }
        });
      };
    }
  });
    
  Ext.ux.App.view.DefaultNewWindow.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.view.DefaultNewWindow, Ext.ux.App.view.DefaultCrudFormWindow);
Ext.reg('default_new_window', Ext.ux.App.view.DefaultNewWindow);