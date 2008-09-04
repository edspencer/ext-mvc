/**
 * A basic Crud Controller providing default implementations of the following methods:
 * index, new, edit, update, create, destroy, show
 */
Ext.ux.App.CrudController = function(config) {
  var config = config || {};
  Ext.applyIf(config, {
    hasIndexAction:   true,
    hasNewAction:     true,
    hasEditAction:    true,
    hasUpdateAction:  true,
    hasCreateAction:  true,
    hasDestroyAction: true,
    hasShowAction:    true
  });
  
  //sets up a namespace which will be prepended to the ID of every window created
  //from the views in this Application
  if (!this.viewWindowNamespace) {
    throw new Error("You must provide a viewWindowNamespace to your Crud Controller.  This is used to prepend the ID of every window in this application to enable them to be easily referenced and to not collide with any other applications");
  };
  
  this.installViews();
  this.actions = this.actions || {};
  
  /*
   * We don't need to define actions for index or new here because they are picked up and
   * automatically generated on demand by callAction.  This is possible because they are
   * very simple and don't require and additional config, (literally just displaying a window)
   * for any more complex actions the function must be defined manually
   */
  
  if (!this.actions['show'] && config.hasShowAction) {
    this.actions['show'] = function(id) {
      return this.callAction('edit', id);
    };
  };
  
  if (!this.actions['edit'] && config.hasEditAction) {
    this.actions['edit'] = function(ids) {
      var desktop = this.app.desktop;
      
      //load an edit window for each ID
      for (var i = ids.length - 1; i >= 0; i--){
        var windowId = this.namespacedWindowName('edit', {id: ids[i]});
        var win = desktop.getWindow(windowId);

        if (!win) {
          win = desktop.createWindow({controller: this, id: windowId, object_id: ids[i]}, this.views['edit']);
        }
        
        win.show();
      };
    };
  };
  
  if (!this.actions['update'] && config.hasUpdateAction) {
    this.actions['update'] = function(record) {
      this.model.update(record, {
        success: function() {
          Ext.ux.MVC.Flash.flash("Image successfully updated");
        },
        failure: function() {
          //show some errors
          Ext.ux.ErrorReporter.showErrors(response.errors);
          
        }
      });
    };
  };
  
  if (!this.actions['create'] && config.hasCreateAction) {
    this.actions['create'] = function(options) {
      //call ajax request
      var img = new this.model(options.data);
      
      img.save({
        success: function() {
          Ext.ux.MVC.Flash.flash("Image successfully created");
          this.show(img.id);
        },
        failure: function(response) {
          //show some errors
          Ext.ux.ErrorReporter.showErrors(response.errors);
          
        }
      });
    };
  };
  
  if (!this.actions['destroy'] && config.hasDestroyAction) {
    this.actions['destroy'] = function(one_or_more_ids) {
      console.log('Called destroy with ' + one_or_more_ids.join(", "));
      
      //call ajax request
      Ext.each(one_or_more_ids, function(id) {
        var img = this.model.destroy(id, {
          success: function() {
            Ext.ux.MVC.Flash.flash("Deleted Image " + id);
          },
          failure: function() {
            Ext.ux.MVC.Flash.error("Could not delete image " + id);
          },
          complete: function() {
            if (id == one_or_more_ids[one_or_more_ids.length - 1]) {
              //reload store after final request
              
            };
          }
        });
      });
    };
  };
  
  //Add events for actions defined in subclass
  this.addFilterListeners();
};

Ext.extend(Ext.ux.App.CrudController, Ext.ux.App.Controller);