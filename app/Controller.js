/**
 * Underlying Controller class for any Ext.ux.App application.  
 */
Ext.ux.App.Controller = function(config) {
  var config = config || {};
  
  //sets up a namespace which will be prepended to the ID of every window created
  //from the views in this Application
  if (!config.viewWindowNamespace) {
    throw new Error("You must provide a viewWindowNamespace to your Controller.  This is used to prepend the ID of every window in this application to enable them to be easily referenced and to not collide with any other applications");
  };
  
  //TODO: we can do better than this... keep this. references to important elements
  this.viewWindowNamespace = config.viewWindowNamespace;
  this.viewsPackage        = config.viewsPackage;
  this.app                 = config.app;
  this.model               = config.model;
  
  this.installViews();
  this.actions = this.actions || {};
    
  //Add events for actions defined in subclass
  this.addFilterListeners();
};

Ext.extend(Ext.ux.App.Controller, Ext.util.Observable, {
  /**
   * Adds before and after filters on every controller action.
   * e.g. if this.actions = {'index': myFunc, 'edit': myOtherFunc}
   * then the following filters will be defined:
   * before_index, after_index, before_edit, after_edit
   */
  addFilterListeners: function() {
    if (this.actions) {
      var events = {};
      for (action in this.actions) {
        events[this.actionEventName(action, 'before')] = true;
        events[this.actionEventName(action, 'after')]  = true;
      }
      
      this.addEvents(events);
    };
  },
  
  /**
   * Scans the specifies views package and adds each view to this.views
   * e.g. if you have defined Ext.ux.App.MyApp.view.Index and Ext.ux.App.MyApp.view.Edit,
   * this.views == {'index': Ext.ux.App.MyApp.view.Index, 'edit': Ext.ux.App.MyApp.view.Edit}
   */
  installViews: function() {
    //make sure we have a views object first
    this.views = this.views || {};
    
    if (this.viewsPackage) {
      for (view in eval(this.viewsPackage)) {
        this.views[view.toLowerCase()] = eval(this.viewsPackage + "." + view);
      }
    };
  },
  
  /**
   * Calls the requested action.  The action is wrapped in before and after filters, so calling:
   * callAction('index', {some: args}) calls fireEvent('before_index') before firing the actual action.
   * Defining an on('before_index') listener in this case allows you to perform preprocessing and
   * return false to cancel the action.
   * The after_index event is then called after the index action has been completed.
   * This applies to all actions - e.g. callAction('edit', [...]) also calls before_edit and after_edit
   * 
   * @param {String} name The name of the action to call.  This must be defined in the this.actions hash
   * @param {Array} arguments The list of arguments to call this action with
   * @return {Boolean} The result of any after action events (defaults to true)
   */
  callAction : function(name, arguments) {
    //if this action does not exist, try creating it now.  If that doesn't work, throw an error
    if (!this.actions[name]) {
      var action = this.createDefaultAction(name);
      if (!action) { throw new Error("Undefined method " + name); }
    };
    
    //call before filters
    if (this.fireEvent(this.actionEventName(name, 'before'))) {
      //need to create a delegate here to call the action with the scope of this
      this.actions[name].createDelegate(this, [arguments])();
    }

    //call after filters
    this.fireEvent(this.actionEventName(name, 'after'));
  },
  
  /**
   * If a this.callAction is called for an action that does not exist in this.actions,
   * createDefaultAction will attempt to create the correct behaviour for that action.
   * This is mainly useful for showing very simple views - for example a help window.
   * If you create a help window (say, Ext.ux.App.MyApp.view.Help), you can then just do
   * this.callAction('help') without explicitly defining the action code anywhere.
   * callAction will use createDefaultAction to produce a simple function to show the Help window.
   * 
   * @param {String} action_name The name of the action which could not be found
   * @return {Mixed} The action function if the action was created automatically, false otherwise
   */
  createDefaultAction: function(action_name) {
    if (!this.actions[action_name] && this.viewTemplateExists(action_name)) {
      //create the action and store it in this.actions for future reuse
      this.actions[action_name] = function() {
        var desktop  = this.app.desktop;
        var windowId = this.namespacedWindowName(action_name);
        
        var win = desktop.getWindow(windowId);
        if (!win) {
          win = desktop.createWindow({controller: this, id: windowId}, this.views[action_name]);
        };
        
        win.show();
      };
      
      return this.actions[action_name];
    };
    
    return false;
  },
  
  /**
   * Returns true if the specified view template exists under this.viewPackage.
   * e.g. if this.viewsPackage = Ext.ux.App.MyApp.view and Ext.ux.App.MyApp.view.Index
   * is defined, then this.viewTemplateExists('index') returns true
   * Note, view names will be capitalised before testing (e.g. example above checks for
   * existence of Ext.ux.App.MyApp.view.Index)
   * @param {String} view_name The name of the view to test for the existence of
   * @return {Boolean} True if this view template exists within this.viewPackage, false otherwise
   */
  viewTemplateExists: function(view_name) {
    var view = eval(this.viewsPackage + "." + String.capitalize(view_name));
    
    return typeof(view) == 'function' ? true : false;
  },
  
  /**
   * Convenience method for building a consistent before or after method name
   * @param {String} action_name The name of the action we wish to prepend with a filter
   * @param {String} before_of_after Whether we are defining a before or after filter
   * @returns {String} A consistent name for this action and filter combination, e.g. actionEventName('index', 'before') === 'before_index'
   */
  actionEventName: function(action_name, before_or_after) {
    return before_or_after + "_" + action_name;
  },
  
  /**
   * Creates a unique, namespaced window ID for any window in this application.
   * You must specify this.viewWindowNamespace for this to work (Error raised otherwise)
   * @param {String} action The name of the action this window is associated with
   * @param {Object} options An object with any options to send as arguments.  Currently only object.id is used
   * @return {String} A unique window ID, e.g. if this.viewWindowNamespace = 'users-browser', namespacedWindowName('index') => 'users-browser-index', namespacedWindowName('edit', {id: 1}) => 'users-browser-edit-1'
   */
  namespacedWindowName: function(action, options) {
    var options = options || {};
    
    var name = this.viewWindowNamespace + "-" + action;
    if (options.id) { name += "-" + options.id; };
    
    return name;
  }
});
