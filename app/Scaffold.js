/**
 * Ext.ux.App.Scaffold
 * @extends Ext.ux.App.Base
 * CRUD Scaffold for any simple app
 */
Ext.ux.App.Scaffold = function(config) {
  var config = config || {};
  
  if (!config.model) {
    throw new Error('You must provide a model to Ext.ux.App.Scaffold (e.g. Ext.ux.App.MyApp.ModelName).');
  };
  
  if (!config.namespace) {
    throw new Error('You must provide a namespace to Ext.ux.App.Scaffold.  This should be something like Ext.ux.App.MyApp.');
  };
  
  Ext.apply(this, config, {
    viewWindowNamespace: config.model.model_name,
    launcherConfig: {},
    
    indexViewConfig: {},
    newViewConfig:   {},
    editViewConfig:  {}
  });
  
  //copy some generic config into launcherConfig
  Ext.applyIf(this.launcherConfig, {
    text: this.text,
    iconCls: this.iconCls
  });
  
  Ext.ux.App.Scaffold.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.App.Scaffold, Ext.ux.App.Base, {
  /**
   * Returns the views package name for this app (e.g. Ext.ux.App.MyApp.view)
   * @param {String} viewName An optional name to append to the views package
   */
  viewsPackage: function(viewName) {
    var ns = this.namespace + ".view";
    if (viewName) {
      ns += "." + viewName;
    };
    
    return ns;
  },
  
  /**
   * Test whether the given view has already been defined under this namespace
   * @param {String} viewName The name of the view to test (e.g. "Index")
   * @return {Boolean} True if this view already exists, false otherwise
   */
  viewExists: function(viewName) {
    if (eval(this.viewsPackage() + "." + viewName)) {
      return true;
    } else {
      return false;
    };
  },
  
  /**
   * Initialises the scaffold application, creating views, controller and launcher if required
   */
  init: function() {
    //set up the views namespace
    Ext.namespace(this.viewsPackage());
  
    //create each view if it has not been created already
    this.formFields  = this.createFormFields();
    this.gridColumns = this.createGridFields();
    
    this.createIndexView();
    this.createNewView();
    this.createEditView();
    
    //create a default CRUD controller
    this.createController();
    
    //set up the launcher to initialize this application
    this.launcher = Ext.applyIf(this.launcherConfig, {
      scope:   this,
      handler: this.launch,
      text:    'Scaffold Application'
    });
  },
  
  /**
   * Reflects on this.model and attempts to build an appropriate set of form fields
   * for use in the new and edit forms.  Fields are written to Ext.ux.App.MyApp.view.FormFields,
   * which is a function
   */
  createFormFields: function() {
    //do not overwrite the form fields if the user has already defined them
    if (this.viewExists('FormFields')) { return eval(this.viewsPackage('FormFields')); }
        
    var formFields = [];
    
    //build the form fields
    for (var i=0; i < this.model.fields.length; i++) {
      var field = this.model.fields[i];
      
      //skip any field names we don't like the look of
      if (field.name == 'id') { continue; };
      
      var formField = {
        fieldLabel: String.capitalize(field.name),
        name:       this.model.model_name + "[" + field.name + "]"
      };
      
      formFields.push(formField);
    };
    
    this.formFields = formFields;
    
    /**
     * Eval horridness to create a function and assign it to the appropriate
     * Ext.ux.App.AppName.view.FormFields class
     */
    fieldsFunction = function() { return formFields; };
    eval(this.viewsPackage('FormFields') + " = fieldsFunction");
    
    return formFields;
  },
  
  /**
   * Reflects on this.model and attempts to build an appropriate set of grid columns
   * for use on the Index grid.  Columns are written to Ext.ux.App.MyApp.view.GridColumns,
   * which is a function
   */
  createGridFields: function() {
    //do not overwrite the form fields if the user has already defined them
    if (this.viewExists('GridColumns')) {return eval(this.viewsPackage('GridColumns'));}
    
    var gridColumns = [];
    
    for (var i=0; i < this.model.fields.length; i++) {
      var field = this.model.fields[i];
      
      //skip any field names we don't like the look of
      if (field.name == 'id') { continue; };
      
      var gridColumn = {
        header:    String.capitalize(field.name),
        dataIndex: field.name,
        type:      field.type
      };
            
      gridColumns.push(gridColumn);
    };
        
    /**
     * Eval horridness to create a function and assign it to the appropriate
     * Ext.ux.App.AppName.view.GridColumns class
     */
    fieldsFunction = function() { return formFields; };
    eval(this.viewsPackage('GridColumns') + " = fieldsFunction");
    
    return gridColumns;
  },
  
  /**
   * Creates the 'Index' view for this scaffold
   */
  createIndexView: function() {
    if (!this.viewExists("Index")) {
      
      var gridConfig = Ext.apply(this.indexViewConfig, {
        title:   this.text,
        iconCls: this.iconCls,
        gridConfig: {
          model:   this.model,
          columns: this.gridColumns
        }
      });
      
      var tempView = function(config) {
        var config = config || {};
        Ext.applyIf(config, gridConfig);
        tempView.superclass.constructor.call(this, config);
      };
      
      //extend the tempView with the New or Edit Default Window, assign it to the
      //appropriate Ext.ux.App.MyApp.view.(Edit or New)
      Ext.extend(tempView, Ext.ux.App.view.DefaultGridWindow);
      eval(this.viewsPackage("Index") + " = tempView;");
    };
  },
  
  /**
   * Creates the 'New' view for this scaffold
   */
  createNewView: function() {
    if (!this.viewExists("New")) {
      this.createFormView("New", this.newViewConfig);
    };
  },
  
  /**
   * Creates the 'Edit' view for this scaffold
   */
  createEditView: function() {
    if (!this.viewExists("Edit")) {
      this.createFormView("Edit", this.editViewConfig);
    };
  },
  
  /**
   * Abstraction of creator function for creating New and Edit form views.
   * @param {String} formName The name of the form to create (should be Edit or New, usually)
   * @param {Object} formConfig A config object which will be applied to the form.  Should be one of this.newViewConfig or this.editViewConfig
   */
  createFormView: function(formName, formConfig) {
    var formConfig = formConfig || {};
    
    Ext.apply(formConfig, {
      model:   this.model,
      iconCls: this.iconCls,
      formConfig: {
        items: this.formFields
      }
    });
    
    var tempView = function(config) {
      var config = config || {};
      Ext.applyIf(config, formConfig);
      
      tempView.superclass.constructor.call(this, config);
    };
    
    //extend the tempView with the New or Edit Default Window, assign it to the
    //appropriate Ext.ux.App.MyApp.view.(Edit or New)
    eval("Ext.extend(tempView, Ext.ux.App.view.Default" + formName + "Window);");
    eval(this.viewsPackage(formName) + " = tempView;");
  },
  
  /**
   * Creates a controller if one is not already present
   */
  createController: function() {
    if (!this.controller) {
      this.controller = new Ext.ux.App.CrudController({
        model:               this.model, 
        app:                 this,
        viewsPackage:        this.viewsPackage(),
        viewWindowNamespace: this.viewWindowNamespace
      });
    };
  }
});
