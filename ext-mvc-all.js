Ext.namespace("Ext.ux.MVC");

Ext.ux.MVC = {
  version: "0.4",
  
  /**
   * Method to set up namespaces for views, controllers, models, views and each view directory.  Calling:
   * Ext.ux.MVC.createNamespaces('MyNamespace', ['users', 'products']);
   * is equivalent to:
   * Ext.namespace("MyNamespace.views.users", "MyNamespace.views.products");
   */
  createNamespaces: function(namespace, views) {
    //First, set up top level namespaces
    Ext.namespace(namespace, namespace + ".controllers", namespace + ".models", namespace + ".views", namespace + ".helpers");
    
    for (var i = views.length - 1; i >= 0; i--){
      Ext.namespace(namespace + ".views." + views[i]);
    };
  },
  
  /**
   * Creates global aliases to make Ext MVC feel more like rails.
   * Specifically, provide aliases for:
   * Ext.ux.MVC.params => params
   * Ext.ux.MVC.Flash.flash => flash
   */
  behaveLikeRails: function() {
    params = Ext.ux.MVC.params;
    flash  = Ext.ux.MVC.Flash.flash;
  }
};

Ext.namespace("Ext.ux.MVC.controller", "Ext.ux.MVC.model", "Ext.ux.MVC.view", "Ext.ux.MVC.helper", "Ext.ux.MVC.Plugin", "Ext.ux.MVC.LayoutManager");

//additional helper namespaces
Ext.namespace("Ext.ux.MVC.helper.button", "Ext.ux.MVC.helper.grid", "Ext.ux.MVC.helper.form");

//set up namespaces for applications
Ext.namespace("Ext.ux.App", "Ext.ux.App.view");





function Application(config) {
  var config = config || {};
  
  this.controllers = [];
  
  //TODO: Can we do this a less disgusting way?
  //a bit of eval horridness to automatically register the controllers in this namespace
  if (config.namespace) {
    config.namespace_var = eval(config.namespace);
    for (c in config.namespace_var.controllers) {
      eval("this.registerController(" + config.namespace + ".controllers." + c + ", '" + c + "');");
    };
  };
  
  //initialize the History manager if a router has been defined
  if (config.router) {
    this.dispatcher = new Ext.ux.MVC.Dispatcher({router: config.router, application: this});
    Ext.History.init();
    Ext.History.on('change', function(token) {
      if (token) {
        this.dispatcher.dispatch(token);
      } else {
        //TODO: Should go to a default place... but where? :)
        
      };
    }, this);
  };
  
  //initialize the Request Exception Handler
  this.requestExceptionHandler = new Ext.ux.MVC.RequestExceptionHandler();
  
  this.layoutManager = new Ext.ux.MVC.LayoutManager.LeftMenuLayoutManager(config.layout);  
  this.layoutManager.initialize();
};
  
Application.prototype = {
  getLayoutManager : function() {
    return this.layoutManager;
  },
  
  getRouter : function() {
    return this.router;
  },
  
  setRouter : function(router) {
    this.router = router;
  },

  registerController : function(controller, controller_name) {
    this.controllers[controller_name] = controller;
  },

  getControllerByName : function(controller_name) {
    return new this.controllers[controller_name];
  },
  
  /**
   * Restores the application to the correct view.  Used when first initializing the application
   */
  initialize : function(config) {
    var config = config || {};
    
    if (window.location.hash) {
      url = window.location.hash.replace(/#/, '');
      this.dispatcher.dispatch(url);
    } else {
      if (config.defaultView) {
        Ext.History.add(config.defaultView);
      } else {
        throw new Error("Couldn't find any view to display when initializing the application.  Call application.initialize({defaultView: \"dashboard/Index\"}) or similar to show a default view)");
      };
    };
  }
};

/**
 * Custom Array extensions inspired by Ruby's Enumerable methods
 * @author Ed Spencer
 */
 
Ext.override(Array, {
  
  /**
   * Returns the first element of the array
   */
  first: function() {
    return this[0];
  },
  
  /**
   * Returns the last element of the array
   */
  last: function() {
    return this[this.length - 1];
  },
  
  /**
   * Runs the given function on each element of the array
   */
  each: function(fun, scope) {
    var scope = scope || this;
    for (var i=0; i < this.length; i++) {
      fun.call(scope, this[i]);
    };
  },
  
  /**
   * Returns true if the supplied function returns true for every element
   * @param {Function} function A function which is passed each element in turn.  If this function returns false at any point, Array.all returns false immediately, otherwise true is returned
   * @return {Boolean} True if the supplied function returns true for every element, false otherwise
   */
  all: function(fun) {
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) !== true) {
        return false;
      };
    };
    
    return true;
  },
  
  /**
   * Returns true if the supplied function returns true for any element
   * @param {Function} function A function which is passed each element in turn.  If this function returns true at any point, Array.any returns true immediately
   * @return {Boolean} True if the supplied function returns true for at least one element, false otherwise
   */
  any: function(fun) {
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) === true) {
        return true;
      };
    };
    
    return false;
  },
  
  /**
   * Returns the first matching element for which the supplied function returns true
   * @param {Function} functionOrValue A function which is passed each element in turn, or a value which is compared to each element.
   * @return {Mixed} The first element for which the supplied function returns true, null otherwise
   */
  detect: function(functionOrValue) {
    for (var i=0; i < this.length; i++) {
      if (typeof(functionOrValue) == 'function') {
        if (functionOrValue.call(this, this[i]) === true) {
          return this[i];
        };
      } else {
        if (functionOrValue == this[i]) {
          return this[i];
        };
      };
    };
    
    return null;
  },
  
  /**
   * Returns a new Array of all elements for which the supplied function returns true
   */
  select: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) === true) {
        newArray.push(this[i]);
      };
    };
    
    return newArray;
  },
  
  /**
   * Returns a new Array of all elements for which the supplied function did not return true
   */
  reject: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      if (fun.call(this, this[i]) !== true) {
        newArray.push(this[i]);
      };
    };
    
    return newArray;
  },
  
  /**
   * Iterates the given function over all elements of the array, returning a new array containing the result of the function as applied to each element
   */
  collect: function(fun) {
    var newArray = [];
    
    for (var i=0; i < this.length; i++) {
      newArray.push(fun.call(this, this[i]));
    };
    
    return newArray;
  },
  
  /**
   * Returns the largest number in this array
   */
  max: function() {
    return Math.max.apply({}, this);
  },
  
  /**
   * Returns the smallest number in this array
   */
  min: function() {
    return Math.min.apply({}, this);
  },
  
  /**
   * Sums all of the numbers in this array
   */
  sum: function() {
    for(var i=0,sum=0; i<this.length; sum += this[i++]);
    return sum;
  },
  
  /**
   * Turns an array of elements into a comma-delimited sentence, connected with the specified connector
   * Usage:
   * ['Ed', 'Nick', 'John'].toSentence(); // => 'Ed, Nick and John'
   * ['Ed', 'Nick', 'John'].toSentence('or'); // => 'Ed, Nick or John'
   * ['Ed', 'Nick', 'John'].toSentence('or', true); // => 'Ed, Nick, or John'
   * @param {String} connector The string to join the final two elements together with (defaults to 'and')
   * @param {Boolean} addFinalComma True to add a final comma between the final two elements (not good English! Don't do it!)
   */
  toSentence: function(connector, addFinalComma) {
    var connector = connector || 'and';
    var addFinalComma = addFinalComma || false;
    
    //build a temporary array so that we do not affect the contents of this array
    var firstValues = [];
    for (var i=0; i < this.length - 1; i++) { firstValues.push(this[i]); };
    var lastValue = this.last();
    
    var sentence = firstValues.join(", ");
    if (addFinalComma) { sentence += ',';}
    
    return sentence + ' ' + connector + ' ' + lastValue;
  }
});

/**
 * Ext.ux.ChangeLog
 * @extends Ext.util.Observable
 * Manages all changes to an app.  Returns all changes after a given date
 */
Ext.ux.ChangeLog = function(config) {
  var config = config || {};
  
  this.items = {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.ChangeLog.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.ChangeLog, Ext.util.Observable, {
  sinceDate: function(date) {
    var date = date || new Date();
    
    return this.items.all
  },
  
  addItem: function(date, item) {
    this.items.push({date: item});
  }
});

/**
 * Simple class to handle dispatching from the Router
 */
Ext.ux.MVC.Dispatcher = function(config) {
  var config = config || {};
  
  /**
   * Instantiates the correct controller, fires the relevant action with the 
   * data given to us by the router
   */
  this.dispatch = function(url) {
    Ext.ux.MVC.params = config.router.recognise(url);
    var params = Ext.ux.MVC.params;
    
    var c = this.getControllerByName((params[":controller"]) + "Controller");
    c.doAction(params[":action"], params);
  };
  
  
  this.redirectTo = function(params) {
    if (typeof(params) == 'string') {
      Ext.History.add(params); return;
    } else {
      
    };
  };
  
  this.getControllerByName = function(controller_name) {
    return new config.application.controllers[controller_name];
  };
};

Ext.ux.MVC.params = {};

/**
 * Basic Flash class.  Calling Ext.ux.Flash.flash('my message', 'my optional title');
 * Displays a message at the top centre of the screen for a given length of time (defaults to 1 second)
 * Set different time by setting Ext.ux.MVC.Flash.flashDisplayTime
 */
Ext.ux.MVC.Flash = {
  flashContainer: null,
  flashDisplayTime: 1, //default to show the flash for one second
  
  /**
   * Displays the passed message and optional title for the amount of time specified by flashDisplayTime
   */
  flash: function(message, title, config) {
    var config = config || {};
    
    //create a reusable container if one has not already been created
    if(!Ext.ux.MVC.Flash.flashContainer){
      Ext.ux.MVC.Flash.flashContainer = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
    };
    
    //align flash box to top centre of the screen
    Ext.ux.MVC.Flash.flashContainer.alignTo(document, 't-t');
    
    //display the flash box for the given number of seconds
    var m = Ext.DomHelper.append(Ext.ux.MVC.Flash.flashContainer, {html: Ext.ux.MVC.Flash._createBox(title, message, config)}, true);
    m.slideIn('t').pause(Ext.ux.MVC.Flash.flashDisplayTime).ghost("t", {remove:true});
  },

  /**
   * Specialised form of flash - provide a styleable flash by setting div class="notice"
   */
  notice: function(message, title) {
    Ext.ux.MVC.Flash.flash(message, title, {cls: 'notice'});
  },
  
  /**
   * Specialised form of flash - provide a styleable flash by setting div class="error"
   */
  error: function(message, title) {
    Ext.ux.MVC.Flash.flash(message, title, {cls: 'error'});
  },
  
  /**
   * Internal method used to create styled div and contents to display the flash message
   */
  _createBox: function(title, message, config) {
    var config = config || {};
    
    //append user div class if present
    var div_class = 'msg';
    if (config.cls) {
      div_class += ' ' + config.cls;
    };
    
    return ['<div class="' + div_class + '">',
            '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
            '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', title, '</h3>', message, '</div></div></div>',
            '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
            '</div>'].join('');
  }
  
};

/**
 * Ext.ux.MVC.helper.grid.SearchFilter
 * @extends Ext.form.ComboBox
 * Description
 */
Ext.ux.MVC.helper.grid.SearchFilter = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    mode: 'remote',
    triggerAction: 'all',
    pageSize: 1000,
    width: 220
  });
  
  Ext.ux.MVC.helper.grid.SearchFilter.superclass.constructor.call(this, config);

  this.on('beforeselect', function(combo, record, index){
    if (this.gridStore) {
      var v = record.data.id;
      var o = {start: 0, limit: 15};
      this.gridStore.baseParams = this.gridStore.baseParams || {};
      this.gridStore.baseParams[this.paramName] = v;
      this.gridStore.reload({params:o});
    };
  });
};
Ext.extend(Ext.ux.MVC.helper.grid.SearchFilter, Ext.form.ComboBox);
Ext.reg('grid_search_filter', Ext.ux.MVC.helper.grid.SearchFilter);

var ImageAssociationRecord = Ext.data.Record.create([
  {name: 'id',                      type: 'int'},
  {name: 'image_id',                type: 'int'},
  {name: 'image_linked_model_id',   type: 'int'},
  {name: 'image_linked_model_type', type: 'string'},
  {name: 'created_at',              type: 'string'},
  {name: 'updated_at',              type: 'string'},
  {name: 'thumb_filename',          type: 'string', mapping: 'image.thumb_filename'},
  {name: 'title',                   type: 'string', mapping: 'image.title'},
  {name: 'filename',                type: 'string', mapping: 'image.filename'},
  {name: 'image'}
]);

var ImageAssociationReader = new Ext.data.JsonReader({root: 'image_associations', totalProperty: 'results'}, ImageAssociationRecord);

/*
options should include at least a model and an ID, e.g.:

new ImageAssociator({model: Product, id: 1});
*/

var ImageAssociator = function(options) {
  config = {};
  
  Ext.apply(config, options, {
    baseUrl: '/admin/image_associations',
    height: 300,
    anchor: "95%",
    autoLoad: true
  });
  
  readAssociationsUrl  = config.baseUrl + '?type=' + config.model.class_name + '&id=' + config.id;
  
  imageAssociationStore = new Ext.data.Store({
    url: readAssociationsUrl,
    reader: ImageAssociationReader
  });
  
  this.store = imageAssociationStore;
  
  if (config.autoLoad) {
    this.store.load();
  };
  
  tpl = new Ext.XTemplate(
    '<tpl for=".">',
      '<div class="thumb-wrap" id="{id}">',
      '<div class="thumb"><img src="{thumb_filename}" title="{title}"></div>',
      '<span class="x-editable">{filename}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  );
  
  addButton = new Ext.Toolbar.Button({
    text: 'Add an Image',
    iconCls: 'add',
    handler: function() {
      imageChooser = new ImageChooser(options.image_chooser_options);
      imageChooser.show('noid', afterImageSelected);
      
      function afterImageSelected (record) {
        image_id = record.id;
        
        param_string  = '&image_association[image_id]=' + image_id;
        param_string += '&image_association[image_linked_model_type]=' + config.model.class_name;
        param_string += '&image_association[image_linked_model_id]=' + config.id;
        
        Ext.Ajax.request({
          url: config.baseUrl + '.ext_json',
          method: 'post',
          params: param_string,
          success: function() {
            imageAssociationStore.reload();
          }
        });
      }
    }
  });
  
  removeButton = new Ext.Toolbar.Button({
    text: 'Remove Selected',
    disabled: true,
    iconCls: 'cancel',
    handler: function() {
      association_id = dataView.getSelectedRecords()[0].data.id;
      
      Ext.Ajax.request({
        url: config.baseUrl + '/' + association_id + '.ext_json',
        method: 'post',
        params: "_method=delete",
        success: function() {
          imageAssociationStore.reload();
        }
      });
    }
  });
  
  toolbar = new Ext.Toolbar({title: 'Images attached to this ' + config.model.human_name, items: [addButton, '-', removeButton]});
  
  dataView = new Ext.DataView({
    store: imageAssociationStore,
    tpl: tpl,
    autoScroll: true,
    itemSelector: 'div.thumb-wrap',
    emptyText: 'No images have been attached yet',
    singleSelect: true
  });
  
  this.dataView = dataView;
  
  this.dataView.on('selectionchange', function(dView, selections) {
    if (selections.length > 0) {
      removeButton.enable();
    } else {
      removeButton.disable();
    };
  });
  
  this.panel = new Ext.Panel({
    tbar: toolbar,
    height: config.height,
    title: 'Images attached to this ' + config.model.human_singular_name,
    anchor: config.anchor,
    bodyStyle: 'background-color: #fff; border: 1px solid #99BBE8; padding: 7px; overflow:auto;',
    // margins: '20 40 60 100',
    style: config.style,
    items: [this.dataView]
  });  
};

ImageAssociator.prototype = {
  reloadStore: function(id) {
    config.id = id;
    this.store.proxy.conn.url = config.baseUrl + '?type=' + config.model.class_name + '&id=' + config.id;
    this.store.load();
  }
};

var ImageChooser = function(config){
  
  //set up our local variables
  Ext.apply(this, config, {
      width: 780, height: 520, url: '/admin/images.ext_json'
  });
  
  uploadImageForm = new Ext.FormPanel({
    labelAlign: 'left',
    url: '/admin/images',
    title: 'New File',
    iconCls: 'file_new',
    layout: 'form',
    closable: true,
    fileUpload: true,
    waitMsgTarget: true,
    items: [
      {
        xtype: 'textfield',
        inputType: 'file',
        fieldLabel: 'File',
        name: 'image[uploaded_data]',
        id: 'uploaded_data'
      },
      {
        xtype: 'textfield',
        fieldLabel: 'Title',
        name: 'image[title]',
        id: 'title'
      },
      {
        xtype: 'textarea',
        fieldLabel: 'Description',
        name: 'image[description]',
        id: 'description',
        width: 310,
        height: 150
      }
    ]
  });
  
  uploadImageForm.addButton({
    text: 'Save',
    handler: function(){
      uploadImageForm.form.submit({
        url: '/admin/images.ext_json', 
        waitMsg: 'Saving Data...',
        failure: function() {Ext.Msg.alert('Operation Failed', 'There were errors saving this File, please see any fields with red icons');},
        success: function(formElement, action) {
          uploadWin.hide();
          Ext.Msg.alert('File Saved', 'The File has been successfully uploaded');
          store.reload();
        }
      });
    }
  });
  
  var uploadWin = new Ext.Window({
    title: 'Choose a new image to upload',
    closable: true,
    closeAction: 'hide',
    modal: true,
    height: 400,
    width: 500,
    layout: 'fit',
    items: [uploadImageForm]
  });
  this.uploadWin = uploadWin;
  
  this.infoPanel = new Ext.Panel({
    region: 'east',
    width: 150,
    maxWidth: 250
  });
  
  //template for image info panel
  this.detailsTemplate = new Ext.Template(
    '<div class="details"><img src="{thumb_filename}"><div class="details-info">',
    '<dl>',
      '<dt>Title:</dt>',
      '<dd>{title}</dd>',
      '<dt>Description:</dt>',
      '<dd>{descString}</dd>',
      '<dt>Filename:</dt>',
      '<dd>{shortName}</dd>',
      '<dt>Size:</dt>',
      '<dd>{sizeString}</dd>',
    '</dl>'
  );
  this.detailsTemplate.compile();
  
  var store = new Ext.data.Store({
    proxy: new Ext.data.HttpProxy({
      url: this.url,
      method: 'get',
      params: {start: 0, limit: 15}
    }),
    reader: Image.getReader()
  });
  
  // override the default store.load function to load data through GET rather than POST
  store.load = function(options){
    options = options || {};
    if(this.fireEvent("beforeload", this, options) !== false){
        this.storeOptions(options);
        
        var p = Ext.apply(options.params || {}, this.baseParams);
        if(this.sortInfo && this.remoteSort){
          var pn = this.paramNames;
          p[pn["sort"]] = this.sortInfo.field;
          p[pn["dir"]] = this.sortInfo.direction;
        }
        
        // set the proxy's url with the correct parameters
        this.proxy.conn.url = this.proxy.conn.url.split("?")[0] + "?" + Ext.urlEncode(p);
        
        this.proxy.load(p, this.reader, this.loadRecords, this, options);
        return true;
    } else {
      return false;
    }
  };

  store.load({params: {start: 0, limit: 15}});
  this.store = store;
  
  var tpl = new Ext.XTemplate(
    '<tpl for=".">',
      '<div class="thumb-wrap" id="{id}">',
      '<div class="thumb"><img src="{thumb_filename}" title="{title}"></div>',
      '<span class="x-editable">{shortName}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  );
  
  //view
  this.view = new Ext.DataView({
    store: store,
    tpl: tpl,
    autoHeight: true,
    multiSelect: false,
    singleSelect: true,
    overClass:'x-view-over',
    itemSelector:'div.thumb-wrap',
    emptyText: 'No images to display'
  });
  
  this.view.on('selectionchange', this.showDetails, this, {buffer:100});
  this.view.on('dblclick', this.doCallback, this);
  this.view.on('loadexception', this.onLoadException, this);
  
  newImageButton = new Ext.Toolbar.Button({text: 'Upload a new image', iconCls: 'file_new'});
  newImageButton.on('click', function() {
    uploadWin.show();
  });
  
  this.viewTopToolbar = new Ext.Toolbar({
    items: ['Search by Title: ', ' ', new Ext.app.SearchField({store: this.store, width:220}), '-', newImageButton]
  });
  
  this.viewBottomToolbar = new Ext.PagingToolbar({
    pageSize: 15,
    store: this.store,
    displayInfo: true,
    displayMsg: 'Displaying Images {0} - {1} of {2}',
    emptyMsg: "No Images to display",
    items: [new Ext.Toolbar.Fill]
  });

  this.imagesPanel = new Ext.Panel({
    region: 'center',
    cls: 'images-view',
    fitToFrame: true,
    width: 535,
    layout: 'fit',
    bodyStyle: 'overflow: auto;',
    items: [this.view],
    bbar: this.viewBottomToolbar,
    tbar: this.viewTopToolbar
  });  

  // create the window, add components to it
  var win = new Ext.Window({
    title: 'Choose an Image',
    closable: true,
    closeAction: 'hide',
    autoCreate: true,
    modal: true,
    minWidth: 400,
    minHeight: 300,
		syncHeightBeforeShow: true,
		shadow: true,
    layout: 'border',
    items: [this.imagesPanel, this.infoPanel]
  });
  this.win = win;
  
  this.okButton = win.addButton('OK', this.doCallback, this);
  this.okButton.disable();
  this.cancelButton = win.addButton('Cancel', function() {win.hide();}, win);  
  
  //resize the window to the size required by the call to new ImageChooser
  win.setSize(this.width, this.height);
  
  // cache data by image name for easy lookup
  var lookup = {};
  // make some values pretty for display
  this.view.prepareData = function(data){
    data.shortName = Ext.util.Format.ellipsis(data.title, 15);
    data.sizeString = Ext.util.Format.fileSize(data.size);
    data.dateString = data.created_at;//.format("m/d/Y g:i a");
    data.descString = data.description || 'n/a';
    lookup[data.id] = data;
    return data;
  };
  this.lookup = lookup;
};

ImageChooser.prototype = {
  show : function(el, callback){
    //this.reset();
    this.win.show(el);
    this.callback = callback;
  },
  
  reset : function(){
    this.view.getEl().dom.scrollTop = 0;
    this.view.clearFilter();
    this.txtFilter.dom.value = '';
    this.view.select(0);
  },
  
  load : function(){
    if(!this.loaded){
      this.view.load({url: this.url, params:this.params, callback:this.onLoad.createDelegate(this)});
    }
  },
  
  onLoadException : function(v,o){
      this.view.getEl().update('<div style="padding:10px;">Error loading images.</div>'); 
  },
  
  filter : function(){
    var filter = this.txtFilter.dom.value;
    this.view.filter('name', filter);
    this.view.select(0);
  },
  
  onLoad : function(){
    this.loaded = true;
    this.view.select(0);
  },
  
  sortImages : function(){
    var p = this.sortSelect.dom.value;
      this.view.sort(p, p != 'name' ? 'desc' : 'asc');
      this.view.select(0);
    },
  
  showDetails : function(view, nodes){
    var selNode = this.view.getSelectedNodes()[0];
    if(selNode){
      this.okButton.enable();
      var data = this.lookup[selNode.id];
      this.infoPanel.getEl().hide();
      this.detailsTemplate.overwrite(this.infoPanel.getEl(), data);
      this.infoPanel.getEl().slideIn('l', {stopFx:true,duration:.2});
      
    }else{
        this.okButton.disable();
        this.infoPanel.getEl().update('');
    }
  },
  
  doCallback : function(){
    var selNode = this.view.getSelectedNodes()[0];
    var callback = this.callback;
    this.win.hide();
    if(selNode && callback){
      callback(this.lookup[selNode.id]);
    };
  }

};

String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};

/**
 * ImagePreviewButton
 * @extends Ext.Button
 * @cfg {String} url The url to load into the window.  This would usually
 * be a flash object, which plays the image
 * Opens a modal image preview window to display a given flash image
*/
ImagePreviewButton = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    text: 'Preview Image',
    iconCls: 'play'
  });
  
  Ext.applyIf(config, {
    handler: function() {
      var win;
      if (!win) { win = new ImagePreviewWindow(config); };
      win.show();
    }
  });
    
  ImagePreviewButton.superclass.constructor.call(this, config);
};
Ext.extend(ImagePreviewButton, Ext.Button);
Ext.reg('image_preview_button', ImagePreviewButton);

/**
 * ImagePreviewWindow
 * @extends Ext.Window
 * @cfg {String} url The url to load into the window.  This would usually
 * be a flash object, which plays the image
 * Opens a modal image preview window to display a given flash image
*/
ImagePreviewWindow = function(config) {
  var config = config || {};
  
  var win = this;
  
  Ext.applyIf(config, {
    title: 'Preview Image',
    modal: true,
    height: 400,
    width: 400,
    items: [
      new Ext.Panel({
        autoLoad: config.url
      })
    ],
    buttons: [
      {
        text: 'OK',
        handler: function() {win.close();}
      }
    ]
  });
  
  ImagePreviewWindow.superclass.constructor.call(this, config);
};
Ext.extend(ImagePreviewWindow, Ext.Window);

// /* Abstract base LayoutManager class.  Don't use this directly, use one of the subclasses */
// LayoutManager = function() {
// 
// };
// 
// LeftMenuLayoutManager = function(config) {
//   // super
//   LeftMenuLayoutManager.superclass.constructor.call(this, config);
//   
//   this.options = {};
//   Ext.applyIf(this.options, config);
//   
//   //set up the layout based on the underlying HTML elements
//   this.topBar = new Ext.Panel({
//     region: 'north',
//     height: 50,
//     contentEl: 'header',
//     items: [
//       new Ext.Button({
//         text: 'Logout',
//         icon: '/images/icons/door_in.png',
//         cls: 'x-btn-text-icon logout',
//         handler: function() {
//           window.location = "/logout";
//         }
//       })
//     ]
//   });
//   
//   this.leftMenu = new Ext.Panel({
//     region: 'west',
//     width: 200,
//     margins: '8 0 8 8',
//     title: 'Menu',
//     split: true,
//     items: [
//       new Ext.Panel({
//         contentEl: 'menu',
//         bodyStyle: 'background-color: #DFE8F6;'
//       })
//     ],
//     autoScroll: true,
//     bodyStyle: 'background-color: #DFE8F6;',
//     frame: true,
//     collapsible: true
//   });
//   
//   this.mainPanel = new Ext.Panel({
//     region:'center',
//     margins:'0 8 8 0',
//     layout: 'fit',
//     bodyBorder: false,
//     border: false,
//     bodyStyle: 'padding-top: 8px; background-color: #c5d1e7;',
//     defaults: {frame: true},
//     items: [{
//       hideMode:'offsets',
//       bodyStyle: 'background-color: #c5d1e7;',
//       iconCls: 'home',
//       border: false
//     }]
//   });
//   
//   this.contentPanel = new Ext.Panel({
//     region: 'center',
//     layout: 'border',
//     bodyStyle: 'background-color: #c5d1e7; padding: 10px;',
//     items: [this.leftMenu, this.mainPanel]
//   });
//   
//   this.viewport = new Ext.Viewport({
//     layout:'border',
//     bodyStyle: 'background-color: #c5d1e7; margin-bottom: 10px;',
//     items:[this.topBar, this.contentPanel]
//   });
//   
//   // Public functions
//   this.showPanel = function(panel) {
//     if (this.options.beforeShowPanel) {
//       this.options.beforeShowPanel.call();
//     };
//     this.mainPanel.remove(this.mainPanel.items.first(), true);
//     this.mainPanel.add(panel);
//     this.mainPanel.doLayout();
//   };
//   
//   this.delegateKeypress = function(ev) {
//     this.mainPanel.items.first().handleKeypress(ev);
//   };
//   
//   /**
//    * Adds logic to every menu item to navigate to that location via the History Manager
//    */
//   this.initializeMenu = function(menu_dom_id) {    
//     menu_links = Ext.get(menu_dom_id).select('ul li a').elements;
//     
//     for (var i=0; i < menu_links.length; i++) {
//       Ext.get(menu_links[i]).on('click', this.createDisplayFunction(menu_links[i].id));
//     };
//   };
//   
//   /**
//    * Given a 'URL' (after the #), creates a function to add that URL to the Ext.History
//    * e.g. createDisplayFunction('someplace') will Ext.History.add('someplace') and stop the click event
//    * Menu links are usually in the form Controller_Action, so this is first converted to Controller/Action
//    */
//   this.createDisplayFunction = function(name) {
//     return function(e) {
//       e.stopEvent();
//       Ext.History.add(name.replace(/_/, "/").replace("-", "_"));
//     };
//   };
//   
//   //used by initializeMenu - should be private
//   // this.createDisplayFunction = function(name) { 
//   //   var class_name = name.split("_")[0];
//   //   var keyword = name.split("_")[1];
//   //   return function() {application.getControllerByName(class_name + "Controller").viewIndex();};
//   // };
//   
// };
// 
// LeftMenuLayoutManager = Ext.extend(LeftMenuLayoutManager, LayoutManager, {});

/**
 * Ext.ux.MVC.Notification
 * @extends Ext.Window
 * Notification notification window
 */
Ext.ux.MVC.Notification = function(config) {
  var config = config || {};
  
  var message = "<p>" + config.message + "</p>";
  
  this.panel = new Ext.Panel({
    html:      message,
    bodyStyle: 'padding: 10px; font-family: verdana; font-size: 12px;'
  });
  
  Ext.applyIf(config, {
    width:     200,
    height:    120,
    resizable: false,
    layout:    'fit',
    items:     [this.panel],
    expiry:    2000,
    closable:  false
  });
  
  Ext.ux.MVC.Notification.superclass.constructor.call(this, config);
  
  this.addEvents({
    'beforeexpire': true,
    'expire':       true
  });
  
  //set up a delayed task to expire the window
  if (config.expiry && config.expiry != 0) {
    this.expireTask = new Ext.util.DelayedTask(this.expire, this);
    this.on('show', function() {
      this.expireTask.delay(config.expiry);
    }, this);
  };
};
Ext.extend(Ext.ux.MVC.Notification, Ext.Window, {
  /**
   * Expires the window (closes it).  This would usually be attached to a delayed task to
   * automatically hide the window after a few seconds.  Listen to 'beforeexpire' and return
   * false to it to provide your own window closing logic
   */
  expire: function() {
    if (this.fireEvent('beforeexpire', this)) {
      this.fireEvent('expire', this);
      this.close();
    };
  }
});

Ext.reg('notification', Ext.ux.MVC.Notification);

/**
 * Ext.ux.MVC.NotificationManager
 * Manages notification window positioning and expiration
 * @author Ed Spencer (edward@domine.co.uk)
 */

Ext.ux.MVC.NotificationManager = {
  windows: [],
  alignTo: 'br',
  offsets: {
    'br': [-15, -40],
    'bl': [15,  -40],
    'tl': [15, 15],
    'tr': [-15, 15]
  },
  
  /**
   * Updates the current alignment of the notification windows.
   * @param {String} newAlignment The new alignment of the windows.  Accepted values are tl, tr, bl and br (Top Left, Top Right, Bottom Left and Bottom Right respectively)
   */
  setAlignTo: function(newAlignment) {
    var allowedAlignments = ['tl', 'tr', 'bl', 'br'];
    if (allowedAlignments.detect(newAlignment)) {
      this.alignTo = newAlignment;
    };
  },
  
  notify: function(config) {
    //create Notification window, set up references and callbacks
    var win = new Ext.ux.MVC.Notification(config);
    win.on('beforeexpire', function(w) {return this.removeWindow(w);}, this);
    
    //align and display the window
    this.showWindow(win);
    win.el.alignTo(document, this.alignTo + '-' + this.alignTo, this.offsets[this.alignTo]);
    
    this.windows.push({
      position:  1,
      alignedTo: this.alignTo,
      win:       win,
      id:        win.id
    });
    
    return win;
  },
  
  inform: function(message, config) {
    var config = config || {};
    Ext.applyIf(config, {
      iconCls: 'notification-information',
      message: message
    });
    
    return this.notify(config);
  },
  
  warn: function(config) {
    var config = config || {};
    Ext.applyIf(config, {
      iconCls: 'notification-warning'
    });
    
    return this.notify(config);
  },
  
  /**
   * Finds all windows aligned to the given location (defaults to this.alignTo)
   * @param {String} location The location (tl, tr, bl or br) to find windows at
   */
  findAlignedTo: function(location) {
    var location = location || this.alignTo;
    return this.windows.select(function(element) { return element.alignedTo == location;});
  },
      
  positionWindow: function(win) {
    win.el.alignTo(document, this.alignTo + '-' + this.alignTo, this.offsets[this.alignTo]);
  },
  
  /**
   * Returns the window (not the Notification object!  The object including alignment, position and the notification window itself)
   * @param {String} The ID of the window
   * @return {Object} The object with the found window's alignment, position and Notification object
   */
  findWindowById: function(id) {
    return this.windows.detect(function(e) {return e.id == id;});
  },
  
  /**
   * Finds the notification window at the specified position and screen location
   * @param {Number} position The position currently held by the notification window
   * @param {String} location The location of the screen to look at (can be tl, tr, bl and br).  Defaults to current alignTo
   * @return {Object} The window object or null if nothing currently occupies this position
   */
  findWindowByPosition: function(position, location) {
    var location = location || this.alignTo;
    var windows = this.findAlignedTo(location);
    
    return windows.detect(function(e) {return e.position == position;});
  },
  
  removeWindow: function(win) {    
    var removedWindow = this.windows.detect(function(e) {return e.id == win.id;});
    if (removedWindow) { this.windows.remove(removedWindow); }
    
    //return false to cancel the default event handler in Ext.ux.MVC.Notification
    removedWindow.win.close();
    return false;
  },
  
  showWindow: function(win) {
    win.show();
  },
  
  
  /**
   * Convenience methods
   */
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedTopRight: function() {
    return this.findAlignedTo('tr');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedTopLeft: function() {
    return this.findAlignedTo('tl');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedBottomRight: function() {
    return this.findAlignedTo('br');
  },
  
  /**
   * Returns all windows currently visible and aligned to the top right of the screen
   */
  alignedBottomLeft: function() {
    return this.findAlignedTo('bl');
  },
  
  /**
   * Private methods
   */
   
  highestTakenPosition: function(location) {
    var location = location || this.alignTo;
    
    var windows = this.findAlignedTo(location);
    
    //get a sorted list of positions already taken up
    var positions = windows.collect(function(e) {return e.position;}).sort();
    
    //return the highest position
    return positions.reverse()[0];
  },
   
  /**
   * Private method - should not need to be used externally
   * Finds the first available position to insert the window to at the given location (location defaults to this.alignTo)
   * @param {String} location The location (tl, tr, bl or br) to the first available position for
   */
  firstAvailablePosition: function(location) {
    var location = location || this.alignTo;
    
    var windows = this.findAlignedTo(location);
    if (windows.length == 0) {return 1;}
    
    //get a sorted list of positions already taken up
    var positions = windows.collect(function(e) {return e.position;}).sort();
    
    //return the first position number which is currently free
    for (var i=0; i < positions.length; i++) {
      //if we can't detect a window in the position one up from here, return that position
      if (!windows.detect(function(e) {return positions[i] + 1 == e.position;})) {
        return positions[i] + 1;
      }
    };
  }
};

Ext.util.Format.renderThumbnail = function(value, metadata, record, rowIndex, colIndex, store) {
  t = new Ext.Template('<img src="{src}" />');  
  return t.apply({src: value});
};

Ext.util.Format.datetimeRenderer = function(value, metadata, record, rowIndex, colIndex, store) {
  try {
    date_splits = value.split(" ")[0].split("/");
    time_splits = value.split(" ")[1].split(":");
    
    year = date_splits[0]; month  = date_splits[1]; day    = date_splits[2];
    hour = time_splits[0]; minute = time_splits[1]; second = time_splits[2];
    
    offset = value.split(" ")[2];
    
    return String.format("{0}/{1}/{2} {3}:{4}", day, month, year, hour, minute);
  } catch (e) {
    return 'Unknown';
  };
};

/**
 * Class which handles requestexception events raised by Ext.Ajax
 */
Ext.ux.MVC.RequestExceptionHandler = function(config) {
  var config = config || {};
  Ext.applyIf(config, {
    showHandlerNotImplementedError: true
  });
  
  var exception_handlers = {};

  /**
   * Handle any request exception - delegate to specialised handler function
   */
  this.handleRequestException = function(connection, response, options) {
    if (handler = exception_handlers[response.status]) {
      //call the handler within the scope of the RequestExceptionHandler object
      handler.call(this, connection, response, options);
    } else {
      if (config.showHandlerNotImplementedError) {
        Ext.Msg.alert('Handler Not Implemented', "Something went wrong and the application couldn't decide what action to take.  Please report this to your developer");
      };
    };
  };
  
  /**
   * Allows addition of status code handlers at run tie
   */
  this.registerExceptionHandler = function(statusCode, handler) {
    exception_handlers[statusCode] = handler;
  };
  
  /**
   * Retrieves the current handler for the given status code
   */
  this.getExceptionHandler = function(statusCode) {
    return exception_handlers[statusCode];
  };
  
  /**
   * Default handler for 400 Bad Request status codes.  Don't call this directly, it is registered
   * using registerExceptionHandler(400, this._handle400).  Override with your own method if needed
   */
  this._handle400 = function(connection, response, options) {
    var errorMessage = this.fetchErrorMessage(response) || "The server could not understand how to process your request.";
    Ext.Msg.alert("Bad Request", errorMessage);
  };
  
  /**
   * Default handler for 401 Unauthorized status codes.  Don't call this directly, it is registered
   * using registerExceptionHandler(401, this._handle401).  Override with your own method if needed
   */
  this._handle401 = function(connection, response, options) {
    var errorMessage = this.fetchErrorMessage(response) || "You are not authorised to view that information";
    Ext.Msg.alert("Unauthorized", errorMessage);
  };
  
  /**
   * Default handler for 403 Forbidden status codes.  Don't call this directly, it is registered
   * using registerExceptionHandler(403, this._handle403).  Override with your own method if needed
   */
  this._handle403 = function(connection, response, options) {
    var errorMessage = this.fetchErrorMessage(response) || "You are not authorised to view that information";
    Ext.Msg.alert("Forbidden", errorMessage);
  };
  
  /**
   * Default handler for 404 Not Found status codes.  Don't call this directly, it is registered
   * using registerExceptionHandler(404, this._handle404).  Override with your own method if needed
   */
  this._handle404 = function(connection, response, options) {
    Ext.Msg.alert("Item Not Found", "The information you were looking for could not be found on the server");
  };
  
  /**
   * Default handler for 500 Server Error status codes.  Don't call this directly, it is registered
   * using registerExceptionHandler(500, this._handle500).  Override with your own method if needed
   */
  this._handle500 = function(connection, response, options) {
    Ext.Msg.alert("Server Error", "There was an error on the server - your request was not successfully carried out");
  };
  
  /**
   * Default handler for 502 Bad Gateway, 503 Service Unavailable and 504 Gateway Timeout status codes
   * Don't call this directly, it is registered using registerExceptionHandler(500, this._handle500).
   * Override with your own method if needed
   */
  this._handle50x = function(connection, response, options) {
    Ext.Msg.alert("Server could not be reached", "There was a problem trying to contact the server and your request could not be completed.  Please try again in a few moments.");
  };
  
  //register the default handlers
  this.registerExceptionHandler(400, this._handle400);
  this.registerExceptionHandler(401, this._handle401);
  this.registerExceptionHandler(403, this._handle403);
  this.registerExceptionHandler(404, this._handle404);
  this.registerExceptionHandler(500, this._handle500);
  this.registerExceptionHandler(502, this._handle50x);
  this.registerExceptionHandler(503, this._handle50x);
  this.registerExceptionHandler(504, this._handle50x);
  
  //catch all request exceptions and handle them
  Ext.Ajax.on('requestexception', this.handleRequestException, this);
};

Ext.ux.MVC.RequestExceptionHandler.prototype = {
  
  /**
   * Checks responseText for a property called error.  If that is not present,
   * look for .errors - if that is an array, join messages together with commas
   */
  fetchErrorMessage : function(response) {
    var text = this.evalResponseText(response);
    
    if (text.error) {
      return text.error;
    } else {
      if (text.errors) {
        if (typeof(text.errors) == 'string') {
          return text.errors;
        } else {
          return text.errors.join(", ");
        };
      };
    };
    
    //return null if none of the above errors could be found
    return null;
  },
  
  /**
   * Attempts to evaluate the response's responseText.  Returns the eval'd object or an empty object
   */
  evalResponseText: function(response) {
    try {
      return eval("(" + response.responseText + ")");
    } catch(e) {
      return {};
    };
  }
};

/**
 * 
 * 
 */
Ext.ux.MVC.Route = function(mappingString, options) {
  var options = options || {};
  
  if (!mappingString) {throw new Error("You must supply a mapping string");};
  this.mappingString = mappingString;
  
  Ext.applyIf(options, {
    
  });
  
  this.options = options;
  
  //The regular expression we use to match a segment of a route mapping
  //this will recognise segments starting with a colon,
  //e.g. on 'namespace/:controller/:action', :controller and :action will be recognised
  this.paramMatchingRegex = new RegExp(/:([0-9A-Za-z\_]*)/g);
  
  /**
   * Converts a route string into an array of symbols starting with a colon. e.g.
   * ":controller/:action/:id" => [':controller', ':action', ':id']
   */
  this.paramsInMatchString = this.mappingString.match(this.paramMatchingRegex);
  
  this.matcherRegex = this.convertToUsableRegex(mappingString);
};

Ext.ux.MVC.Route.prototype = {
  /**
   * @param {url} The url we want to match against this route to see if it matches
   * @return {boolean} Returns true if this route matches the url
   */
  recognises: function(url) {
    return this.matcherRegex.test(url);
  },
  
  /**
   * @param {url} The url we want to provide matches for
   * @return {Object} Object of all matches for this url, as well as additional params as defined in the route
   */
  matchesFor: function(url) {
    if (!this.recognises(url)) {return false;};
    
    var parameters = [];
    
    var keys = this.paramsInMatchString;
    var values = url.match(this.matcherRegex);
    values.shift(); //first value is the entire match so reject
    
    for (var i = keys.length - 1; i >= 0; i--){
      parameters[keys[i]] = values[i];
    };
    
    //add any additional parameter options specified in the route definition
    for (option in this.options) {
      parameters[option] = this.options[option];
    }
    
    return parameters;
  },
  
  /**
   * Private: For a given string, replaces all substrings starting with a colon into
   * a regex string that can match a url segment. 
   * e.g. :controller/:action => '^([a-zA-Z0-9\_]+)/([a-zA-Z0-9\_]+)$'
   * @param {String} regex_string The string we want to turn into a matchable regex
   * @return {String} The replaced string
   */
  convertToUsableRegex: function(regex_string) {
    var p = this.paramsInMatchString;
    
    for (var i = p.length - 1; i >= 0; i--){
      regex_string = regex_string.replace(new RegExp(p[i]), "([a-zA-Z0-9\_,]+)");
    };
    
    //we want to match the whole string, so include the anchors
    return new RegExp("^" + regex_string + "$");
  }
};

Ext.ux.MVC.Router = function(config) {
  var config = config || {};
  this.mappings = [];
  
  this.connect = function(re, additional_params) {
    var route = new Ext.ux.MVC.Route(re, additional_params);
    this.mappings.push(route);
  };
  
  this.resources = function(resource_name) {
    
  };
  
  /**
   * @params {String} url The url to be matched by the Router.  Router will match against
   * all connected matchers in the order they were connected and return an object created
   * by parsing the url with the first matching matcher as defined using the connect() method
   * @returns {Object} Object of all matches to this url
   */
  this.recognise = function(url) {
    for (var i=0; i < this.mappings.length; i++) {
      var m = this.mappings[i];
      
      if (m.recognises(url)) {
        return m.matchesFor(url);
      };
    };
    
    throw new Error("No route matches url " + url);
  };
};

/**
 * @class Ext.ux.MVC.ServerSideProvider
 * @extends Ext.state.Provider
 * @constructor
 * Create a new ServerSideProvider
 * @param {Object} config The configuration object
 */
Ext.state.ServerSideProvider = function(config){
  Ext.state.ServerSideProvider.superclass.constructor.call(this);
  Ext.apply(this, config, {
    url: '/state.json'
  });
  
  /**
   * @event staterestore Fires when state has been fetched from the server and restored to local hash
   * @event staterestorefail Fires if state could not be restored from the server
   * @event afterclearstate Fires after state has been successfully cleared from the server
   * @event clearstatefail Fires if state was not successfully cleared from the server
   * @event aftersetstate Fires after state has been successfully synchronised with the server
   * @event setstatefail Fires if state update could not be synchronised with the server
   */
  this.addEvents('staterestore', 'staterestorefail', 'clearstatefail', 'afterclearstate', 'aftersetstate', 'setstatefail');
  
  //perform an AJAX request against the server to initially populate state
  this.readStateFromServer();
};

Ext.extend(Ext.state.ServerSideProvider, Ext.state.Provider, {
    /**
     * Sets the key/value pair locally and sends an AJAX request to the Server to update
     * Server's representation
     */
    set : function(name, value){
      //clear the key if set to null/undefined
      if(typeof value == "undefined" || value === null) {
        this.clear(name);
        return;
      };
      
      this.setServerSideValue(name, value);
      Ext.state.ServerSideProvider.superclass.set.call(this, name, value);
    },

    /**
     * Private Method: Performs AJAX request to Server to clear state information for a given key
     */
    clear : function(name){
      Ext.Ajax.request({
        url: this.url,
        method: 'post',
        params: '_method=delete&key=' + name,
        scope: this,
        success: function() {this.fireEvent('afterclearstate');},
        failure: function() {this.fireEvent('clearstatefail');}
      });
      
      Ext.state.ServerSideProvider.superclass.clear.call(this, name);
    },

    /**
     * Private Method: Reads all state information from the Server Side URL
     */
    readStateFromServer : function(){
      Ext.Ajax.request({
        url: this.url,
        method: 'get',
        scope: this,
        success: function(response, options) {
          // try {
            var state_object = Ext.decode("(" + response.responseText + ")");
            
            boo = state_object;
            
            for (item in state_object) {
              this.state[item] = this.decodeValue(state_object[item]);
            }
            
            this.fireEvent('staterestore');
          // } catch(e) {
          //   if (this.hasListener('staterestorefail')) {
          //     this.fireEvent('staterestorefail');
          //   } else {
          //     Ext.ux.MVC.Flash.error("Something went wrong trying to retrieve your default settings", "Your settings could not be retrieved");
          //   };
          // }
        },
        failure: function() {this.fireEvent('staterestorefail');}
      });
    },

    /**
     * Private Method: Sends an AJAX request to the Server to update the Server's state representation
     */
    setServerSideValue : function(name, value){
      Ext.Ajax.request({
        url: this.url,
        method: 'post',
        params: 'key=' + name + '&value=' + Ext.encode(this.encodeValue(value)),
        scope: this,
        success: function() {this.fireEvent('aftersetstate');},
        failure: function() {this.fireEvent('setstatefail');}
      });
    }
});

Ext.override(String, {

  /**
   * @param {String} str A string to be capitalized
   * @returns A capitalized string (e.g. "some test sentence" becomes "Some test sentence")
   * @type String
   */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
  },

  /**
   * @param {String} str A string to be turned into title case
   * @returns The string in Title Case (e.g. "some test sentence" becomes "Some Test Sentence")
   * @type String
   */
  titleize: function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  },

  /**
   * Takes any string and de-underscores and uppercases it
   * e.g. long_underscored_string => LongUnderscoredString
   */
  camelize: function() {
    return this.replace(/_/g, " ").titleize().replace(/ /g, "");

    // this feels nicer, sadly no collect function (yet) though
    // class_name_string.split("_").collect(function(e) {return String.capitalize(e)}).join("");
  },
  
  /**
   * 
   */
  classify: function() {
    
  },
  
  /**
   * Returns a truncated version of this string
   * @param {Number} maxLength The maximum length a string can be before it is truncated
   * @param {String} trailingString The string to append if the string is too long.  Defaults to '...'.  When truncating, the length of the trailing string will be taken into account to ensure the returned string is the right length
   */
  truncate: function(maxLength, trailingString) {
    var trailingString = trailingString || '...';
    var maxLength = parseInt(maxLength) - trailingString.length;
    
    if (this.length > maxLength) {
      return this.substring(0, maxLength) + trailingString;
    } else {
      return this;
    };
  }
});

/**
 * @param {String} str A string to be capitalized
 * @returns A capitalized string (e.g. "some test sentence" becomes "Some test sentence")
 * @type String
 */
String.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
};

/**
 * @param {String} str A string to be turned into title case
 * @returns The string in Title Case (e.g. "some test sentence" becomes "Some Test Sentence")
 * @type String
 */
String.titleize = function(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

/**
 * Takes any string and de-underscores and uppercases it
 * e.g. long_underscored_string => LongUnderscoredString
 */
String.camelize = function(class_name_string) {
  return String.titleize(class_name_string.replace(/_/g, " ")).replace(/ /g, "");

  // this feels nicer, sadly no collect function (yet) though
  // class_name_string.split("_").collect(function(e) {return String.capitalize(e)}).join("");
};

VideoChooser = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    title: 'Choose a Video',
    width: 780, 
    height: 520,
    closable: true,
    closeAction: 'hide',
    autoCreate: true,
    modal: true,
    minWidth: 400,
    minHeight: 300,
    syncHeightBeforeShow: true,
    shadow: true,
    layout: 'border',
    url: '/admin/videos.ext_json'
  });

  this.infoPanel = new Ext.Panel({
    region: 'east',
    width: 150,
    maxWidth: 250
  });
  
  //template for video info panel
  this.detailsTemplate = new Ext.Template(
    '<div class="details"><img src="/images/video_preview.gif"><div class="details-info">',
    '<dl>',
      '<dt>Title:</dt>',
      '<dd>{title}</dd>',
      '<dt>Description:</dt>',
      '<dd>{descString}</dd>',
      '<dt>Filename:</dt>',
      '<dd>{shortName}</dd>',
      '<dt>Size:</dt>',
      '<dd>{sizeString}</dd>',
    '</dl>'
  );
  this.detailsTemplate.compile();
  
  var store = new Ext.data.Store({
    proxy: new Ext.data.HttpProxy({
      url: config.url,
      method: 'get',
      params: {start: 0, limit: 15}
    }),
    reader: Video.getReader()
  });
  
  // override the default store.load function to load data through GET rather than POST
  store.load = function(options){
    options = options || {};
    this.storeOptions(options);
    
    var p = Ext.apply(options.params || {}, this.baseParams);
    if(this.sortInfo && this.remoteSort){
      var pn = this.paramNames;
      p[pn["sort"]] = this.sortInfo.field;
      p[pn["dir"]] = this.sortInfo.direction;
    }
    
    // set the proxy's url with the correct parameters
    this.proxy.conn.url = this.proxy.conn.url.split("?")[0] + "?" + Ext.urlEncode(p);
    
    this.proxy.load(p, this.reader, this.loadRecords, this, options);
    return true;
  };

  store.load({params: {start: 0, limit: 15}});
  this.store = store;
  
  
  var tpl = new Ext.XTemplate(
    '<tpl for=".">',
      '<div class="video-preview-wrap" id="{id}">',
      '<div class="thumb"><img src="/images/video_preview.gif" title="{title}"></div>',
      '<span>{title}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  );
  
  //view
  var view = new Ext.DataView({
    store: store,
    tpl: tpl,
    autoHeight: true,
    multiSelect: false,
    singleSelect: true,
    overClass:'x-view-over',
    itemSelector:'div.video-preview-wrap',
    emptyText: 'No images to display'
  });
  this.view = view;
  
  this.viewTopToolbar = new Ext.Toolbar({
    items: ['Search by Title: ', ' ', new Ext.app.SearchField({store: this.store, width:220})]
  });
  
  this.viewBottomToolbar = new Ext.PagingToolbar({
    pageSize: 15,
    store: this.store,
    displayInfo: true,
    displayMsg: 'Displaying Videos {0} - {1} of {2}',
    emptyMsg: "No Videos to display",
    items: [new Ext.Toolbar.Fill]
  });

  this.videosPanel = new Ext.Panel({
    region: 'center',
    cls: 'images-view',
    fitToFrame: true,
    width: 535,
    layout: 'fit',
    bodyStyle: 'overflow: auto;',
    items: [this.view],
    bbar: this.viewBottomToolbar,
    tbar: this.viewTopToolbar
  });
  
  var win = this;
  
  this.reset = function(){
    this.view.getEl().dom.scrollTop = 0;
    this.view.clearFilter();
    this.txtFilter.dom.value = '';
    this.view.select(0);
  };
  
  this.onLoadException = function(v,o){
    this.view.getEl().update('<div style="padding:10px;">Error loading videos.</div>'); 
  };
  
  this.filter = function(){
    var filter = this.txtFilter.dom.value;
    this.view.filter('name', filter);
    this.view.select(0);
  };
  
  this.onLoad = function(){
    this.loaded = true;
    this.view.select(0);
  };
  
  this.sortVideos = function(){
    var p = this.sortSelect.dom.value;
    this.view.sort(p, p != 'name' ? 'desc' : 'asc');
    this.view.select(0);
  };
  
  this.showDetails = function(view, nodes){
    var selNode = this.view.getSelectedNodes()[0];
    if(selNode){
      this.okButton.enable();
      var data = this.lookup[selNode.id];
      this.infoPanel.getEl().hide();
      this.detailsTemplate.overwrite(this.infoPanel.getEl(), data);
      this.infoPanel.getEl().slideIn('l', {stopFx:true,duration:.2});
      
    }else{
      this.okButton.disable();
      this.infoPanel.getEl().update('');
    }
  };
  
  this.doCallback = function(){
    var selNode = view.getSelectedNodes()[0];
    var callback = config.callback;
    win.hide();
    if(selNode && callback){
      callback(this.lookup[selNode.id]);
    };
  };
  
  // cache data by image name for easy lookup
  var lookup = {};
  // make some values pretty for display
  this.view.prepareData = function(data){
    data.shortName = Ext.util.Format.ellipsis(data.title, 15);
    data.sizeString = Ext.util.Format.fileSize(data.size);
    data.dateString = data.created_at;//.format("m/d/Y g:i a");
    data.descString = data.description || 'n/a';
    lookup[data.id] = data;
    return data;
  };
  this.lookup = lookup;

  this.okButton = new Ext.Button({
    text: 'OK',
    disabled: true
  });
  
  this.cancelButton = new Ext.Button({
    text: 'Cancel',
    handler: function() {win.close();}
  });
  
  this.view.on('selectionchange', this.showDetails, this, {buffer:100});
  this.view.on('dblclick', this.doCallback, this);
  this.view.on('loadexception', this.onLoadException, this);
  this.okButton.on('click', this.doCallback, this);
  
  Ext.applyIf(config, {
    items: [this.videosPanel, this.infoPanel],
    buttons: [this.okButton, this.cancelButton]
  });
  
  VideoChooser.superclass.constructor.call(this, config);
  
};
Ext.extend(VideoChooser, Ext.Window);


String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};

/**
 * VideoPreviewButton
 * @extends Ext.Button
 * @cfg {String} url The url to load into the window.  This would usually
 * be a flash object, which plays the video
 * Opens a modal video preview window to display a given flash video
*/
VideoPreviewButton = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    text: 'Preview Video',
    iconCls: 'play'
  });
  
  Ext.applyIf(config, {
    handler: function() {
      var win;
      if (!win) { win = new VideoPreviewWindow(config); };
      win.show();
    }
  });
    
  VideoPreviewButton.superclass.constructor.call(this, config);
};
Ext.extend(VideoPreviewButton, Ext.Button);
Ext.reg('video_preview_button', VideoPreviewButton);

/**
 * VideoPreviewWindow
 * @extends Ext.Window
 * @cfg {String} url The url to load into the window.  This would usually
 * be a flash object, which plays the video
 * Opens a modal video preview window to display a given flash video
*/
VideoPreviewWindow = function(config) {
  var config = config || {};
  
  var win = this;
  
  Ext.applyIf(config, {
    title: 'Preview Video',
    modal: true,
    height: 377,
    width: 368,
    resizable: false,
    items: [
      new Ext.Panel({
        autoLoad: config.url
      })
    ],
    buttons: [
      {
        text: 'OK',
        handler: function() {win.close();}
      }
    ]
  });
  
  VideoPreviewWindow.superclass.constructor.call(this, config);
};
Ext.extend(VideoPreviewWindow, Ext.Window);

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.app.App = function(cfg){
  Ext.apply(this, cfg);
  this.addEvents({
    'ready' : true,
    'beforeunload' : true
  });
  
  Ext.onReady(this.initApp, this);
};

Ext.extend(Ext.app.App, Ext.util.Observable, {
  isReady: false,
  startMenu: null,
  modules: null,

  getStartConfig : function(){

  },

  initApp : function(){
    this.startConfig = this.startConfig || this.getStartConfig();

    this.os = new Ext.OS(this);

    this.launcher = this.os.taskbar.startMenu;

    this.modules = this.getModules();
    
    if(this.modules){
        this.initModules(this.modules);
    }

    this.init();

    Ext.EventManager.on(window, 'beforeunload', this.onUnload, this);
    this.fireEvent('ready', this);
    this.isReady = true;
  },

  getModules : Ext.emptyFn,
  init : Ext.emptyFn,

  initModules : function(ms){
  for(var i = 0, len = ms.length; i < len; i++){
          var m = ms[i];
          this.launcher.add(m.launcher);
          m.app = this;
      }
  },

  getModule : function(name){
    var ms = this.modules;
    for(var i = 0, len = ms.length; i < len; i++){
      if(ms[i].id == name || ms[i].appType == name){
        return ms[i];
      }
    }
    
    return '';
  },

  onReady : function(fn, scope){
    if(!this.isReady){
        this.on('ready', fn, scope);
    }else{
        fn.call(scope, this);
    }
  },

  getOS : function(){
    return this.os;
  },

  onUnload : function(e){
    if(this.fireEvent('beforeunload', this) === false){
        e.stopEvent();
    }
  }
});

/**
 * Ext.Desktop
 * @extends Ext.Container
 * Provides a Desktop with a DesktopLayout for managing shortcuts
 */
Ext.Desktop = function(config) {
  var config = config || {};
  
  this.desktopEl = Ext.get('x-desktop');
  
  Ext.applyIf(config, {
    renderTo:    'x-desktop',
    layout:      'desktop',
    stateful:    true,
    stateId:     'desktop-shortcuts',
    stateEvents: ['shortcutmoved', 'shortcutcreated', 'shortcutdeleted'],
    
    defaults: {
      xtype: 'desktop_shortcut'
    },
    
    /**
     * Finds current config for each shortcut
     * @return {Object} Object containing desktop icons
     */
    getState: function() {
      var shortcuts = [];
      var items = this.items.items;
      
      for (var i=0; i < items.length; i++) {
        var item = items[i];
        if (parseInt(item.position, 10) > 0) {
          shortcuts.push({
            text:     item.text,
            position: parseInt(item.position, 10),
            icon:     item.icon
          });
        }
      };
      
      return {
        items: shortcuts
      };
    },
    
    /**
     * Retrieves shortcuts from state provider and adds them to the desktop
     */
    applyState: function(state) {
      for (var i=0; i < state.items.length; i++) {
        if (state.items[i].position > 0) {
          this.add(state.items[i]);          
        };
      };      
    }
  });
  
  Ext.Desktop.superclass.constructor.call(this, config);
  
  this.addEvents({
    'beforeshortcutmoved':   true,
    'shortcutmoved':         true,
    'beforeshortcutcreated': true,
    'shortcutcreated':       true,
    'beforeshortcutdeleted': true,
    'shortcutdeleted':       true
  });
  
  //set up shortcuts drag and drop
  // this.initializeDragZone();  
  // this.initializeDropZone();
};

Ext.extend(Ext.Desktop, Ext.Container, {
  
  getLayoutTarget: function() {
    return this.desktopEl;
  },
  
  initializeDropZone: function() {
    var desktop = this;
    
    this.dropZone = new Ext.dd.DropTarget(this.desktopEl, {
            
      /**
       * Updates the drag element's class when drop is allowed
       */
      notifyOver: function(ddSource, e, data) {
        if (this.canDropOnLocation(ddSource, e, data)) {
          return Ext.dd.DropZone.prototype.dropAllowed;
        } else {
          return Ext.dd.DropZone.prototype.dropNotAllowed;
        };
      },
      
      /**
       * Tell the DataView to associate the image
       */
      notifyDrop: function(ddSource, e, data) {
        if (this.canDropOnLocation(ddSource, e, data) && (target = e.getTarget('td.shortcut-position'))) {
          
          //try to find an existing shortcut
          var existing = desktop.items.filter('id', data.sourceEl.id).items[0];
          
          if (existing) {
            if (desktop.fireEvent('beforeshortcutmoved')) {
              existing.position = target.id.split("-").last();
              desktop.fireEvent('shortcutmoved');
            };
          } else {
            Ext.applyIf(data.shortcutConfig, { position: target.id.split("-").last() });
            
            if (desktop.fireEvent('beforeshortcutcreated', desktop)) {
              
              var newShortcut = new Ext.ux.Shortcut(data.shortcutConfig);
              desktop.items.add(newShortcut);
              
              desktop.fireEvent('shortcutcreated', desktop, newShortcut);
            };
          };
                  
          desktop.doLayout();
          return true;
        };
        
        return false;
      },
      
      /**
       * Returns true if a drop is allowed here
       */
      canDropOnLocation: function(ddSource, e, data) {
        //check that we're not currently hovering above a window
        if (e.getTarget('.x-window')) {
          return false;
        };
        
        //check that we're not currently hovering above another icon
        if (e.getTarget('.x-shortcut')) {
          return false;
        };
        
        //if we're hovering over a free shortcut location, all is well
        if (e.getTarget('td.shortcut-position') && this.hasValidShortcutConfig(data)) {
          return true;
        } else {
          return false;
        };
      },
      
      /**
       * Ensures that the dropped object has a valid shortcut config (has text, icon and launchConfig)
       * @param {Object} The dropped element's dragData
       * @return {Boolean} True if the dropped item has a valid shortcut config
       */
      hasValidShortcutConfig: function(data) {
        var conf = data.shortcutConfig;
        
        // if (!conf)              {return false};
        // if (!conf.text)         {return false};
        // if (!conf.icon)         {return false};
        // if (!conf.launchConfig) {return false};
        
        return true;
      }
    });
  },
  
  /**
   * Sets up each item in the DataView as a draggable element
   */
  initializeDragZone: function() {
    this.dragZone = new Ext.dd.DragZone(this.desktopEl, {
      
      getDragData: function(e) {
        var sourceEl = e.getTarget('div.x-shortcut', 10);
        
        if (sourceEl) {
          var draggable = sourceEl.cloneNode(true);
          
          draggable.id = Ext.id();
          
          return this.dragData = {
            sourceEl:  sourceEl,
            repairXY:  Ext.fly(sourceEl).getXY(),
            ddel:      draggable,
            shortcut:  this
          };
        };
      },
      
      getRepairXY: function() {
        return this.dragData.repairXY;
      }
    });
  }
});

Ext.reg('desktop', Ext.Desktop);

/**
 * Ext.ux.DesktopLayout
 * @extends Ext.layout.ContainerLayout
 * Provides a grid layout suitable for a desktop, with drag/drop and programmatic placement and rearrangement
 */
Ext.ux.DesktopLayout = function(config) {
  var config = config || {};
  
  //these are applied to 'this' by the superclass
  Ext.applyIf(config, {
    shortcutSize: 90,
    items:        [],
    positions:    [],
    shortcuts:    []
  });
  
  Ext.ux.DesktopLayout.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.DesktopLayout, Ext.layout.ContainerLayout, {
  
  monitorResize: true,
  
  /**
   * Ensures we have a reference to the desktop, builds and populates layout table with this.items
   */
  onLayout: function(container, target) {
    if (!this.desktop) {
      this.desktop = container.desktop;
    };
    
    if (!this.table) {
      this.createLayoutTable(target);
    };
    
    this.renderAll(container, target);
  },
  
  onResize: function() {
    console.log("resized");
  },
  
  /**
   * Builds the table used internally to lay the icons out on the Desktop.
   * @params {Ext.Element} target The target element to create the table in
   */
  createLayoutTable: function(target) {
    //add a table and tbody
    this.table = target.createChild({tag: 'table', cls: 'x-desktop-table', cellspacing: 0});      
    this.tbody = this.table.createChild({tag: 'tbody'});
    
    var shortcutsWide = this.shortcutsWide();
    var shortcutsHigh = this.shortcutsHigh();
    
    //create each position element (<td>).  Keep a reference to each in this.positions
    for (var i=1; i < shortcutsHigh + 1; i++) {
      var currentTr = this.tbody.createChild({tag: 'tr'});
      for (var j=1; j < shortcutsWide + 1; j++) {
        
        this.positions.push(currentTr.createChild({
          tag:    'td', 
          id:     'shortcut-position-' + (i + (shortcutsHigh * (j-1))), 
          cls:    'shortcut-position',
          // style:  'border: 1px solid red;',
          height: this.shortcutSize,
          width:  this.shortcutSize
        }));  
      };
    };
  },
  
  renderAll : function(ct, target){
    var items = ct.items.items;
    for(var i = 0, len = items.length; i < len; i++) {
      var c = items[i];
      if(c && (!c.rendered || !this.isValidParent(c, target))){
        this.renderItem(c, c.position, target);
      }
    }
  },

  /**
   * Renders the item into the correct position on the desktop
   * @param {Component} c The component to render (this should not have been rendered previously)
   * @param {Number} position The position on the desktop to render this item to
   */
  renderItem: function(c, position) {
    if (c) {
      if (c.rendered) {
        //ensure it is in the correct position
        this.findLocationById(position).insertFirst(c.id);;
      } else {
        c.render(this.findLocationById(position));
      };
    }
  },
  
  /**
   * Returns the underlying table TD element for the specified position
   * @param {Number} id The numerical ID of the position
   * @return {Ext.Element} The TD Element (if found)
   */
  findLocationById: function(id) {
    return this.positions.detect(function(e) {return e.id == 'shortcut-position-' + id;});
  },

  /**
   * Returns the maximum number of shortcuts that can appear vertically stacked given
   * the desktop's current height and the size of this.shortcutSize
   */
  shortcutsHigh: function() {
    return parseInt(this.desktop.getWinHeight() / this.shortcutSize);
  },
 
  /**
   * Returns the maximum number of shortcuts that can appear horizontally stacked given
   * the desktop's current width and size of this.shortcutSize
   */
  shortcutsWide: function() {
    return parseInt(this.desktop.getWinWidth() / this.shortcutSize);   
  },
  
  /**
   * Adds the shortcut config to the specified position or the first available position
   */
  addShortcut: function(config) {
    console.log("adding shortcuts");
    console.log(config);
    Ext.applyIf(config, {
      position: this.firstAvailablePosition()
    });
       
    //make sure we can add the shortcut to this position:   
    if (!this.shortcutPositionAvailable(config.position)) {
      config.position = this.firstAvailablePosition();
    };
   
    var shortcut = config;
   
    this.shortcuts.push(shortcut);
  },
  
  /**
   * Adds an array of shortcuts to the desktop
   * @param {Array} An array of shortcut config objects
   */
  addShortcuts: function(array) {
    for (var i = array.length - 1; i >= 0; i--){
      this.addShortcut(array[i]);
    };
  },
  
  removeShortcut: function(id) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: remove shortcut code here
  },
 
  updateShortcut: function(id, config) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: update shortcut code here
  },
  
  /**
   * Returns the first available position for an icon to appear
   * @param {Integer} startIndex an optional index to start the search from
   * @return {Integer} The first available position at which to place a shortcut
   */
  firstAvailablePosition: function(startIndex) {
    var startIndex  = startIndex || 0;
    var maxPosition = this.highestShortcutPosition();
   
    //try to find the first available untaken position
    for (var i = startIndex; i < maxPosition; i++) {
      if (this.shortcutPositionAvailable(i)) {
        return i;
      };
    };
   
    //default to the highest existing position plus one
    return maxPosition + 1;
  },
 
  /**
   * Returns true if the indicated position is already occupied by a shortcut
   * @param {Integer} position The position to check
   * @return {Boolean} True if the position has already been taken
   */
  shortcutPositionAvailable: function(position) {
    var shortcuts = this.shortcuts;
   
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].position == position) {
        return false;
      };
    };
   
    return true;
  },
 
  /**
   * Returns the highest position currently occupied by a shortcut
   */
  highestShortcutPosition: function() {
    var shortcuts = this.shortcuts;
   
    var maxPosition = 0;
    for (var i = shortcuts.length - 1; i >= 0; i--){
      var pos = shortcuts[i].position;
     
      if (pos > maxPosition) { maxPosition = pos; }
    };
   
    return maxPosition;
  },
 
  /**
   * Attempts to find the shortcut with the given ID
   * @param {String} id The id of the shortcut to find
   * @return {Mixed} The shortcut object or false if it could not be found
   */
  findShortcutById: function(id) {
    var shortcuts = this.shortcuts;
    
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].id == id) {
        return shortcuts[i];
      };
    };
   
    return false;
  },
 
  /**
   * Allows searching of shortcuts by a given function
   * @param {Function} fn The function to find the shortcut by.  The function should return true for a match
   * @param {Scope} scope An optional scope to execute the finder function in
   * @return {Array} An array of matching shortcuts
   */
  findShortcutsBy: function(fn, scope) {
    var scope = scope || this;
    
    var shortcuts = this.shortcuts;
   
    var matches = [];
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (fn.call(scope, shortcuts[i]) === true) {
        matches.push(shortcuts[i]);
      };
    };
   
    return matches;
  }
});

Ext.reg('desktop_layout', Ext.ux.DesktopLayout);
Ext.Container.LAYOUTS['desktop'] = Ext.ux.DesktopLayout;

//currently defined in Shortcut.js due to load order issues
//TODO: fix the above!

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.app.Module = function(config){
    Ext.apply(this, config);
    Ext.app.Module.superclass.constructor.call(this);
    this.init();
}

Ext.extend(Ext.app.Module, Ext.util.Observable, {
    init : Ext.emptyFn
});

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

Ext.OS = function(app){
  var app = app || {};
   
  this.taskbar = new Ext.ux.TaskBar(app);
  var taskbar = this.taskbar;
 
  this.desktopEl = Ext.get('x-desktop');
  var desktopEl = this.desktopEl;
    
  this.taskbarEl = Ext.get('ux-taskbar');
  var taskbarEl  = this.taskbarEl;
 
  this.shortcuts = [];

  // var windows = new Ext.WindowGroup();
  var windows = Ext.WindowMgr;
  var activeWindow;
 
  function minimizeWin(win){
      win.minimized = true;
      win.hide();
  }

  function markActive(win){
      if(activeWindow && activeWindow != win){
          markInactive(activeWindow);
      }
      taskbar.setActiveButton(win.taskButton);
      activeWindow = win;
      Ext.fly(win.taskButton.el).addClass('active-win');
      win.minimized = false;
  }

  function markInactive(win){
      if(win == activeWindow){
          activeWindow = null;
          Ext.fly(win.taskButton.el).removeClass('active-win');
      }
  }

  function removeWin(win){
    taskbar.removeTaskButton(win.taskButton);
      layout();
  }

  function layout(){
      desktopEl.setHeight(Ext.lib.Dom.getViewHeight()-taskbarEl.getHeight());
  }
  Ext.EventManager.onWindowResize(layout);

  this.createWindow = function(config, cls){
    var win = new (cls||Ext.Window)(
          Ext.applyIf(config||{}, {
              manager: windows,
              minimizable: true,
              maximizable: true
          })
      );
      win.render(desktopEl);
      win.taskButton = taskbar.addTaskButton(win);

      win.cmenu = new Ext.menu.Menu({
          items: [

          ]
      });

      win.animateTarget = win.taskButton.el;
     
      win.on({
        'activate': {
          fn: markActive
        },
        'beforeshow': {
          fn: markActive
        },
        'deactivate': {
          fn: markInactive
        },
        'minimize': {
          fn: minimizeWin
        },
        'close': {
          fn: removeWin
        }
      });
     
      layout();
      return win;
  };
  
  this.getManager =function() {
    return windows;
  };
  
  this.getWindow = function(id) {
    return windows.get(id);
  };
  
  this.desktop = new Ext.Desktop({
    desktop: this
  });
    
  Ext.OS.superclass.constructor.call(this, app);
  
  layout();
  // this.initializeDropZone();

  // if(shortcuts){
  //     shortcuts.on('click', function(e, t){
  //       if(t = e.getTarget('dt', shortcuts)){
  //           e.stopEvent();
  //           var module = app.getModule(t.id.replace('-shortcut', ''));
  //           if(module){
  //               module.createWindow();
  //           }
  //       }
  //   });
  // }
};

Ext.extend(Ext.OS, Ext.util.Observable, {
  
  /**
   * Returns the height in pixels available to the desktop (minus the start bar).
   * Minimum 100px
   */
  getWinHeight: function() {
    var height = (Ext.lib.Dom.getViewHeight()-this.taskbarEl.getHeight());
    return height < 100 ? 100 : height;
  },
  
  /**
   * Returns the width in pixels available to the desktop.  Minimum 200px
   */
  getWinWidth: function() {
    var width = Ext.lib.Dom.getViewWidth();
    return width < 200 ? 200 : width;
  },
  
  getWinX: function(width) {
    return (Ext.lib.Dom.getViewWidth() - width) / 2;
  },
  
  getWinY: function(height) {
    return (Ext.lib.Dom.getViewHeight()-taskbarEl.getHeight() - height) / 2;
  },
  
  
/**
 *   My customisations below here...
 */
   
  /**
   * Returns the maximum number of shortcuts that can appear vertically stacked given
   * the desktop's current height and the size of this.shortcutSize
   */
  shortcutsHigh: function() {
    return parseInt(this.getWinHeight() / this.shortcutSize);
  },
 
  /**
   * Returns the maximum number of shortcuts that can appear horizontally stacked given
   * the desktop's current width and size of this.shortcutSize
   */
  shortcutsWide: function() {
    return parseInt(this.getWinWidth() / this.shortcutSize);   
  },
 
  /**
   * Adds the shortcut config to the specified position or the first available position
   */
  addShortcut: function(config) {
    Ext.applyIf(config, {
      position: this.firstAvailablePosition()
    });
       
    //make sure we can add the shortcut to this position:   
    if (!this.shortcutPositionAvailable(config.position)) {
      config.position = this.firstAvailablePosition();
    };
   
    var shortcut = config;
   
    this.shortcuts.push(shortcut);
  },
 
  /**
   * Returns the first available position for an icon to appear
   * @param {Integer} startIndex an optional index to start the search from
   * @return {Integer} The first available position at which to place a shortcut
   */
  firstAvailablePosition: function(startIndex) {
    var startIndex  = startIndex || 0;
    var maxPosition = this.highestShortcutPosition();
   
    //try to find the first available untaken position
    for (var i = startIndex; i < maxPosition; i++) {
      if (this.shortcutPositionAvailable(i)) {
        return i;
      };
    };
   
    //default to the highest existing position plus one
    return maxPosition + 1;
  },
 
  /**
   * Returns true if the indicated position is already occupied by a shortcut
   * @param {Integer} position The position to check
   * @return {Boolean} True if the position has already been taken
   */
  shortcutPositionAvailable: function(position) {
    var shortcuts = this.shortcuts;
   
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].position == position) {
        return false;
      };
    };
   
    return true;
  },
 
  /**
   * Returns the highest position currently occupied by a shortcut
   */
  highestShortcutPosition: function() {
    var shortcuts = this.shortcuts;
   
    var maxPosition = 0;
    for (var i = shortcuts.length - 1; i >= 0; i--){
      // console.log(shortcuts[i]);
      var pos = shortcuts[i].position;
     
      if (pos > maxPosition) { maxPosition = pos; }
    };
   
    return maxPosition;
  },
 
  /**
   * Adds an array of shortcuts to the desktop
   * @param {Array} An array of shortcut config objects
   */
  addShortcuts: function(array) {
    for (var i = array.length - 1; i >= 0; i--){
      this.addShortcut(array[i]);
    };
  },
 
  removeShortcut: function(id) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: remove shortcut code here
  },
 
  updateShortcut: function(id, config) {
    var shortcut = this.findShortcutById(id);
   
    //TODO: update shortcut code here
  },
 
  /**
   * Attempts to find the shortcut with the given ID
   * @param {String} id The id of the shortcut to find
   * @return {Mixed} The shortcut object or false if it could not be found
   */
  findShortcutById: function(id) {
    var shortcuts = this.shortcuts;
   
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (shortcuts[i].id == id) {
        return shortcuts[i];
      };
    };
   
    return false;
  },
 
  /**
   * Allows searching of shortcuts by a given function
   * @param {Function} fn The function to find the shortcut by.  The function should return true for a match
   * @return {Array} An array of matching shortcuts
   */
  findShortcutsBy: function(fn) {
    var shortcuts = this.shortcuts;
   
    var matches = [];
    for (var i = shortcuts.length - 1; i >= 0; i--){
      if (fn.call(this, shortcuts[i]) === true) {
        matches.push(shortcuts[i]);
      };
    };
   
    return matches;
  }
});

/**
 * Ext.ux.QuickLaunch
 * @extends Ext.Component
 * A Quick Launch area intended to be attached to a Start bar or other menu
 */
Ext.ux.QuickLaunch = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    renderTo: 'ux-taskbar-quick-launch',
    el: 'ux-taskbar-quick-launch',
    id:       'QuickLaunch',
    
    stateful: true,
    stateId:  'quick_launch',
    
    applyState: function() {
      console.log("quick launch apply state");
    },
    
    getState: function() {
      console.log("quick launch get state");
    }
  });
  
  Ext.ux.QuickLaunch.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.QuickLaunch, Ext.Component, {
  render: function() {
    console.log("rendering quick launch");
    
    
    Ext.ux.QuickLaunch.superclass.render.apply(this, arguments)
    console.log("frak");
  },
  
  onRender: function() {
    console.log("on render");
    this.el = new Ext.Element('<p></p>');
  }
});
Ext.reg('quick_launch', Ext.ux.QuickLaunch);

/**
 * Ext.ux.Shortcut
 * @extends Ext.Component
 * Generic shortcut implementation
 * You would usually not use this directly, instead use DesktopShortcut, QuickLaunchShortcut and StartMenuShortcut or define your own specialised subclass.  Remember to provide your own template when subclassing otherwise you will end up with empty divs instead of anything useful.  Check out DesktopShortcut for a simple example of this.
 * 
 */
Ext.ux.Shortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    text: 'Some Desktop Shortcut',
    id:    "shortcut-" + config.position
  });
  
  this.config = config;
  this.id = config.id;
  
  Ext.ux.Shortcut.superclass.constructor.call(this, config);  
};

Ext.extend(Ext.ux.Shortcut, Ext.Component, {
  hoverClass:    'x-shortcut-hover',
  selectedClass: 'x-shortcut-selected',
  
  /**
   * @config {Ext.Template} template The template to use when rendering this component's HTML.  The defaults to an empty div so you will need to override it
   */
  template: new Ext.Template('<div></div>'),
    
  /**
   * Renders the shortcut using its template, sets up various listeners
   */
  onRender: function(container) {
    this.el = this.template.append(container, [this.config.text, this.config.icon, this.id], true);
    this.el.on('mousedown',   this.onMouseDown,   this);
    this.el.on('dblclick',    this.onDblClick,    this);
    this.el.on('contextmenu', this.onContextMenu, this);
    this.el.on('mouseover',   this.onHover,       this);
    this.el.on('mouseout',    this.onHoverOut,    this);
  },
  
  onDblClick: function() {
    Ext.ux.MVC.NotificationManager.inform('Desktop item double clicked');
  },
  
  onHover: function() {
    this.el.addClass(this.hoverClass);
  },
  
  onHoverOut: function() {
    this.el.removeClass(this.hoverClass);
  },
  
  /**
   * Marks the shortcut as selected if the mousedown event is from a left click
   */
  onMouseDown: function(e) {
    if (e.button == 0) {
      this.select();
    };
  },
  
  /**
   * Marks this shortcut as selected (unselects all other shortcuts)
   */
  select: function() {
    Ext.ux.Shortcut.unselectAllShortcuts();
    this.el.addClass(this.selectedClass);
  },
  
  /**
   * Called on contextmenu event.  Override with your own logic
   * @param {Ext.EventObject} e The event object
   */
  onContextMenu: Ext.emptyFn,
  
  /**
   * Unselects this shortcut
   */
  unselect: function() {
    this.el.removeClass(this.selectedClass);
  }
});

/**
 * Removes this.selectedClass from all shortcuts
 * @param {String} xtype The xtype to find and unselect instances of.  Defaults to 'shortcut', change to one of the other shortcut xtypes (e.g. 'desktop_shortcut') to target just that type
 */
Ext.ux.Shortcut.unselectAllShortcuts = function(xtype) {
  var xtype = xtype || 'shortcut';
  var xtypeRegExp = new RegExp(xtype);
  
  var shortcuts = Ext.ComponentMgr.all.filterBy(function(e) {return xtypeRegExp.test(e.getXTypes()); })
  shortcuts.each(function(e) {e.unselect();});
};

Ext.reg('shortcut', Ext.ux.Shortcut);



/**
 * Ext.ux.DesktopShortcut
 * @extends Ext.ux.Shortcut
 * Provides a desktop icon component with right click menu
 */
Ext.ux.DesktopShortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    contextMenuConfig: {
      items: [
        {
          text:    'Delete this shortcut',
          scope:   this,
          iconCls: 'delete',
          handler: function() {
            Ext.ux.MVC.NotificationManager.inform('Deleting shortcut ' + this.id);
          }
        }
      ]
    }
  });
  
  Ext.ux.DesktopShortcut.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.DesktopShortcut, Ext.ux.Shortcut, {
  template: new Ext.Template(
    '<div class="x-shortcut x-shortcut-desktop" id="{2}">',
      '<div class="x-shortcut-icon"><img src="{1}" /></div>',
      '<span unselectable="on">{0}</span>',
    '</div>'
  ),
  
  /**
   * Intercepts right click and displays a context menu.  Override to provide your own implementation
   */
  onContextMenu: function(e) {
    e.stopEvent();
    this.select();
    
    if (!this.contextMenu) {
      this.contextMenu = new Ext.menu.Menu(this.config.contextMenuConfig);
    };
    
    //make sure the context menu has been rendered...
    if (!this.contextMenu.el) { this.contextMenu.render();}
    
    this.contextMenu.showAt(e.getXY());
  }
});
Ext.reg('desktop_shortcut', Ext.ux.DesktopShortcut);


/**
 * Ext.ux.QuickLaunchShortcut
 * @extends Ext.ux.Shortcut
 * Small shortcut icon intended to be added to a start bar quick launch area
 */
Ext.ux.QuickLaunchShortcut = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.QuickLaunchShortcut.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.QuickLaunchShortcut, Ext.ux.Shortcut, {
  template: new Ext.Template(
    '<div class="x-shortcut x-shortcut-quick-launch" id="{2}">',
      '<div class="x-shortcut-icon"><img src="{1}" /></div>',
    '</div>'
  ),
  
  onContextMenu: function() {
    console.log("context menu appears");
  }
});
Ext.reg('quick_launch_shortcut', Ext.ux.QuickLaunchShortcut);

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

/**
 * @class Ext.ux.StartMenu
 * @extends Ext.menu.Menu
 * A start menu object.
 * @constructor
 * Creates a new StartMenu
 * @param {Object} config Configuration options
 *
 * SAMPLE USAGE:
 *
 * this.startMenu = new Ext.ux.StartMenu({
 *		iconCls: 'user',
 *		height: 300,
 *		shadow: true,
 *		title: get_cookie('memberName'),
 *		width: 300
 *	});
 *
 * this.startMenu.add({
 *		text: 'Grid Window',
 *		iconCls:'icon-grid',
 *		handler : this.createWindow,
 *		scope: this
 *	});
 *
 * this.startMenu.addTool({
 *		text:'Logout',
 *		iconCls:'logout',
 *		handler:function(){ window.location = "logout.php"; },
 *		scope:this
 *	});
 */

Ext.namespace("Ext.ux");

Ext.ux.StartMenu = function(config){
	Ext.ux.StartMenu.superclass.constructor.call(this, config);
    
    var tools = this.toolItems;
    this.toolItems = new Ext.util.MixedCollection();
    if(tools){
        this.addTool.apply(this, tools);
    }
};

Ext.extend(Ext.ux.StartMenu, Ext.menu.Menu, {
    // private
    render : function(){
        if(this.el){
            return;
        }
        var el = this.el = new Ext.Layer({
            cls: "x-menu ux-start-menu", // this might affect item click
            shadow:this.shadow,
            constrain: false,
            parentEl: this.parentEl || document.body,
            zindex:15000
        });
        
        var header = el.createChild({
        	tag: "div",
        	cls: "x-window-header x-unselectable x-panel-icon "+this.iconCls
        });
		this.header = header;
		var headerText = header.createChild({
			tag: "span",
			cls: "x-window-header-text"
		});
		var tl = header.wrap({
			cls: "ux-start-menu-tl"
		});
		var tr = header.wrap({
			cls: "ux-start-menu-tr"
		});
		var tc = header.wrap({
			cls: "ux-start-menu-tc"
		});
		
		this.menuBWrap = el.createChild({
			tag: "div",
			cls: "x-window-body x-border-layout-ct ux-start-menu-body"
		});
		var ml = this.menuBWrap.wrap({
			cls: "ux-start-menu-ml"
		});
		var mc = this.menuBWrap.wrap({
			cls: "x-window-mc ux-start-menu-bwrap"
		});
		
		this.menuPanel = this.menuBWrap.createChild({
			tag: "div",
			cls: "x-panel x-border-panel ux-start-menu-apps-panel"
		});
		this.toolsPanel = this.menuBWrap.createChild({
			tag: "div",
			cls: "x-panel x-border-panel ux-start-menu-tools-panel"
		});
		
		var bwrap = ml.wrap({cls: "x-window-bwrap"});
		var bc = bwrap.createChild({
			tag: "div",
			cls: "ux-start-menu-bc"
		});
		var bl = bc.wrap({
			cls: "ux-start-menu-bl x-panel-nofooter"
		});
		var br = bc.wrap({
			cls: "ux-start-menu-br"
		});
		
        this.keyNav = new Ext.menu.MenuNav(this);

        if(this.plain){
            el.addClass("x-menu-plain");
        }
        if(this.cls){
            el.addClass(this.cls);
        }
        // generic focus element
        this.focusEl = el.createChild({
            tag: "a",
            cls: "x-menu-focus",
            href: "#",
            onclick: "return false;",
            tabIndex:"-1"
        });
        
        var ul = this.menuPanel.createChild({
        	tag: "ul",
        	cls: "x-menu-list"});
        var toolsUl = this.toolsPanel.createChild({
        	tag: "ul",
        	cls: "x-menu-list"
        });
        
        var ulListeners = {
        	"click": {
        		fn: this.onClick,
        		scope: this
        	},
        	"mouseover": {
        		fn: this.onMouseOver,
        		scope: this
        	},
        	"mouseout": {
        		fn: this.onMouseOut,
        		scope: this
        	}
        };
        
        ul.on(ulListeners);
        
        this.items.each(
        	function(item){
	            var li = document.createElement("li");
	            li.className = "x-menu-list-item";
	            ul.dom.appendChild(li);
	            item.render(li, this);
	        }, this);

        this.ul = ul;
        this.autoWidth();

        toolsUl.on(ulListeners);
        
        this.toolItems.each(
        	function(item){
	            var li = document.createElement("li");
	            li.className = "x-menu-list-item";
	            toolsUl.dom.appendChild(li);
	            item.render(li, this);
	        }, this);
	        
        this.toolsUl = toolsUl;
        this.autoWidth();
             
        this.menuBWrap.setStyle('position', 'relative');  
        this.menuBWrap.setHeight(this.height);
        
        this.menuPanel.setStyle({
        	padding: '2px',
        	position: 'absolute',
        	overflow: 'auto'
        });
        
        this.toolsPanel.setStyle({
        	padding: '2px 4px 2px 2px',
        	position: 'absolute',
        	overflow: 'auto'
        });
        
        this.setTitle(this.title);
    },
    
    // private
    findTargetItem : function(e){
        var t = e.getTarget(".x-menu-list-item", this.ul,  true);
        if(t && t.menuItemId){
        	if(this.items.get(t.menuItemId)){
            	return this.items.get(t.menuItemId);
            }else{
            	return this.toolItems.get(t.menuItemId);
            }
        }
    },

    /**
     * Displays this menu relative to another element
     * @param {Mixed} element The element to align to
     * @param {String} position (optional) The {@link Ext.Element#alignTo} anchor position to use in aligning to
     * the element (defaults to this.defaultAlign)
     * @param {Ext.ux.StartMenu} parentMenu (optional) This menu's parent menu, if applicable (defaults to undefined)
     */
    show : function(el, pos, parentMenu){
        this.parentMenu = parentMenu;
        if(!this.el){
            this.render();
        }

        this.fireEvent("beforeshow", this);
        this.showAt(this.el.getAlignToXY(el, pos || this.defaultAlign), parentMenu, false);
        
        var tPanelWidth = 100;      
        var box = this.menuBWrap.getBox();
        this.menuPanel.setWidth(box.width-tPanelWidth);
        this.menuPanel.setHeight(box.height);
        
        this.toolsPanel.setWidth(tPanelWidth);
        this.toolsPanel.setX(box.x+box.width-tPanelWidth);
        this.toolsPanel.setHeight(box.height);
    },
    
    addTool : function(){
        var a = arguments, l = a.length, item;
        for(var i = 0; i < l; i++){
            var el = a[i];
            if(el.render){ // some kind of Item
                item = this.addToolItem(el);
            }else if(typeof el == "string"){ // string
                if(el == "separator" || el == "-"){
                    item = this.addToolSeparator();
                }else{
                    item = this.addText(el);
                }
            }else if(el.tagName || el.el){ // element
                item = this.addElement(el);
            }else if(typeof el == "object"){ // must be menu item config?
                item = this.addToolMenuItem(el);
            }
        }
        return item;
    },
    
    /**
     * Adds a separator bar to the Tools
     * @return {Ext.menu.Item} The menu item that was added
     */
    addToolSeparator : function(){
        return this.addToolItem(new Ext.menu.Separator({itemCls: 'ux-toolmenu-sep'}));
    },

    addToolItem : function(item){
        this.toolItems.add(item);
        if(this.ul){
            var li = document.createElement("li");
            li.className = "x-menu-list-item";
            this.ul.dom.appendChild(li);
            item.render(li, this);
            this.delayAutoWidth();
        }
        return item;
    },

    addToolMenuItem : function(config){
        if(!(config instanceof Ext.menu.Item)){
            if(typeof config.checked == "boolean"){ // must be check menu item config?
                config = new Ext.menu.CheckItem(config);
            }else{
                config = new Ext.menu.Item(config);
            }
        }
        return this.addToolItem(config);
    },
    
    setTitle : function(title, iconCls){
        this.title = title;
        this.header.child('span').update(title);
        return this;
    }
});

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

/**
 * @class Ext.ux.TaskBar
 * @extends Ext.util.Observable
 */
Ext.ux.TaskBar = function(app){
  this.app = app;
  this.init();
};

Ext.extend(Ext.ux.TaskBar, Ext.util.Observable, {
    init : function(){
    this.startMenu = new Ext.ux.StartMenu(Ext.apply({
      iconCls: 'user',
      height: 300,
      shadow: true,
      title: 'Jack Slocum',
      width: 300
    }, this.app.startConfig));
    
    this.startBtn = new Ext.Button({
      text: 'Start',
      id: 'ux-startbutton',
      iconCls:'start',
      menu: this.startMenu,
      menuAlign: 'bl-tl',
      renderTo: 'ux-taskbar-start',
      clickEvent:'mousedown',
      template: new Ext.Template(
        '<table border="0" cellpadding="0" cellspacing="0" class="x-btn-wrap"><tbody><tr>',
          '<td class="ux-startbutton-left"><i>&#160;</i></td><td class="ux-startbutton-center"><em unselectable="on"><button class="x-btn-text" type="{1}" style="height:30px;">{0}</button></em></td><td class="ux-startbutton-right"><i>&#160;</i></td>',
        "</tr></tbody></table>")
    });
        
    var width = Ext.get('ux-startbutton').getWidth()+10;
        
    var sbBox = new Ext.BoxComponent({
      el: 'ux-taskbar-start',
      id: 'TaskBarStart',
      split:    true,
      minWidth: width,
      width:    width,
      region:   'west'
    });
    
    // var qlBox = new Ext.ux.QuickLaunch({
    //   region: 'center',
    //   width:  100
    //   // style:  'border: 5px solid red;'
    // });
    
    this.tbPanel = new Ext.ux.TaskButtonsPanel({
      el: 'ux-taskbuttons-panel',
      id: 'TaskBarButtons',
      region:'center'
    });
        
    var container = new Ext.ux.TaskBarContainer({
      el: 'ux-taskbar',
      layout: 'border',
      items: [sbBox, this.tbPanel]
    });
    
    return this;
    },
    
    addTaskButton : function(win){
    return this.tbPanel.addButton(win, 'ux-taskbuttons-panel');
  },
  
  removeTaskButton : function(btn){
    this.tbPanel.removeButton(btn);
  },
  
  setActiveButton : function(btn){
    this.tbPanel.setActiveButton(btn);
  }
});



/**
 * @class Ext.ux.TaskBarContainer
 * @extends Ext.Container
 */
Ext.ux.TaskBarContainer = Ext.extend(Ext.Container, {
    initComponent : function() {
        Ext.ux.TaskBarContainer.superclass.initComponent.call(this);
        
        this.el = Ext.get(this.el) || Ext.getBody();
        this.el.setHeight = Ext.emptyFn;
        this.el.setWidth = Ext.emptyFn;
        this.el.setSize = Ext.emptyFn;
        this.el.setStyle({
            overflow:'hidden',
            margin:'0',
            border:'0 none'
        });
        this.el.dom.scroll = 'no';
        this.allowDomMove = false;
        this.autoWidth = true;
        this.autoHeight = true;
        Ext.EventManager.onWindowResize(this.fireResize, this);
        this.renderTo = this.el;
    },

    fireResize : function(w, h){
        this.fireEvent('resize', this, w, h, w, h);
    }
});



/**
 * @class Ext.ux.TaskButtonsPanel
 * @extends Ext.BoxComponent
 */
Ext.ux.TaskButtonsPanel = Ext.extend(Ext.BoxComponent, {
  activeButton:         null,
  enableScroll:         true,
  scrollIncrement:      0,
  scrollRepeatInterval: 400,
  scrollDuration:       .35,
  animScroll:           true,
  resizeButtons:        true,
  buttonWidth:          168,
  minButtonWidth:       118,
  buttonMargin:         2,
  buttonWidthSet:       false,
  
  initComponent : function() {
    Ext.ux.TaskButtonsPanel.superclass.initComponent.call(this);
    this.on('resize', this.delegateUpdates);
    this.items = [];

    this.stripWrap = Ext.get(this.el).createChild({
      cls: 'ux-taskbuttons-strip-wrap',
      cn: {
        tag:'ul', cls:'ux-taskbuttons-strip'
      }
    });
    
    this.stripSpacer = Ext.get(this.el).createChild({
      cls:'ux-taskbuttons-strip-spacer'
    });
    this.strip = new Ext.Element(this.stripWrap.dom.firstChild);
    
    this.edge = this.strip.createChild({
      tag:'li',
      cls:'ux-taskbuttons-edge'
    });
    this.strip.createChild({
      cls:'x-clear'
    });
  },
  
  addButton : function(win){
    var li = this.strip.createChild({tag:'li'}, this.edge); // insert before the edge
    var btn = new Ext.ux.TaskBar.TaskButton(win, li);
    
    this.items.push(btn);
    
    if(!this.buttonWidthSet){
      this.lastButtonWidth = btn.container.getWidth();
    }
    
    this.setActiveButton(btn);
    return btn;
  },
  
  removeButton : function(btn){
    var li = document.getElementById(btn.container.id);
    btn.destroy();
    li.parentNode.removeChild(li);
    
    var s = [];
    for(var i = 0, len = this.items.length; i < len; i++) {
      if(this.items[i] != btn){
        s.push(this.items[i]);
      }
    }
    this.items = s;
    
    this.delegateUpdates();
  },
  
  setActiveButton : function(btn){
    this.activeButton = btn;
    this.delegateUpdates();
  },
  
  delegateUpdates : function(){
    /*if(this.suspendUpdates){
            return;
        }*/
        if(this.resizeButtons && this.rendered){
            this.autoSize();
        }
        if(this.enableScroll && this.rendered){
            this.autoScroll();
        }
    },
    
    autoSize : function(){
        var count = this.items.length;
        var ow = this.el.dom.offsetWidth;
        var aw = this.el.dom.clientWidth;

        if(!this.resizeButtons || count < 1 || !aw){ // !aw for display:none
            return;
        }
        
        var each = Math.max(Math.min(Math.floor((aw-4) / count) - this.buttonMargin, this.buttonWidth), this.minButtonWidth); // -4 for float errors in IE
        var btns = this.stripWrap.dom.getElementsByTagName('button');
        
        this.lastButtonWidth = Ext.get(btns[0].id).findParent('li').offsetWidth;
        
        for(var i = 0, len = btns.length; i < len; i++) {            
          var btn = btns[i];
          
          var tw = Ext.get(btns[i].id).findParent('li').offsetWidth;
          var iw = btn.offsetWidth;
          
          btn.style.width = (each - (tw-iw)) + 'px';
        }
    },
    
    autoScroll : function(){
      var count = this.items.length;
        var ow = this.el.dom.offsetWidth;
        var tw = this.el.dom.clientWidth;
        
        var wrap = this.stripWrap;
        var cw = wrap.dom.offsetWidth;
        var pos = this.getScrollPos();
        var l = this.edge.getOffsetsTo(this.stripWrap)[0] + pos;
        
        if(!this.enableScroll || count < 1 || cw < 20){ // 20 to prevent display:none issues
            return;
        }
        
        wrap.setWidth(tw); // moved to here because of problem in Safari
        
        if(l <= tw){
            wrap.dom.scrollLeft = 0;
            //wrap.setWidth(tw); moved from here because of problem in Safari
            if(this.scrolling){
                this.scrolling = false;
                this.el.removeClass('x-taskbuttons-scrolling');
                this.scrollLeft.hide();
                this.scrollRight.hide();
            }
        }else{
            if(!this.scrolling){
                this.el.addClass('x-taskbuttons-scrolling');
            }
            tw -= wrap.getMargins('lr');
            wrap.setWidth(tw > 20 ? tw : 20);
            if(!this.scrolling){
                if(!this.scrollLeft){
                    this.createScrollers();
                }else{
                    this.scrollLeft.show();
                    this.scrollRight.show();
                }
            }
            this.scrolling = true;
            if(pos > (l-tw)){ // ensure it stays within bounds
                wrap.dom.scrollLeft = l-tw;
            }else{ // otherwise, make sure the active button is still visible
        this.scrollToButton(this.activeButton, true); // true to animate
            }
            this.updateScrollButtons();
        }
    },

    createScrollers : function(){
        var h = this.el.dom.offsetHeight; //var h = this.stripWrap.dom.offsetHeight;
    
        // left
        var sl = this.el.insertFirst({
            cls:'ux-taskbuttons-scroller-left'
        });
        sl.setHeight(h);
        sl.addClassOnOver('ux-taskbuttons-scroller-left-over');
        this.leftRepeater = new Ext.util.ClickRepeater(sl, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollLeft,
            scope: this
        });
        this.scrollLeft = sl;

        // right
        var sr = this.el.insertFirst({
            cls:'ux-taskbuttons-scroller-right'
        });
        sr.setHeight(h);
        sr.addClassOnOver('ux-taskbuttons-scroller-right-over');
        this.rightRepeater = new Ext.util.ClickRepeater(sr, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollRight,
            scope: this
        });
        this.scrollRight = sr;
    },
    
    getScrollWidth : function(){
        return this.edge.getOffsetsTo(this.stripWrap)[0] + this.getScrollPos();
    },

    getScrollPos : function(){
        return parseInt(this.stripWrap.dom.scrollLeft, 10) || 0;
    },

    getScrollArea : function(){
        return parseInt(this.stripWrap.dom.clientWidth, 10) || 0;
    },

    getScrollAnim : function(){
        return {
          duration: this.scrollDuration,
          callback: this.updateScrollButtons,
          scope: this
        };
    },

    getScrollIncrement : function(){
      return (this.scrollIncrement || this.lastButtonWidth+2);
    },
    
    /* getBtnEl : function(item){
        return document.getElementById(item.id);
    }, */
    
    scrollToButton : function(item, animate){
      item = item.el.dom.parentNode; // li
        if(!item){ return; }
        var el = item; //this.getBtnEl(item);
        var pos = this.getScrollPos(), area = this.getScrollArea();
        var left = Ext.fly(el).getOffsetsTo(this.stripWrap)[0] + pos;
        var right = left + el.offsetWidth;
        if(left < pos){
            this.scrollTo(left, animate);
        }else if(right > (pos + area)){
            this.scrollTo(right - area, animate);
        }
    },
    
    scrollTo : function(pos, animate){
        this.stripWrap.scrollTo('left', pos, animate ? this.getScrollAnim() : false);
        if(!animate){
            this.updateScrollButtons();
        }
    },
    
    onScrollRight : function(){
        var sw = this.getScrollWidth()-this.getScrollArea();
        var pos = this.getScrollPos();
        var s = Math.min(sw, pos + this.getScrollIncrement());
        if(s != pos){
          this.scrollTo(s, this.animScroll);
        }        
    },

    onScrollLeft : function(){
        var pos = this.getScrollPos();
        var s = Math.max(0, pos - this.getScrollIncrement());
        if(s != pos){
            this.scrollTo(s, this.animScroll);
        }
    },
    
    updateScrollButtons : function(){
        var pos = this.getScrollPos();
        this.scrollLeft[pos == 0 ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-left-disabled');
        this.scrollRight[pos >= (this.getScrollWidth()-this.getScrollArea()) ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-right-disabled');
    }
});



/**
 * @class Ext.ux.TaskBar.TaskButton
 * @extends Ext.Button
 */
Ext.ux.TaskBar.TaskButton = function(win, el){
  this.win = win;
    Ext.ux.TaskBar.TaskButton.superclass.constructor.call(this, {
        iconCls: win.iconCls,
        text: Ext.util.Format.ellipsis(win.title, 18),
        renderTo: el,
        handler : function(){
            if(win.minimized || win.hidden){
                win.show();
            }else if(win == win.manager.getActive()){
                win.minimize();
            }else{
                win.toFront();
            }
        },
        clickEvent:'mousedown',
        template: new Ext.Template(
      '<table border="0" cellpadding="0" cellspacing="0" class="x-btn-wrap"><tbody><tr>',
      '<td class="ux-taskbutton-left"><i>&#160;</i></td><td class="ux-taskbutton-center"><em unselectable="on"><button class="x-btn-text" type="{1}" style="height:28px;">{0}</button></em></td><td class="ux-taskbutton-right"><i>&#160;</i></td>',
      "</tr></tbody></table>")
    });
};

Ext.extend(Ext.ux.TaskBar.TaskButton, Ext.Button, {
    onRender : function(){
        Ext.ux.TaskBar.TaskButton.superclass.onRender.apply(this, arguments);

        this.cmenu = new Ext.menu.Menu({
            items: [{
                text: 'Restore',
                handler: function(){
                    if(!this.win.isVisible()){
                        this.win.show();
                    }else{
                        this.win.restore();
                    }
                },
                scope: this
            },{
                text: 'Minimize',
                handler: this.win.minimize,
                scope: this.win
            },{
                text: 'Maximize',
                handler: this.win.maximize,
                scope: this.win
            }, '-', {
                text: 'Close',
                handler: this.closeWin.createDelegate(this, this.win, true),
                scope: this.win
            }]
        });

        this.cmenu.on('beforeshow', function(){
            var items = this.cmenu.items.items;
            var w = this.win;
            items[0].setDisabled(w.maximized !== true && w.hidden !== true);
            items[1].setDisabled(w.minimized === true);
            items[2].setDisabled(w.maximized === true || w.hidden === true);
        }, this);

        this.el.on('contextmenu', function(e){
            e.stopEvent();
            if(!this.cmenu.el){
                this.cmenu.render();
            }
            var xy = e.getXY();
            xy[1] -= this.cmenu.el.getHeight();
            this.cmenu.showAt(xy);
        }, this);
    },
    
    closeWin : function(cMenu, e, win){
    if(!win.isVisible()){
      win.show();
    }else{
      win.restore();
    }
    win.close();
  }
});

// make paging toolbars save state
Ext.PagingToolbar.override({
  init : function (grid) {
    this.grid = grid;        
    this.grid.on("beforestatesave", this.saveState, this);    
    Ext.util.Observable.capture(grid.store, this.onStateChange, this);
  },
  saveState : function(grid, state) {
    state.start = grid.store.lastOptions.params.start;
  },
  onStateChange : function(ev, store, records, options) {
    if (ev == "load") {this.grid.saveState(); };
  }
});

/**
 ************** DEPRECATED - USE BelongsToCombo INSTEAD **************
 *
 * Generic combo box usable for all belongs_to associations.
 * Example usage - adding a Section combo to a Page model:
 * 
 * new belongsToCombo(Page, Section, {fieldLabel: 'Pick a Section for this Page to appear in'});
 * 
 * This returns a combo box linking the two models together, and overrides the defauld fieldLabel
 * 
 * If you want to override certain settings (almost) every time, just subclass the helper:
 * 
 * <pre><code>
function sectionCombo(belongs_to_model, config) {
  return new belongsToCombo(Section, belongs_to_model, Ext.applyIf(config, {
    fieldLabel: 'Pick a Section for this Page to appear in'
  }))
}
</code></pre>
 * 
 * You can then use the new sectionCombo helper, and still override the default fieldLabel you set
 * in the helper itself:
 * 
 * new sectionCombo(Page, {fieldLabel: 'Something different'});
*/
function belongsToCombo(model, belongs_to_model, config) {
  var config = config || {};
  
  combo = new Ext.form.ComboBox(
    Ext.applyIf(config, {
      fieldLabel: belongs_to_model.human_singular_name, 
      id: belongs_to_model.foreign_key_name,
      name: model.model_name + '[' + belongs_to_model.foreign_key_name + ']',
      anchor: "90%",
      triggerAction: 'all',
      store: belongs_to_model.collectionStore(),
      pageSize: 1000,
      forceSelection: true,
      displayField: 'title',
      valueField: 'id',
      hiddenName: model.model_name + '[' + belongs_to_model.foreign_key_name + ']'
    })
  );
  
  combo.store.load({params: {start: 0, limit: 1000}});
  
  return combo;
};

/**
 * BelongsToCombo
 * @extends Ext.form.ComboBox
 * Description
 */
BelongsToCombo = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    fieldLabel: config.belongs_to_model.human_singular_name, 
    id: config.belongs_to_model.foreign_key_name,
    name: config.model.model_name + '[' + config.belongs_to_model.foreign_key_name + ']',
    anchor: "95%",
    triggerAction: 'all',
    store: config.belongs_to_model.collectionStore(),
    pageSize: 1000,
    forceSelection: true,
    displayField: 'title',
    valueField: 'id',
    hiddenName: config.model.model_name + '[' + config.belongs_to_model.foreign_key_name + ']'
  });
  
  BelongsToCombo.superclass.constructor.call(this, config);
  
  this.store.load({params: {start: 0, limit: 1000}});
};
Ext.extend(BelongsToCombo, Ext.form.ComboBox);
Ext.reg('belongs_to_combo', BelongsToCombo);

Ext.ux.MVC.controller.Base = function(config) {
  
  this.application = application;

  this.showPanel = function(panel) {
    this.application.getLayoutManager().showPanel(panel);
  };
  
  this.doAction = function(action_name, params) {
    eval("this.view" + action_name + "(" + params + ")");
  };
};

Ext.ux.MVC.controller.CrudController = function(config) {
  Ext.apply(this, config);
  Ext.applyIf(this, {
    batchDestroyUrl : '/admin/batch_destroy_' + this.model.url_name + '.ext_json',
    deleteTitle     : function(number_of_items_to_delete) {
      if (number_of_items_to_delete > 1) {
        return "Delete " + this.model.human_plural_name + "?";
      } else {
        return "Delete " + this.model.human_singlular_name + "?";
      };
    },
    deleteMessage : function(number_of_items_to_delete) {
      if (number_of_items_to_delete > 1) {
        return "Are you sure you want to delete these " + this.model.human_plural_name + "? This cannot be undone";
      } else {
        return "Are you sure you want to delete this " + this.model.human_singular_name + "? This cannot be undone";
      };
    },
    deleteFailure : function() {
      Ext.Msg.alert(this.model.human_singular_name + ' not deleted', 'Something went wrong when trying to delete the ' + this.model.human_singular_name + ' - please try again');
    }
  });
  
  //TODO: a small taste of eval laziness to avoid naming default views each time
  if (this.namespace) {
    Ext.applyIf(this, {
      indexPanel: eval(this.namespace + ".views." + this.model.class_name + ".Index"),
      newPanel:   eval(this.namespace + ".views." + this.model.class_name + ".New"),
      editPanel:  eval(this.namespace + ".views." + this.model.class_name + ".Edit")
    });
  };
  
  
  Ext.ux.MVC.controller.CrudController.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.MVC.controller.CrudController, Ext.ux.MVC.controller.Base, {  
  viewIndex : function(options) {
    this.showPanel(new this.indexPanel(options));
  },
  
  viewNew : function(options) {
    this.showPanel(new this.newPanel(options));
  },
  
  viewEdit : function(records, config) {
    ids = Ext.ux.MVC.params[":id"].split(",");
    if (ids.length == 0) {return false;};
    this.showPanel(new this.editPanel({ids: ids}));
  },
  
  nextPage : function(store) {
    this.nextOrPreviousPage(store, 'UP');
  },
  
  previousPage : function(store) {
    this.nextOrPreviousPage(store, 'DOWN');
  },
  
  firstPage : function(store) {
    store.load({params: {start: 0, limit: store.lastOptions.params.limit}});
  },
  
  lastPage : function(store) {
    limit = store.lastOptions.params.limit;
    lastPage = Math.floor((store.totalLength - 1) / limit) * limit;
    store.load({params: {start: lastPage, limit: limit}});
  },
  
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
  
  deleteSelected : function(grid) {
    var ids = new Array();
    selections = grid.getSelectionModel().getSelections();
    for (var i=0; i < selections.length; i++) { ids.push(selections[i].data.id);};
    if (ids.length == 0) {return false;};
    
    var deleteTitle = this.deleteTitle(ids.length);
    var deleteMessage = this.deleteMessage(ids.length);
    var url = this.batchDestroyUrl;
    
    Ext.Msg.confirm(deleteTitle, deleteMessage, function(btn) {
      if (btn == 'yes') {
        Ext.Ajax.request({
          url: url,
          method: 'post',
          params: "_method=delete&ids=" + ids.join(","),
          success: function() {
            grid.store.reload();
          },
          failure: function() {
            this.deleteFailure();
            grid.store.reload();
          }
        });
      };
    });
  }
  
});

Ext.ux.MVC.controller.SingletonController = function(config) {
  Ext.apply(this, config);
  Ext.ux.MVC.controller.CrudController.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.MVC.controller.SingletonController, Ext.ux.MVC.controller.Base, {
  viewIndex : function(options) {
    return this.viewEdit(options);
  },
  
  viewEdit: function(options) {
    this.showPanel(new this.editPanel(options));
  }
});

/**
 * Ext.ux.MVC.model.Base
 * Abstract base class providing convenience methods for most types of data models
 * Aims to emulate much of the functionality of Rails' ActiveRecord
 * Usage: create a new model type like this:
 * 
<pre><code>
  Page = new Ext.ux.MVC.model.Base('page')
</code></pre>
 * Model will try to guess sensible default values for properties such as humanized names, etc
 * See JSDocs for full reference.  Default properties can be overridden like this:
<pre><code>
 AdvertisingCategory = new Ext.ux.MVC.model.Base('advertising_category', {
    controller_name:   'AdvertisingCategoriesController',
    human_plural_name: 'Advertising Categories',
    url_name:          'advertising_categories'
  });
</code></pre>
 *
 */

Ext.ux.MVC.model.Base = function(model_name, config) {
  
  /**
   * guess at best string names for the variations on the model name.  e.g. for a model with
   * model_name = 'advert_group':
   * underscore_name = 'advert_group'
   * url_name = 'advert_groups'
   * human_singular_name = 'Advert Group'
   * human_plural_name = 'Advert Groups'
   */
  Ext.apply(this, config, {
    model_name                   : model_name,
    underscore_name              : model_name,
    url_name                     : this.urlize_name(model_name),
    human_singular_name          : this.singularize_human_name(model_name),
    human_plural_name            : this.pluralize_human_name(model_name),
    controller_name              : this.controller_name(model_name),
    class_name                   : this.classify_name(model_name),
    foreign_key_name             : model_name + "_id",
    parametized_foreign_key_name : ":" + model_name + "_id",
    url_namespace                : '/admin',
    url_extension                : '.ext_json'
  });
};

Ext.ux.MVC.model.Base.prototype = {
  
  /**
   * Returns the passed url wrapped in the model's namespace and url extension
   * @return {String} Passed url string wrapped in model's namespace and url extension
   */
  namespacedUrl : function(url) {
    return(String.format("{0}/{1}{2}", this.url_namespace, url, this.url_extension));
  },

  /**
   * URL to retrieve a JSON representation of this model from
   * Can pass it either a number or a Record, so long as the record looks something like
   * {data: {id: 1}}
   */
  singleDataUrl : function(record_or_id) {
    if (record_or_id.data && record_or_id.data.id) {
      record_or_id = record_or_id.data.id;
    };
    return this.namespacedUrl(String.format("{0}/{1}", this.url_name, record_or_id));
  },
  
  /**
   * URL to retrieve a JSON representation of the collection of this model from
   * This would typically return the first page of results (see {@link #collectionStore})
   */
  collectionDataUrl : function(config) {
    return this.namespacedUrl(this.url_name);
  },
  
  /**
   * Local url (after the # in the address bar) which identifies the show URL for this model
   */
  showUrl : function(record_or_id) {
    return this.editUrl(record_or_id);
  },
  
  /**
   * Local url to display the new record form
   */
  newUrl : function() {
    return this.url_name + "/New";
  },
  
  /**
   * Local url (after the # in the address bar) which identifies the edit URL for this model
   */
  editUrl : function(record_or_id) {
    if (record_or_id.data && record_or_id.data.id) {
      record_or_id = record_or_id.data.id;
    };
    return this.url_name + "/Edit/" + record_or_id;
  },
  
  collectionUrl : function(config) {
    return this.url_name + "/Index";
  },
  
  /**
   * URL to retrieve a tree representation of this model from (in JSON format)
   * This is used when populating most of the trees in Ext.ux.MVC, though
   * only applies to models which can be representated as trees
   */
  treeUrl: function(config) {
    return this.namespacedUrl(String.format("{0}/tree", this.url_name));
  },
  
  /**
   * URL to post details of a drag/drop reorder operation to.  When reordering a tree
   * for a given model, this url is called immediately after the drag event with the
   * new configuration
   * TODO: Provide more info/an example here
   */
  treeReorderUrl: function(record) {
    return this.namespacedUrl(String.format("{0}/reorder/{1}", this.url_name, record.data.id));
  },
  
  /**
   * Returns an Ext.data.Store which is configured to load from the {@link #singleDataUrl} method
   * Returned Store is also configured with this model's reader
   * @cfg {Number} id Unique ID of the model - will be used to build the resource URL
   * @cfg {Object} storeConfig Additional configuration options which are passed to the Store
   * @return {Ext.data.Store} A store configured to load the record
   */
  singleStore : function(id, storeConfig) {
    if (storeConfig === undefined) {storeConfig = {};};
    
    return new Ext.data.Store(
      Ext.applyIf(storeConfig, {
        url: this.singleDataUrl(id),
        reader: this.getReader()
      })
    );
  },
  
  /**
   * Returns an Ext.data.Record for this model
   * This is just created from this.fields and cached to this.record.
   * You can override the default by just setting this.record = YourRecord
   * @return {Ext.data.Record} A record set up with this.fields
   */
  getRecord: function() {
    if (!this.record) {
      this.record = Ext.data.Record.create(this.fields);
    };
    return this.record;
  },
  
  /**
   * Returns an Ext.data.Reader for this model
   * This is generated from the fields config passed in when creating the model
   * Reader is generated once then cached in this.reader.  You can override the default
   * reader by setting this.reader = YourReader
   * @return {Ext.data.Reader} A reader based on this.fields passed when defining the model
   */
  getReader : function() {
    if (!this.reader) {
      this.reader = new Ext.data.JsonReader({root: this.url_name, totalProperty: 'results'}, this.getRecord());
    };
    return this.reader;
  },
  
  collectionStore : function(config) {
    options = Ext.apply({}, config, {
      proxy: new Ext.data.HttpProxy({
        url: this.collectionDataUrl(config),
        method: 'get',
        params: {start: 0, limit: 25}
      }),
      reader: this.getReader(),
      remoteSort: true
    });
    
    var store = new Ext.data.Store(options);
    
    // override the default store.load function to load data through GET rather than POST
    store.load = function(options){
      options = options || {};
      if(this.fireEvent("beforeload", this, options) !== false){
          this.storeOptions(options);
          
          var p = Ext.apply(options.params || {}, this.baseParams);
          if(this.sortInfo && this.remoteSort){
            var pn = this.paramNames;
            p[pn["sort"]] = this.sortInfo.field;
            p[pn["dir"]] = this.sortInfo.direction;
          }
          
          // set the proxy's url with the correct parameters
          this.proxy.conn.url = this.proxy.conn.url.split("?")[0] + "?" + Ext.urlEncode(p);
          
          this.proxy.load(p, this.reader, this.loadRecords, this, options);
          return true;
      } else {
        return false;
      }
    };
    
    return store;
  },
  
  collectionGroupStore : function(config) {
    options = Ext.apply({}, config, {
      proxy: new Ext.data.HttpProxy({
        url: this.collectionDataUrl(config),
        method: 'get',
        params: {start: 0, limit: 25}
      }),
      reader: this.getReader(),
      remoteSort: true
    });
    
    store = new Ext.data.GroupingStore(options);
    
    // override the default store.load function to load data through GET rather than POST
    store.load = function(options){
      options = options || {};
      if(this.fireEvent("beforeload", this, options) !== false){
          this.storeOptions(options);
          
          var p = Ext.apply(options.params || {}, this.baseParams);
          if(this.sortInfo && this.remoteSort){
            var pn = this.paramNames;
            p[pn["sort"]] = this.sortInfo.field;
            p[pn["dir"]]  = this.sortInfo.direction;
          }
          
          // set the proxy's url with the correct parameters
          this.proxy.conn.url = this.proxy.conn.url.split("?")[0] + "?" + Ext.urlEncode(p);
          
          this.proxy.load(p, this.reader, this.loadRecords, this, options);
          return true;
      } else {
        return false;
      }
    };
    
    return store;
  },  
  
  loadFormWithId : function(id, form, storeLoadConfig, storeConfig) {
    var store = this.singleStore({data: {id: id}}, storeConfig);
    store.on('load', function(s, records, options) {
      var record = records[0];
      form.form.loadRecord(record);
    });
    
    store.load(storeLoadConfig);
    
    return store;
  },
  
  loadFormWithRecord : function(rec, form, storeLoadConfig) {
    if (storeLoadConfig === undefined) {storeLoadConfig = {};};
    
    var store = this.singleStore(rec);
    store.on('load', function(s, records, options) {
      var record = records[0];
      form.form.loadRecord(record);
    });
    
    store.load(storeLoadConfig);
    
    return store;
  },
  
  loadFormWithSingletonRecord: function(form, storeLoadConfig) {
    var store = this.singleStore();
    store.on('load', function(s, records, options) {
      var record = records[0];
      form.form.loadRecord(record);
    });
    
    store.load(storeLoadConfig);
    
    return store;
  },
  
  /**
   * Destroys all passed ids by submitting to the batch destroy url
   */
  destroy: function(id, config) {
    var config = config || {};
    var url = this.singleDataUrl(id);
    
    /**
     * FIXME: We shouldn't have to do this.  For some reason it seems to be keeping config.url after the first request,
     * so when deleting a second object it fires to the first url again.  Most strange!
     */
    Ext.apply(config, { url: url });

    var deleteSuccess = "Deleted " + this.human_singular_name;
    var deleteFailure = "Could not delete the " + this.human_singular_name + ", please try again";
    
    Ext.applyIf(config, {
      url:    url,
      method: 'post',
      params: '_method=delete',
      
      success: function() {
        Ext.ux.MVC.NotificationManager.inform(deleteSuccess);
      },
      
      failure: function() {
        Ext.Msg.alert(deleteFailure);
      }
    });
    
    Ext.Ajax.request(config);
  },
  
  /**
   * Intended to be attached to the nodemoved event of a tree
   * Fires off an appropriate AJAX request to update the server's representation of the tree
   * @param {Ext.tree.TreePanel} tree The Ext.tree.TreePanel which fired the event
   * @param {Ext.tree.TreeNode} node The node which has been moved
   * @param {Ext.tree.TreeNode} oldParent The node which used to be the parent of the moved node
   * @param {Ext.tree.TreeNode} oldParent The node is now the parent of the moved node
   * @param {Number} index The index position of the node, relative to its new parent
   */
  moveTreeNode: function(tree, node, oldParent, newParent, index) {
    var human_name = this.human_singular_name;
    
    Ext.Ajax.request({
      method:  'post',
      url:     this.treeReorderUrl({data: {id: node.id}}),
      params:  "parent=" + newParent.id + "&index=" + index,
      
      success: function() {
        Ext.ux.MVC.NotificationManager.inform('The ' + human_name + ' was moved successfully');
      },
      
      failure: function() {
        Ext.Msg.alert('Error moving ' + human_name, 'Something went wrong while moving this ' + human_name + ', please try again');
      }
    });
  },
  
  //eek how horrid!
  newRecord: function() {
    return eval("new " + this.class_name + "Record");
  },
    
  singularize_human_name : function(name) {
    return name.replace(/_/g, " ").titleize();
  },
  
  pluralize_human_name : function(name) {
    return (name + 's').replace(/_/g, " ").titleize();
  },
  
  urlize_name : function(name) {
    return name + 's';
  },
  
  controller_name : function(name) {
    return this.pluralize_human_name(name).replace(/ /g, "")  + "Controller";
  },
  
  classify_name : function(name) {
    return this.singularize_human_name(name).replace(/ /g, "");
  }
};

function treeWithForm(config) {
  var options = {};
  
  Ext.apply(options, config, {
    items: null,
    frame: true,
    autoLoad: true,
    labelAlign: 'left',
    autoScroll: true,
    treeEditable: false,
    treeEditableField: 'title',
    beforeFormLoad: function() {},
    afterFormLoad:  function() {},
    beforeDelete:   function() {},
    afterDelete:    function() {},
    beforeSave:     function() {},
    afterSave:      function() {},
    beforeCreate:   function() {},
    afterCreate:    function() {},
    beforeNew:      function() {},
    afterNew:       function() {}
  });
  
  //local aliases to stop me getting RSI
  human_name = options.model.human_singular_name;
    
  newButton = new defaultAddButton({
    model: options.model,
    text: 'Add a new ' + human_name,
    tooltip: 'Adds a new ' + human_name,
    handler: function() {
      if (options.beforeNew() !== false) {
        var node = (new Ext.tree.TreeNode({
          text: 'Unsaved New ' + human_name,
          allowDrag: false,
          iconCls: options.model.model_name + '_unsaved',
          qtip: 'This ' + human_name + ' has not been saved yet, you need to fill in the form and click "Save Changes" first'
        }));
        
        if (selectionModel.selNode && !(/ynode/.test(selectionModel.selNode.id))) {
          selectionModel.selNode.appendChild(node);
          panel.insertAsChildOf = selectionModel.selNode.id;
        } else {
          tree.root.appendChild(node);
        };
        
        record = options.model.newRecord();
        form.form.reset();
        form.form.loadRecord(record);
        panel.recordId = null;
        
        selectionModel.select(node);        
        options.afterNew();
      };      
    }
  });
  
  deleteButton = new defaultDeleteButton({
    model: options.model,
    text: 'Delete selected ' + human_name,
    tooltip: 'Deletes the selected ' + human_name,
    handler: function() {
      id = selectionModel.getSelectedNode().id;
      
      //beforeDelete callback can cancel delete by returning false
      if (options.beforeDelete() !== false) {
        Ext.Msg.confirm('Delete ' + human_name + '?', 'Are you sure you want to delete this ' + human_name + '?  This cannot be undone', function(btn) {
          if (btn == 'yes') {
            Ext.Ajax.request({
              url: options.model.singleUrl({data: {id: id}}),
              method: 'post',
              params: '_method=delete',
              success: function() {
                Ext.ux.MVC.Flash.flash('The ' + human_name + ' has been successfully deleted', human_name + ' deleted');
                updateTree();
                
                options.afterDelete();
                form.form.reset();
                panel.formLoaded = false;
              },
              failure: function() {
                Ext.Msg.alert(human_name + ' NOT Deleted', 'Something went wrong while deleting this ' + human_name + ', it has NOT been deleted');
              }
            });
          };
        });  
      };    
    }
  });
  
  saveButton = new Ext.Button({
    text: 'Save changes',
    iconCls: 'save',
    handler: function() {
      //return false on beforeSave callback to stop save
      if (options.beforeSave() !== false) {
        
        if (panel.formLoaded) {
          if (panel.recordId == null) {
            
            // this is a NEW form, so post to the appropriate URL
            extra_params = '';
            if (panel.insertAsChildOf != null) { extra_params = "insert_as_child_of=" + panel.insertAsChildOf;};
            
            form.form.submit({
              waitMsg: 'Saving Data...',
              url: '/admin/' + options.model.url_name + '.ext_json',
              params: extra_params,
              failure: function() {
                Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + human_name + ', please see any fields with red icons');
              },
              success: function(formElement, action) {
                if (options.success) {
                  options.success.call(this, action.result, form);
                };
                Ext.ux.MVC.Flash.flash("Your changes have been saved", human_name + ' successfully updated');
                updateTree();
              }
            });
          
          } else {
            // this is an EDIT form
            form.form.submit({
              waitMsg: 'Saving Data...',
              url: '/admin/' + options.model.url_name + '/' + panel.recordId + '.ext_json',
              params: '_method=put',
              failure: function() {
                Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + human_name + ', please see any fields with red icons');
              },
              success: function(formElement, action) {
                if (options.success) {
                  options.success.call(this, action.result, form);
                };
                Ext.ux.MVC.Flash.flash("Your changes have been saved", human_name + ' successfully updated');
              }
            });
          };
          
        } else {
          Ext.Msg.alert('Form Not Loaded', 'Please load the form first by clicking a ' + human_name + ' from the tree');
        };
      };
    }
  });
  
  toolbar = new Ext.Toolbar({
    items: [newButton, '-', deleteButton]
  });
  
  tree = new Ext.tree.TreePanel({
    animate: true,
    autoScroll: true,
    containerScroll: true,
    collapsible: true,
    bodyStyle: 'background-color: #fff; border: 1px solid #99BBE8;',
    enableDD: true,
    region: 'west',
    width: 300,
    split: true,
    minWidth: 200,
    rootVisible: false,
    tbar: toolbar,
    title: options.model.human_plural_name,
    loader: new Ext.tree.TreeLoader({
      requestMethod: 'GET',
      dataUrl: options.model.treeUrl()
    })
  });
  
  treeRootNode = new Ext.tree.AsyncTreeNode({
    text: 'Root',
    draggable: false,
    id: 'source'
  });
  
  tree.setRootNode(treeRootNode);
  
  if (options.treeEditable) {
    editor = new Ext.tree.TreeEditor(tree, {
      allowBlank: false,
      ignoreNoChange: true,
      blankText: 'A title is required',
      selectOnFocus: true
    });
    
    editor.on('complete', function(editor, value, previousValue) {
      id = editor.editNode.attributes.id;
      
      // return false from beforeCreate callback to cancel creation
      if (options.beforeCreate() !== false) {
        if (/ynode/.test(id)) {
          //this is a new object, so do a POST create
          params = options.model.model_name + "[" + options.treeEditableField + "]=" + value;
          if (editor.editNode.parentNode) {
            //tell the server that we should be inserting this node as a child of the passed parent
            params += '&insert_as_child_of=' + editor.editNode.parentNode.id;
          };
          
          Ext.Ajax.request({
            method: 'post',
            url: options.model.collectionUrl(),
            params: params,
            success: options.afterCreate
          });
          
        } else {
          //this is updating an existing object
          Ext.Ajax.request({
            method: 'post',
            url: options.model.singleUrl({data: {id: id}}),
            params: "_method=put&" + options.model.model_name + "[" + options.treeEditableField + "]=" + value,
            success: function() {
              Ext.ux.MVC.Flash.flash('The ' + human_name + ' ' + options.treeEditableField + ' was successfully updated', human_name + ' ' + options.treeEditableField + ' updated');
            },
            failure: function() {
              Ext.Msg.alert(human_name + ' ' + options.treeEditableField + ' NOT updated', 'The ' + options.treeEditableField + ' of this ' + human_name + ' could not be updated - please try again');
            }
          });
        };
      };
    });    
  };
  
  tree.on('movenode', function(tree, node, oldParent, newParent, index) {
    Ext.Ajax.request({
      method: 'post',
      url: options.model.treeReorderUrl({data: {id: node.id}}),
      params: "parent=" + newParent.id + "&index=" + index,
      success: function() {
        Ext.ux.MVC.Flash.flash('The ' + human_name + ' was moved successfully', human_name + ' moved');
      },
      failure: function() {
        Ext.Msg.alert('Error moving ' + human_name, 'Something went wrong while moving this ' + human_name + ', please try again');
      }
    });
  });
  
  selectionModel = tree.getSelectionModel();
  
  tree.getSelectionModel().on('selectionchange', function(node) {
    //if we can't get a reference to the selected node, just return without acting
    if (!node.selNode) {return;};
    
    // ignore no selection || root selection || new node selected (one that has not been saved yet)
    if (selectionModel.getSelectedNode() == null || node.selNode.id == 'source' || (/ynode/).test(node.selNode.id)) {
      //root node is selected, disabled delete
      deleteButton.disable();
      
    } else {
      //a real node is selected, load the data into the form
      id = node.selNode.id;
      options.model.loadFormWithId(id, form, {callback: options.afterFormLoad}, {listeners: {'beforeload': options.beforeFormLoad}});
      
      //enable the delete and save buttons
      deleteButton.enable();
      saveButton.enable();
      
      panel.formLoaded = true;
      panel.recordId   = id;
    };
  });
  
  function updateTree() {
    treeRootNode.reload();
    deleteButton.disable();
  };
  
  form = new defaultEditForm({
    region: 'center',
    addDefaultButtons: false,
    model: options.model,
    items: options.items
  });
  
  form.addButton(saveButton);
  
  panel = new Ext.Panel({
    frame: true,
    layout: 'border',
    items: [tree, form]
  });
  
  //used by the save button to determine whether or not the form is currently loaded
  panel.formLoaded = false;
  
  //keep a reference of the ID currently loaded in the form (null if this is a new record)
  panel.recordId = null;
  
  panel.insertAsChildOf = null;
  
  return panel;
};

/**
 * Ext.ux.MVC.view.AutoCompleteComboBox
 * @extends Ext.form.ComboBox
 */
Ext.ux.MVC.view.AutoCompleteComboBox = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    name: config.model.model_name + '[' + config.id +']',
    fieldLabel: config.id,
    displayField: config.id,
    mode: 'local',
    selectOnFocus: true,
    typeAhead: true,
    triggerAction: 'all',
    autoLoad: true
  });
  
  Ext.ux.MVC.view.AutoCompleteComboBox.superclass.constructor.call(this, config);
  
  if (config.autoLoad) {
    this.store.load();
  };
};
Ext.extend(Ext.ux.MVC.view.AutoCompleteComboBox, Ext.form.ComboBox);
Ext.reg('autocomplete_combo_box', Ext.ux.MVC.view.AutoCompleteComboBox);

/**
 * Ext.ux.MVC.view.DefaultEditForm
 * @extends Ext.FormPanel
 * Provides a sensible default edit panel for any model
 */
Ext.ux.MVC.view.DefaultEditForm = function(config) {
  var config = config || {};
  if (!config.model) {alert("No model provided to the DefaultEditForm"); return false;};
  
  //set some sensible default properties
  Ext.applyIf(config, {
    frame: true,
    iconCls: 'form_edit',
    changeDocumentTitle: true,
    title: 'Edit ' + config.model.human_singular_name,
    autoScroll: true,
    autoLoadForm: true,
    bodyStyle: 'position: relative', //fixes an IE bug where scrolling forms go nuts
    labelAlign: 'top',
    addDefaultButtons: true,
    addPutMethodField: true //automatically adds a field called '_method' with value 'PUT'
  });
  
  if (config.addPutMethodField) {
    config.items = [{ xtype: 'hidden', name: '_method', value: 'put'}].concat(config.items);
  };
  
  if (config.changeDocumentTitle) {
    document.title = "Edit " + config.model.human_singular_name;
  };
  
  //set what to do on Save or Cancel
  Ext.applyIf(config, {
    cancelAction: function() {config.editNext();},
    saveAction: function() {
      //TODO: this should NOT be here
      //trigger any Tiny MCE instances to save first
      try {
        tinymce.EditorManager.triggerSave();
      } catch(e) {}
      
      ids = Ext.ux.MVC.params[":id"].split(",");
      
      this.form.submit({
        waitMsg: 'Saving Data...',
        url: config.model.singleDataUrl(ids[0]),
        failure: function() {
          Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + config.model.human_singular_name + ', please see any fields with red icons');
        },
        success: function(formElement, action) {
          if (config.success) {
            config.success.call(this, action.result, form);
          };
          Ext.ux.MVC.Flash.flash("Your changes have been saved", config.model.human_singular_name + ' successfully updated');
          config.editNext();
        }
      });
    },
    editNext: function() {
      ids = Ext.ux.MVC.params[":id"].split(",");
      current_id = ids.shift();
      
      if (ids instanceof Array && ids.length > 0) {
        // edit the next item
        Ext.History.add(this.model.editUrl(ids.join(",")));
      } else {
        if (this.model.parent_model) {
          //try to go back to the parent's grid edit page, else go back to parent's grid
          if (parent_id = Ext.ux.MVC.params[this.model.parent_model.parametized_foreign_key_name]) {
             Ext.History.add(this.model.parent_model.editUrl(parent_id));
          } else {
             Ext.History.add(this.model.parent_model.collectionUrl());
          };
        } else {
          // view this model's index
          Ext.History.add(this.model.collectionUrl());
        }
      }
    },
    handleKeypress : function(ev) {
      if(ev.getKey() == Ext.EventObject.ESC) {
        config.cancelAction();
        ev.stopEvent();
      } else if (ev.ctrlKey) {
        var keyNum = ev.getCharCode();
        switch (keyNum) {
          case 115: config.saveAction(); ev.stopEvent(); //CTRL + s
        }
      }
    }
  });
  
  Ext.ux.MVC.view.DefaultEditForm.superclass.constructor.call(this, config);
  
  if (config.addDefaultButtons) {
    this.saveButton = new Ext.Button({
      text: 'Save',
      iconCls: 'save',
      scope: this,
      handler: config.saveAction,
      tooltip: 'Saves this ' + config.model.human_singular_name + ' (keyboard shortcut: CTRL + s)'
    });
    
    this.cancelButton = new Ext.Button({
      text: 'Cancel', 
      iconCls: 'cancel',
      handler: config.cancelAction, 
      tooltip: 'Keyboard shortcut: ESC'
    });
    
    this.addButton(this.saveButton);
    this.addButton(this.cancelButton);  
  };
  
  //load the record into the form
  if (config.autoLoadForm) {
    config.model.loadFormWithId(config.ids[0], this);
  };
};
Ext.extend(Ext.ux.MVC.view.DefaultEditForm, Ext.FormPanel);
Ext.reg('default_new_form', Ext.ux.MVC.view.DefaultEditForm);

/**
 * Ext.ux.MVC.view.DefaultNewForm
 * @extends Ext.FormPanel
 * Provides a sensible default for a form which creates a new object for any type of model
 */
Ext.ux.MVC.view.DefaultNewForm = function(config) {
  var config = config || {};
  if (!config.model) {alert("No model provided to the DefaultNewForm"); return false;};
  
  //keep a local reference to the model's human_singular name to save my fingers
  var singular = config.model.human_singular_name;
  
  //set some sensible defaults
  Ext.applyIf(config, {
    frame: true,
    changeDocumentTitle: true,
    labelAlign: 'top',
    autoScroll: true,
    bodyStyle: 'position: relative;', //fixes an IE bug where scrolling forms go nuts
    iconCls: 'form_new',
    title: 'New ' + singular,
    url: config.model.collectionDataUrl(config)
  });
  
  Ext.ux.MVC.view.DefaultNewForm.superclass.constructor.call(this, config);
  
  if (config.changeDocumentTitle) {
    document.title = "New " + config.model.human_singular_name;
  };
    
  //set some more sensible defaults, and what to do on save and cancel
  Ext.applyIf(config, {
    cancelAction: function() {
      if (config.model.parent_model) {
        //TODO: this probably isn't guaranteed to work all of the time
        // show the edit page for this model's parent (by going back)
        Ext.History.back();
      } else {
        // show this model's index grid
        Ext.History.add(config.model.collectionUrl());
      };
    },
    saveAction: function() {
      //trigger any Tiny MCE instances to save first
      try {
        tinymce.EditorManager.triggerSave();
      } catch(e) {}
      
      this.form.submit({
        url: config.url, 
        waitMsg: 'Saving Data...',
        failure: function() {
          Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + singular + ', please see any fields with red icons');
        },
        success: function(formElement, action) {
          Ext.ux.MVC.Flash.flash('The ' + singular + ' was created successfully', singular + ' Created');
          if (config.afterSave) {
            config.afterSave.call(this, action.result, form);
          } else {
            config.cancelAction();
          };
        }
      });
    }
  });
  
  this.addButton({
    text: 'Save',
    iconCls: 'save',
    scope: this,
    handler: config.saveAction,
    tooltip: 'Saves this ' + singular + ' (keyboard shortcut: CTRL + s)'
  }); 
     
  this.addButton({
    text: 'Cancel', 
    iconCls: 'cancel', 
    handler: config.cancelAction, 
    tooltip: 'Keyboard shortcut: ESC'
  });
  
  this.handleKeypress = function(ev) {
    if(ev.getKey() == Ext.EventObject.ESC) {
      config.cancelAction();
      ev.stopEvent();
    } else if (ev.ctrlKey) {
      var keyNum = ev.getCharCode();
      switch (keyNum) {
        case 115: config.saveAction(); //CTRL + s
        
        ev.stopEvent();
      }
    }
  };
  
};
Ext.extend(Ext.ux.MVC.view.DefaultNewForm, Ext.FormPanel);
Ext.reg('default_new_form', Ext.ux.MVC.view.DefaultNewForm);

/**
 * Ext.ux.MVC.view.DefaultSingletonForm
 * @extends Ext.FormPanel
 * Provides a sensible default for any singleton model (e.g. Account - there is only one Account)
 */
Ext.ux.MVC.view.DefaultSingletonForm = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    items: null,
    frame: true,
    changeDocumentTitle: true,
    labelAlign: 'left',
    autoScroll: true,
    autoLoadForm: true,
    iconCls: 'form_new',
    bodyStyle: 'position: relative'
  });
  
  Ext.applyIf(config, {
    url: config.model.singleDataUrl(config),
    title: 'Edit ' + config.model.human_singular_name
  });
  
  Ext.ux.MVC.view.DefaultSingletonForm.superclass.constructor.call(this, config);
  
  
  if (config.changeDocumentTitle) {
    document.title = "Edit the " + config.model.human_singular_name;
  };
  
  Ext.applyIf(config, {
    saveAction: function() {
      this.form.submit({
        url: config.model.singleDataUrl,
        waitMsg: 'Saving Data...',
        failure: function() {
          Ext.Msg.alert('Operation Failed', 'There were errors saving the ' + config.model.human_singular_name + ', please see any fields with red icons');
        },
        success: function(formElement, action) {
          Ext.ux.MVC.Flash.flash('The ' + config.model.human_singular_name + ' was updated successfully', config.model.human_singular_name + ' Updated');
          if (config.success) {
            config.success.call(this, action.result, form);
          };
        }
      });
    }
  });
  
  this.addButton({
    text: 'Save',
    iconCls: 'save',
    scope: this,
    handler: config.saveAction,
    tooltip: 'Saves this ' + config.model.human_singular_name + ' (keyboard shortcut: CTRL + s)'
  });
  
  this.handleKeypress = function(ev) {
    if (ev.ctrlKey) {
      var keyNum = ev.getCharCode();
      switch (keyNum) {
        case 115: config.saveAction(); //CTRL + s
        
        ev.stopEvent();
      }
    }
  };
  
  if (config.autoLoadForm) {
    config.model.loadFormWithSingletonRecord(this);
  };
};
Ext.extend(Ext.ux.MVC.view.DefaultSingletonForm, Ext.FormPanel);
Ext.reg('default_singleton_form', Ext.ux.MVC.view.DefaultSingletonForm);

/**
 * Ext.ux.MVC.view.FlaggedTextField
 * @extends Ext.view.TextField
 * Provides a button next to each form field to flag as inappropriate
 */
Ext.ux.MVC.view.FlaggedTextField = function(config) {
  var config = config || {};
  var panel_config = {};
  var textfield_config = {};
  Ext.apply(textfield_config, {xtype: 'textfield'}, config);
    
  this.flagButton = new Ext.Button({
    iconCls: 'flag_yellow',
    style: 'padding-top: 18px;',
    tooltip: "Click to flag this field as inappropriate",
    scope: this,
    handler: function() {
      window_config = {
        field_id: textfield_config.id,
        fieldLabel: textfield_config.fieldLabel,
        flaggedTextField: this
      };
      this.win = new Ext.ux.MVC.FlaggedTextFieldWindow(window_config);
      this.win.show();
    }
  });
  
  this.textField = new Ext.form.TextField(textfield_config);
  
  Ext.apply(panel_config, {
    layout: 'form',
    items: [
      {
        layout: 'column',
        items: [
          {
            columnWidth: .85,
            layout: 'form',
            items: [
              this.textField
            ]
          },
          {
            columnWidth: .15,
            layout: 'form',
            items: [
              this.flagButton
            ]
          }
        ]
      }
    ]
  });
  
  //call this after data have been loaded - this changes the button's appearance
  /**
   * Call this with the record that has been loaded into the form.  If there is a profile_review
   * matching this field, change the flag from yellow to red.  Otherwise turn to green.
   * 
   * TODO: This is far too implementation specific, refactor to provide some way of providing this logic in config
   */
  this.updateFlag = function(record) {
    //set to green once data have been loaded.  Set to red if appropriate below
    this.flagButton.setIconClass('flag_green');
    
    //if there is a profile review for this field, colour the flag red
    pr = record.data.profile_reviews;
    for (var i = pr.length - 1; i >= 0; i--){
      if (pr[i].field == textfield_config.id) {
        this.setFlagColour('red');
      };
    };
    
  };
  
  this.setFlagColour = function(colour) {
    this.flagButton.setIconClass('flag_' + colour);
  };
  
  Ext.ux.MVC.view.FlaggedTextField.superclass.constructor.call(this, panel_config);
};
Ext.extend(Ext.ux.MVC.view.FlaggedTextField, Ext.Panel);
Ext.reg('flagged_textfield', Ext.ux.MVC.view.FlaggedTextField);


/**
 * Ext.ux.MVC.FlaggedTextFieldWindow
 * @extends Ext.Window
 * Popup window used to gather flagging information.  Intended for use with a Ext.ux.MVC.FlaggedTextField
 */
Ext.ux.MVC.FlaggedTextFieldWindow = function(config) {
  var config = config || {};
  
  //find the current flag text if it exists
  flagText = ILF.flaggedFields[config.field_id];
  
  this.flagForm = new Ext.form.FormPanel({
    bodyStyle: 'background-color: #dfe8f6; padding: 15px',
    labelAlign: 'top',
    items: [
      {
        xtype: 'label',
        text: 'Field to flag: ' + config.fieldLabel
      },
      {
        xtype: 'textarea',
        fieldLabel: 'Reason',
        anchor: "100% 80%",
        id: config.field_id + "_flag_message",
        value: flagText
      }
    ],
    buttons: [
      {
        text: 'Mark as OK',
        iconCls: 'flag_green',
        scope: this,
        handler: function() {
          //all flagged fields are stored here before form submission
          f = ILF.flaggedFields;
          
          //unset the flag on this field.  Need to create a new object here
          //as setting to null still keeps a track of the flag instead of removing it
          newObject = {};
          for (field in f) {
            if (field != config.field_id) {
              newObject[field] = f[field];
            };
          };
          ILF.flaggedFields = newObject;
          
          //set the button's flag colour
          config.flaggedTextField.setFlagColour('green');
          
          //notify the user that they need to save the record
          Ext.ux.MVC.Flash.flash("The field has been unflagged, don't forget to save the form for changes to take effect", "Flag unset");
          this.window.close();
        }
      },
      {
        text: 'Mark as Flagged',
        iconCls: 'flag_red',
        scope: this,
        handler: function() {
          //all flagged fields are stored here before form submission
          f = ILF.flaggedFields;
          
          //set the flagged field for this field's ID to the message in the box above
          f[config.field_id] = Ext.getCmp(config.field_id + '_flag_message').getValue();
          
          //set the button's flag colour
          config.flaggedTextField.setFlagColour('red');
          
          //notify the user that they need to save the record
          Ext.ux.MVC.Flash.flash("The field has been marked as flagged, don't forget to save the form for changes to take effect", "Flag set");
          
          //close the window
          this.window.close();
        }
      }
    ]
  });
  
  Ext.applyIf(config, {
    title: 'Flag as inappropriate',
    // closeAction: 'hide',
    layout: 'fit',
    minHeight: 300,
    minWidth: 400,
    height: 300,
    width: 400,
    items: [
      this.flagForm
    ],
    modal: true
  });
  
  Ext.ux.MVC.FlaggedTextFieldWindow.superclass.constructor.call(this, config);
  
  this.window = this;
};
Ext.extend(Ext.ux.MVC.FlaggedTextFieldWindow, Ext.Window);

/**
 * Ext.ux.MVC.view.LiveSearchComboBox
 * @extends Ext.form.ComboBox
 * Provides a combo box with live search
 */
Ext.ux.MVC.view.LiveSearchComboBox = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    typeAhead: false,
    loadingText: 'Searching...',
    pageSize: 10,
    anchor: "95%",
    autoLoad: true,
    minChars: 2
  });
  
  Ext.ux.MVC.view.LiveSearchComboBox.superclass.constructor.call(this, config);
  
  //FIXME: For some reason passing 'this' as scope to the store.on('load') function below
  //screws everything up.  The first time the combo is rendered it's fine, but subsequent times
  //seem to maintain a reference to 'this', and use the same getValue() result every time
  tempCombo = this;

  this.store.on('load', function(store, records, index) {
    tempCombo.setValue(tempCombo.getValue());
  });
  
  if (config.autoLoad) {
    tempCombo.store.load();
  };
};
Ext.extend(Ext.ux.MVC.view.LiveSearchComboBox, Ext.form.ComboBox);
Ext.reg('live_search_combo_box', Ext.ux.MVC.view.LiveSearchComboBox);

/**
 * Ext.ux.MVC.view.LocalComboBox
 * @extends Ext.form.ComboBox
 * @cfg {Ext.ux.MVC.model.Base} model The model to attach the combo box to
 * @cfg {Int} id The id of the field to attach the combo box to
 * @cfg {Ext.data.Store} The store to take combobox values from
 *
 * Example Usage:
 * <pre><code>
new Ext.ux.MVC.view.LocalComboBox({
  model: Page,
  id: 'section_id',
  store: someStore
})

Is equivalent to:
new Ext.form.ComboBox({
  mode: local,
  store: someStore,
  id: 'section_id',
  name: 'page[section_id],
  hiddenName: 'page[section_id]',
  displayField: 'human_name',
  valueField: 'class_name',
  fieldLabel: 'section_id',
  forceSelection: true,
  triggerAction: 'all',
  anchor: "95%"
})
</code></pre>
*/
Ext.ux.MVC.view.LocalComboBox = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    mode: 'local',
    displayField: 'human_name',
    valueField: 'class_name',
    triggerAction: 'all',
    forceSelection: true,
    anchor: "95%"
  });
  
  Ext.applyIf(config, {
    name: config.model.model_name + '[' + config.id + ']',
    hiddenName: config.model.model_name + '[' + config.id + ']',
    fieldLabel: config.id
  });
  
  Ext.ux.MVC.view.LocalComboBox.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.view.LocalComboBox, Ext.form.ComboBox);
Ext.reg('local_combo_box', Ext.ux.MVC.view.LocalComboBox);

/**
 * Ext.ux.MVC.DefaultAddButton
 * Simple set of sensible defaults for an Add button - just sets an iconCls and text
 * @extends Ext.Toolbar.Button
 * @cfg {Ext.ux.MVC.model} model The model this button is for (optional - used for tooltip)
 */
Ext.ux.MVC.DefaultAddButton = function(config) {
  var config = config || {};
  
  if (!config.handler) {
    throw new Error("You must supply a handler to DefaultAddButton");
  };
  
  Ext.applyIf(config, {
    iconCls: 'add',
    text:    'Add'
  });
  
  if (config.model) {
    Ext.applyIf(config, {
      tooltip: 'Shows new ' + config.model.human_singular_name + ' form (shortcut key: a)'
    });
  };
  
  Ext.ux.MVC.DefaultAddButton.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.DefaultAddButton, Ext.Toolbar.Button);
Ext.reg('default_add_button', Ext.ux.MVC.DefaultAddButton);

/**
 * Ext.ux.MVC.DefaultCSVExportButton
 * @extends Ext.Toolbar.Button
 * Simple set of sensible defaults for a CSV Export button
 * @cfg {Ext.ux.MVC.model} model The model this button is for (optional - used for tooltip)
 */
Ext.ux.MVC.DefaultCSVExportButton = function(config) {
  var config = config || {};
  
  if (!config.model) {
    throw new Error("You must supply a model to DefaultDeleteButton");
  };
  
  Ext.applyIf(config, {
    text: 'Export as CSV',
    iconCls: 'page_white_excel'
  });
  
  if (config.model) {
    var model_name = config.model.human_plural_name;
    
    Ext.applyIf(config, {
      tooltip: 'Export all selected ' + model_name + ' to a CSV file.  If no ' + model_name + ' are selected, all will be exported to a single file.'
    });    
  };
  
  Ext.ux.MVC.DefaultCSVExportButton.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.DefaultCSVExportButton, Ext.Toolbar.Button);
Ext.reg('default_csv_export_button', Ext.ux.MVC.DefaultCSVExportButton);

/**
 * Ext.ux.MVC.DefaultDeleteButton
 * Simple set of sensible defaults for a Delete Button
 * @extends Ext.Toolbar.Button
 * @cfg {Ext.ux.MVC.model} model The model this button is for (optional - used for tooltip)
 */
Ext.ux.MVC.DefaultDeleteButton = function(config) {
  var config = config || {};
  
  if (!config.handler) {
    throw new Error("You must supply a handler to DefaultDeleteButton");
  };
  
  Ext.applyIf(config, {
    iconCls:  'delete',
    text:     'Delete',
    disabled: true
  });
  
  if (config.model) {
    Ext.applyIf(config, {
      tooltip: 'Deletes all selected ' + config.model.human_plural_name + ' (shortcut key: Delete)'
    });    
  };
  
  Ext.ux.MVC.DefaultDeleteButton.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.DefaultDeleteButton, Ext.Toolbar.Button);
Ext.reg('default_delete_button', Ext.ux.MVC.DefaultDeleteButton);

/**
 * Ext.ux.MVC.DefaultEditButton
 * Simple set of sensible defaults for an Edit Button
 * @extends Ext.Toolbar.Button
 * @cfg {Ext.ux.MVC.model} model The model this button is for (optional - used for tooltip)
 */
Ext.ux.MVC.DefaultEditButton = function(config) {
  var config = config || {};
  
  if (!config.handler) {
    throw new Error("You must supply a handler to DefaultEditButton");
  };
  
  Ext.applyIf(config, {
    iconCls:  'edit',
    text:     'Edit',
    disabled: true
  });
  
  if (config.model) {
    Ext.applyIf(config, {
      tooltip: 'Edits all selected ' + config.model.human_plural_name + ' (shortcut key: e)'
    });
  };
  
  Ext.ux.MVC.DefaultEditButton.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.DefaultEditButton, Ext.Toolbar.Button);
Ext.reg('default_edit_button', Ext.ux.MVC.DefaultEditButton);

/**
 * Ext.ux.MVC.DefaultGridTopToolbar
 * @extends Ext.Toolbar
 * Default toolbar providing customisable Add, Edit, Delete and CSV Export buttons
 */
Ext.ux.MVC.DefaultGridTopToolbar = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    items:       [],
    itemsBefore: [],
    itemsAfter:  [],
    
    hasSearchField:     true,
    hasAddButton:       true,
    hasEditButton:      true,
    hasDeleteButton:    true,
    hasCSVExportButton: false,
    
    searchFieldConfig:  {},
    addButtonConfig:    {},
    editButtonConfig:   {},
    deleteButtonConfig: {},
    csvButtonConfig:    {},
    
    addButtonHandler:    Ext.emptyFn,
    editButtonHandler:   Ext.emptyFn,
    deleteButtonHandler: Ext.emptyFn,
    csvButtonHandler:    Ext.emptyFn
  });
  
  var items = config.itemsBefore;
  
  if (config.hasSearchField) {
    Ext.applyIf(config.searchFieldConfig, {
      width: 200,
      label: 'Search by Name:',
      enableKeyEvents: true
    });
    
    this.searchField = new Ext.app.SearchField(config.searchFieldConfig);
    items = items.concat([config.searchFieldConfig.label, ' ', this.searchField]);
  };
  
  if (config.hasAddButton) {
    this.addButton = new Ext.ux.MVC.DefaultAddButton(Ext.apply(config.addButtonConfig, {
      model:   config.model,
      handler: config.addButtonHandler
    }));
    
    items = items.concat(['-', this.addButton]);
  };
  
  if (config.hasEditButton) {
    this.editButton = new Ext.ux.MVC.DefaultEditButton(Ext.apply(config.editButtonConfig, {
      model:   config.model,
      handler: config.editButtonHandler
    }));
    
    items = items.concat(['-', this.editButton]);
  };
  
  if (config.hasDeleteButton) {
    this.deleteButton = new Ext.ux.MVC.DefaultDeleteButton(Ext.apply(config.deleteButtonConfig, {
      model:   config.model,
      handler: config.deleteButtonHandler
    }));
    
    items = items.concat(['-', this.deleteButton]);
  };
  
  if (config.hasCsvExportButton) {
    this.csvExportButton = new Ext.ux.MVC.DefaultCSVExportButton(Ext.apply(config.csvButtonConfig, {
      model:   config.model,
      handler: config.csvButtonHandler
    }));
    
    items = items.concat(['-', this.csvExportButton]);
  };
  
  items = items.concat(config.itemsAfter);
  config.items = items;
  
  /**
   * Adds handlers to grid events.  Call this after rendering the parent grid
   */
  this.setupHandlers = function() {
    this.ownerCt.getSelectionModel().on('selectionchange', function(selModel){
      if (selModel.selections.length == 0) {
        this.editButton.disable();
        this.deleteButton.disable();
      } else {
        this.editButton.enable();
        this.deleteButton.enable();
      }
    }, this);
    
    if (this.searchField) {
      //we can't get hold of the grid's store when creating the search field, so must
      //link them together now that everything has been rendered
      this.searchField.store = this.ownerCt.store;
      
      //we also need to stop any key events from propagating up the chain as they may
      //interfere with parent containers' key events
      this.searchField.on('keydown', function(f, e) { e.stopPropagation();});
    };
  };
  
  Ext.ux.MVC.DefaultGridTopToolbar.superclass.constructor.call(this, config);
  
};
Ext.extend(Ext.ux.MVC.DefaultGridTopToolbar, Ext.Toolbar);
Ext.reg('default_grid_top_toolbar', Ext.ux.MVC.DefaultGridTopToolbar);

/**
 * Ext.ux.MVC.view.DefaultPagingGrid
 * @extends Ext.grid.GridPanel
 * Provides a simple default paging grid for any model
 */
Ext.ux.MVC.view.DefaultPagingGrid = function(config) {
  var config = config || {};
  if (config.model == null) {alert("Error - no Model supplied to DefaultPagingGrid"); return false;};
  
  //set a few default properties
  Ext.applyIf(config, {
    viewConfig: {forceFit: true},
    changeDocumentTitle: true,
    tbar: null,
    autoLoadStore: true,
    headings: [],
    clicksToEdit: 1,
    loadMask: true
  });
  
  //set default actions if they are not supplied
  Ext.applyIf(config, {
    iconCls: 'grid_list',
    id: config.model.url_name + '_index',
    store: config.model.collectionStore(),
    saveEditAction: function(event) {
      var record = event.record;
      var field  = event.field;
      var value  = event.value;
      
      Ext.Ajax.request({
        url: config.model.singleDataUrl(record),
        method: 'post',
        params: "_method=put&" + config.model.underscore_name + "[" + field + "]=" + value,
        success: function() {
          //removes the red tick from the cell once the change has been saved
          record.commit();
        },
        failure: function() {
          Ext.Msg.alert(config.model.human_singular_name + ' NOT Updated', 'Something went wrong when trying to update this ' + config.model.human_singular_name + ' - please try again');
        }
      });
    }
  });
  
  this.store = config.store;
  
  this.sm = config.sm = new Ext.grid.CheckboxSelectionModel();
  this.columnModel = new Ext.grid.ColumnModel([this.sm].concat(config.headings));
  
  this.columnModel.defaultSortable = true;
  this.columnModel.defaultWidth = 160;

  config.filters = new Ext.ux.grid.GridFilters({filters: config.headings});
  config.bbar = new Ext.ux.MVC.DefaultPagingToolbar({store: config.store, model: config.model});
  config.plugins = [config.bbar, config.filters];
  config.cm = this.columnModel;

  config.controller = null; //application.getControllerByName(config.model.controller_name);
  
  //set up key handlers
  //TODO: need a more elegant way of overriding/disabling this
  this.handleKeypress = function(e) {
    if (config.searchField.hasFocus) { return false;};
    if(e.getKey() == Ext.EventObject.DELETE) {
      config.deleteAction();
    } else {
      var keyNum = e.getCharCode();
      switch (keyNum) {
        case 97: //a
          config.newAction();
          break;
        case 101: //e
          config.editAction();
          break;
        case 110: //n
          config.controller.nextPage(config.store);
          break;
        case 112: //p
          config.controller.previousPage(config.store);
          break;
        case 113:
          config.toggleEditableAction(config);
          break;
        case 114: //r
          config.store.reload();
          break;
        case 102: //f
          config.controller.firstPage(config.store);
          break;
        case 108: //l
          config.controller.lastPage(config.store);
          break;
        case 115: //s
          Ext.get(config.searchField.id).focus();
          break;
      }
    };
  };
  
  Ext.ux.MVC.view.DefaultPagingGrid.superclass.constructor.call(this, config);
  
  if (config.changeDocumentTitle) {
    document.title = "View " + config.model.human_plural_name;
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
  
};
Ext.extend(Ext.ux.MVC.view.DefaultPagingGrid, Ext.grid.GridPanel);
Ext.reg('default_paging_grid', Ext.ux.MVC.view.DefaultPagingGrid);


/**
 * Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar
 * @extends Ext.ux.MVC.view.DefaultPagingGrid
 * Provides a fully featured searchable, paginated grid for any model
 */
Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar = function(config) {
  var config = config || {};
  
  if (!config.model) {
    alert("You didn't provide a model in your Default Paging Grid With Top Toolbar class");
    return false;
  };
  
  // Set some default properties...
  Ext.applyIf(config, {
    editable: false,
    topToolbarButtonsBefore: [],
    topToolbarButtonsAfter: [],
    displaySearchByName: true,
    displayAddButton: true,
    displayEditButton: true,
    displayDeleteButton: true,
    displayCSVExportButton: true
  });
  
  //add default actions if they are not passed in constructor config
  Ext.applyIf(config, {
    toggleEditableAction : function(opts) {
      opts.editable = !opts.editable;
      controller = application.getControllerByName(config.model.controller_name);
      controller.viewIndex(opts);
    },
    
    newAction : function() {
      Ext.History.add(this.model.newUrl());
    },
    
    editAction : function() {
      var ids = new Array();
      selections = this.getSelectionModel().getSelections();
      for (var i=0; i < selections.length; i++) {
        ids.push(selections[i].data.id);
      };
      
      Ext.History.add(config.model.editUrl(ids.join(",")));
    },
    
    deleteAction : function() {
      controller = application.getControllerByName(config.model.controller_name);
      controller.deleteSelected(this);
    }
  });
    
  //set up the top toolbar
  var topToolbarButtons = [];
  if (config.displaySearchByName) {
    config.searchField = new Ext.app.SearchField({store: this.store, width:220});
    topToolbarButtons = topToolbarButtons.concat(['Search by Name:', ' ', config.searchField]);
  };

  topToolbarButtons = topToolbarButtons.concat(config.topToolbarButtonsBefore);
  if (config.displayAddButton) {
    this.addButton = new Ext.ux.MVC.DefaultAddButton({
      model: config.model, 
      handler: config.newAction
    });
    
    topToolbarButtons = topToolbarButtons.concat(['-', this.addButton]);
  };
  
  if (config.displayEditButton) {
    this.editButton = new Ext.ux.MVC.DefaultEditButton({
      model: config.model,
      handler: config.editAction,
      scope: this
    });
    
    topToolbarButtons = topToolbarButtons.concat(['-', this.editButton]);
  };
  
  if (config.displayDeleteButton) {
    this.deleteButton = new Ext.ux.MVC.DefaultDeleteButton({
      model: config.model,
      handler: config.deleteAction,
      scope: this
    });
    
    topToolbarButtons = topToolbarButtons.concat(['-', this.deleteButton]);
  };
  
  if (config.displayCSVExportButton) {
    this.csvExportButton = new Ext.ux.MVC.DefaultCSVExportButton({
      xtype: 'default_csv_export_button',
      model: config.model,
      scope: this
    });
    
    topToolbarButtons = topToolbarButtons.concat(['-', this.csvExportButton]);
  };

  topToolbarButtons = topToolbarButtons.concat(config.topToolbarButtonsAfter);
  config.tbar = new Ext.Toolbar({ items: topToolbarButtons });
  
  Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar.superclass.constructor.call(this, config);
  
  //this.store is only instantiated after calling the constructor, so need to give it a reference here
  //TODO: This smells, there is probably a better way
  if (config.displaySearchByName) {
    config.searchField.store = this.store;
  };
  
  this.on('rowdblclick', config.editAction);
  
  this.getSelectionModel().on('selectionchange', function(selModel){
    if (selModel.selections.length == 0) {
      this.editButton.disable();
      this.deleteButton.disable();
    } else {
      this.editButton.enable();
      this.deleteButton.enable();
    }
  }, this); 
};
Ext.extend(Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar, Ext.ux.MVC.view.DefaultPagingGrid);
Ext.reg('default_paging_grid_with_top_toolbar', Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar);

/**
 * Ext.ux.MVC.DefaultPagingToolbar
 * @extends Ext.PagingToolbar
 * Gives a simple default paging toolbar for a given model:
 * e.g. myToolbar = new Ext.ux.MVC.DefaultPagingToolbar({model: MyModel})
 */
Ext.ux.MVC.DefaultPagingToolbar = function(config) {
  var config = config || {};
  
  if (!config.model) {
    throw new Error("You must supply a model to the DefaultPagingToolbar");
  };
  
  Ext.applyIf(config, {
    pageSize:    25,
    nextText:    'Next Page (shortcut key: n)',
    prevText:    'Previous Page (shortcut key: p)',
    refreshText: 'Refresh (shortcut key: r)',
    firstText:   'First Page (shortcut key: f)',
    lastText:    'Last Page (shortcut key: l)',
    displayInfo: true,
    store:       config.model.collectionStore(),
    items:       [new Ext.Toolbar.Fill()],
    displayMsg:  'Displaying ' + config.model.human_plural_name + ' {0} - {1} of {2}',
    emptyMsg:    'No ' + config.model.human_plural_name + ' to display'
  });
  
  Ext.ux.MVC.DefaultPagingToolbar.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.DefaultPagingToolbar, Ext.PagingToolbar);
Ext.reg('default_paging_toolbar', Ext.ux.MVC.DefaultPagingToolbar);

/**
 * Ext.ux.MVC.view.HabtmGrid
 * @extends Ext.grid.GridPanel
 * @cfg {Ext.ux.MVC.model.Base} model The model you want to associate from with habtm
 * @cfg {Ext.ux.MVC.model.Base} habtm_model The model you want to assocate with the model
 * @cfg {String} form_field_id The id of the hidden field to create which store the comma separated values
 * Provides support for Has and Belongs to Many associations (many to many relationships)
 * between any two models.  The grid will load the a collection of habtm_model with tick
 * boxes by each row.  A hidden form field is maintained with a comma separated list of
 * the ticked boxes, and is updated each time a row is ticked or unticked
 */
Ext.ux.MVC.view.HabtmGrid = function(config) {
  var config = config || {};
  if (!config.model)       {alert("You didn't provide a model to your HABTM Grid class"); return false; };
  if (!config.habtm_model) {alert("You didn't provide a habtm_model to your HABTM Grid class"); return false; };
  
  this.selectionModel = new Ext.grid.CheckboxSelectionModel();
  
  Ext.applyIf(config, {
    store: config.habtm_model.collectionStore(),
    title: config.habtm_model.human_plural_name,
    height: 400,
    loadMask: true,
    viewConfig: {forceFit: true},
    sm: this.selectionModel,
    columns: [this.selectionModel].concat(config.headings),
    autoLoadStore: false,
    id: config.model.model_name + '_habtm_' + config.habtm_model.model_name + '_grid'
  });
  
  Ext.ux.MVC.view.HabtmGrid.superclass.constructor.call(this, config);
  
  //updates the form_field_id's rawValue whenever rows are selected/deselected
  function updateFormField(selModel) {
    records = selModel.getSelections();
    
    //build an array of the IDs of the ticked rows
    ids = new Array();
    for (var i = records.length - 1; i >= 0; i--){
      ids.push(records[i].data.id);
    };
    
    //update the form field's rawValue
    Ext.getCmp(config.form_field_id).setRawValue(ids.join(","));
  };
  
  this.selectionModel.on('rowselect', updateFormField);
  this.selectionModel.on('rowdeselect', updateFormField);
  
  //callback to tick the relevant boxes after a set of data is loaded
  config.store.on('load', function(store) {
    //grab an array of the IDs which should be ticked
    ids = Ext.getCmp(config.form_field_id).getRawValue().split(",");
    records = store.data.items;
    selected_records = new Array();
    
    //must suspend events to stop this automatically updating the hidden field
    this.selectionModel.suspendEvents();
    
    //TODO: this is pretty gruesome
    // find an array of all records in the grid which should be ticked
    for (var i = records.length - 1; i >= 0; i--){
      for (var j = ids.length - 1; j >= 0; j--){
        if (ids[j] == records[i].data.id) {
          selected_records.push(records[i]);
        };
      };
    };
    
    // tick the boxes of the related categories
    try {
      this.selectionModel.selectRecords(selected_records);
      this.selectionModel.resumeEvents();
    } catch(e) {}
  }, this);
  
  if (config.autoLoadStore) {
    config.store.load({params: {start: 0, limit: 1000}});
  };
};
Ext.extend(Ext.ux.MVC.view.HabtmGrid, Ext.grid.GridPanel);
Ext.reg('habtm_grid', Ext.ux.MVC.view.HabtmGrid);

/**
 * Ext.ux.MVC.view.HasManyGrid
 * @extends Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar
 * Provides a simple has_many grid for any given model
 */
Ext.ux.MVC.view.HasManyGrid = function(config) {
  var config = config || {};
  if (!config.model)          {alert("You didn't provide a model to your Has Many Grid class"); return false; };
  // if (!config.has_many_model) {alert("You didn't provide a has_many_model to your Has Many Grid class"); return false; };
  
  Ext.applyIf(config, {
    title: config.model.human_plural_name,
    frame: false,
    height: 300,
    autoLoadStore: false,
    displayToggleEditableButton: false,
    newAction: function() {
      controller = application.getControllerByName(config.model.controller_name);
      controller.viewNew(Ext.applyIf(config.parent_ids, {id: config.id}));
    },
    store: config.model.collectionStore(config.parent_ids)
  });
  
  Ext.ux.MVC.view.HasManyGrid.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.view.HasManyGrid, Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar);
Ext.reg('has_many_grid', Ext.ux.MVC.view.HasManyGrid);

/**
 * Ext.ux.MVC.view.InPlaceHasManyGrid
 * @extends Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar
 * Provides a has_many grid for very simple has_many relationships to allow
 * addition of new relations without leaving the grid
 */
Ext.ux.MVC.view.InPlaceHasManyGrid = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.MVC.view.InPlaceHasManyGrid.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.MVC.view.InPlaceHasManyGrid, Ext.ux.MVC.view.DefaultPagingGridWithTopToolbar);
Ext.reg('in_place_has_many_grid', Ext.ux.MVC.view.InPlaceHasManyGrid);

/**
 * Ext.ux.App.Base
 * @extends Ext.app.Module
 * Description
 */
Ext.ux.App.Base = function(config) {
  var config = config || {};
  
  this.launch = function(launch_config) {
    this.desktop = this.app.getOS();
    this.controller.callAction('index');
  };
  
  Ext.applyIf(config, {
    
  });
  
  Ext.ux.App.Base.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.Base, Ext.app.Module);

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
   * @param {String} viewsPackage An optional package to install views from (Defaults to the Ext.ux.App.MyApp.view package)
   * @param {String} viewNamespace An optional namespace to prepend to the view name (useful if you have two windows with the same name)
   */
  installViews: function(viewsPackage, viewNamespace) {
    var viewsPackage  = viewsPackage  || this.viewsPackage;
    
    //make sure we have a views object first
    this.views = this.views || {};
    
    if (viewsPackage) {
      for (view in eval(viewsPackage)) {
        var viewName = view.toLowerCase();
        if (viewNamespace) {
          viewName = viewNamespace + "_" + viewName;
        }
        
        this.views[viewName] = eval(viewsPackage + "." + view);
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
  callAction : function(name) {
    //strip first argument
    var arguments = this.stripArguments(arguments);
    
    //if this action does not exist, try creating it now.  If that doesn't work, throw an error
    if (!this.actions[name]) {
      var action = this.createDefaultAction(name, arguments);
      if (!action) { throw new Error("Undefined method " + name); }
    };
    
    //call before filters
    if (this.fireEvent(this.actionEventName(name, 'before'))) {
      //need to create a delegate here to call the action with the scope of this
      this.actions[name].createDelegate(this, arguments)();
    }

    //call after filters
    this.fireEvent(this.actionEventName(name, 'after'));
  },
  
  /**
   * Private utility method - removes the first element from an arguments object
   * @param {Arguments Object} An arguments object passed from another function
   * @return {Array} Array of all arguments except for the first
   */
  stripArguments: function(args) {
    var newArgs = [];
    
    for (var i=1; i < args.length; i++) {
      newArgs.push(args[i]);
    };
    
    return newArgs;
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
   * @param {Object} config Additional config which will be passed to the new window's constructor
   * @return {Mixed} The action function if the action was created automatically, false otherwise
   */
  createDefaultAction: function(action_name, config) {
    if (!this.actions[action_name] && this.viewTemplateExists(action_name)) {
      var config = config || {};
      
      //special case - if we are passed an object of length 1, which contains another object,
      //this is almost certainly a config object, so use the first element of the object
      if (config.length == 1 && typeof(config[0] == 'object')) {
        config = config[0];
      };

      //create the action and store it in this.actions for future reuse
      this.actions[action_name] = function() {
        var desktop  = this.app.desktop;
        var windowId = this.namespacedWindowName(action_name);
        
        var win = desktop.getWindow(windowId);
        if (!win) {
          win = desktop.createWindow(Ext.apply({controller: this, id: windowId}, config), this.views[action_name]);
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
    this.actions['edit'] = function(ids, config) {
      var config = config || {};
      var desktop = this.app.desktop;
      
      //load an edit window for each ID
      for (var i = ids.length - 1; i >= 0; i--){
        var windowId = this.namespacedWindowName('edit', {id: ids[i]});
        var win = desktop.getWindow(windowId);
        Ext.applyIf(config, {
          controller: this,
          id:         windowId,
          object_id:  ids[i]
        });

        if (!win) {
          win = desktop.createWindow(config, this.views['edit']);
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
    this.actions['destroy'] = function(one_or_more_ids, config) {
      if (!config) {config = {};};
      
      //call ajax request
      Ext.each(one_or_more_ids, function(id) {
        this.model.destroy(id, config);
      }, this);
    };
  };
  
  //Add events for actions defined in subclass
  this.addFilterListeners();
  
  Ext.ux.App.CrudController.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.App.CrudController, Ext.ux.App.Controller);

/**
 * Ext.ux.App.model
 * @extends Ext.util.Observable
 * Base model class
 */
Ext.ux.App.model = function(fields) {
  if (!this.modelName) {throw new Error("You must provide an underscored model name (e.g. 'my_class')");}
  if (!this.fields)    {throw new Error("You must provide an array of field definitions.  These are passed on exactly to Ext.data.Record");}
  
  var fields = fields || {};
  
  //provide some sensible model defaults
  Ext.applyIf(this, {
    dataAdapter: 'activeResource'
  });
  
  //if this model hasn't yet been defined, define it now
  if (!Ext.ux.App.model.models[this.modelName]) {
    var record = Ext.data.Record.create(this.fields);
    
    Ext.apply(record.prototype, Ext.ux.App.model.RecordExtensions);
  };
  
  var rec = new record(fields);
  rec.init(this);
  
  Ext.apply(this, rec);
};

/**
 * Custom extensions to Ext.data.Record.  These methods are added to new Ext.data.Record objects
 * when you subclass Ext.ux.App.model.
 * For example
 * model = new Ext.ux.MVC.Spec.FakeUser({
 *   id:   100,
 *   name: 'Ed'
 * });
 * alert(model.namespacedUrl('my_url')); // => '/admin/my_url.ext_json'
 */
Ext.ux.App.model.RecordExtensions = {
  /**
   * Adds Ext.ux.App logic on top of Ext.data.Record
   */
  init: function(config) {
    Ext.applyIf(config, {
      //set up the various variations on the model name
      className:      Ext.ux.App.model.classifyName(config.modelName),
      controllerName: Ext.ux.App.model.controllerName(config.modelName),
      foreignKeyName: Ext.ux.App.model.foreignKeyName(config.modelName),
      
      humanPluralName: Ext.ux.App.model.pluralizeHumanName(config.modelName),
      humanSingularName: Ext.ux.App.model.singularizeHumanName(config.modelName),
      
      underscoreName: config.modelName
    });
    
    //add the data adapter, initialize it
    if (config.dataAdapter == 'activeResource') {
      Ext.apply(config, Ext.ux.App.model.ActiveResourceAdapter);
      config.initActiveResource();
    };
    
    //mix in validations package
    Ext.apply(config, Ext.ux.App.model.ValidationExtensions);
    config.initializeValidationExtensions();
    
    Ext.apply(this, config);
  }
};

/**
 * Provides a framework for validating the contents of each field
 */
Ext.ux.App.model.ValidationExtensions = {
  /**
   * Sets up this record's validation parameters
   */
  initializeValidationExtensions: function() {
    this.validations = this.validations || [];
    this.errors = [];
  },
  
  isValid: function() {
    return false;
  }
};

/**
 * Methods adding url data mapping
 */
Ext.ux.App.model.ActiveResourceAdapter = {
  /**
   * Set up the model for use with Active Resource.  Add various url-related properties to the model
   */
  initActiveResource: function() {
    Ext.applyIf(this, {
      urlNamespace: '/admin',
      urlExtension: '.ext_json',
      urlName:      Ext.ux.App.model.urlizeName(this.modelName)
    });
  },
  
  /**
   * Saves this record.  Performs validations first unless you pass false as the single argument
   */
  save: function(performValidations) {
    var performValidations = performValidations || true;
    
    console.log("saving model");
  },
  
  destroy: function(config) {
    var config = config || {};
    
    console.log("destroying model");
  },
  
  /**
   * Loads this record with data from the given ID
   * @param {Number} id The unique ID of the record to load the record data with
   * @param {Boolean} asynchronous False to load the record synchronously (defaults to true)
   */
  load: function(id, asynchronous) {
    var asynchronous = asynchronous || true;
    
    console.log("loading model");
  },
  
  /**
   * URL to retrieve a JSON representation of this model from
   */
  singleDataUrl : function(record_or_id) {
    return this.namespacedUrl(String.format("{0}/{1}", this.urlName, this.data.id));
  },
  
  /**
   * URL to retrieve a JSON representation of the collection of this model from
   * This would typically return the first page of results (see {@link #collectionStore})
   */
  collectionDataUrl : function() {
    return this.namespacedUrl(this.urlName);
  },

  /**
   * URL to retrieve a tree representation of this model from (in JSON format)
   * This is used when populating most of the trees in Ext.ux.MVC, though
   * only applies to models which can be representated as trees
   */
  treeUrl: function() {
    return this.namespacedUrl(String.format("{0}/tree", this.urlName));
  },
  
  /**
   * URL to post details of a drag/drop reorder operation to.  When reordering a tree
   * for a given model, this url is called immediately after the drag event with the
   * new configuration
   * TODO: Provide more info/an example here
   */
  treeReorderUrl: function() {
    return this.namespacedUrl(String.format("{0}/reorder/{1}", this.urlName, this.data.id));
  },
  
  /**
   * Provides a namespaced url for a generic url segment.  Wraps the segment in this.urlNamespace and this.urlExtension
   * @param {String} url The url to wrap
   * @returns {String} The namespaced URL
   */
  namespacedUrl: function(url) {
    return(String.format("{0}/{1}{2}", this.urlNamespace, url, this.urlExtension));
  }
};


Ext.ux.App.model.models = [];

/**
 * Utility methods which don't need to be declared per model
 */
Ext.apply(Ext.ux.App.model, {
  /**
   * String methods:
   */
   
  urlizeName : function(name) {
    return name + 's';
  },
  
  classifyName: function(name) {
    return this.singularizeHumanName(name).replace(/ /g, "");
  },
  
  singularizeHumanName: function(name) {
    return name.replace(/_/g, " ").titleize();
  },
  
  pluralizeHumanName: function(name) {
    return (name + 's').replace(/_/g, " ").titleize();
  },
  
  controllerName : function(name) {
    return this.pluralizeHumanName(name).replace(/ /g, "")  + "Controller";
  },
  
  foreignKeyName: function(name) {
    return name + '_id';
  }
});

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

/**
 * Validation base class - subclass this with your own implementations
 * @param {Ext.data.Record} record The Ext.data.Record or Record subclass to attach this validation to
 */
Ext.ux.App.model.Validation = function(record, fieldName, config) {
  var config = config || {};
  
  this.record    = record;
  this.fieldName = fieldName;  

  //provide default implementations
  Ext.applyIf(config, {
    isValid: function() {
      return true;
    },
    
    /**
     * Gets the current value of this field
     */
    getValue: function() {
      return this.record.data[this.fieldName];
    }
  });
  
  Ext.apply(this, config, {
    /**
     * Override this.init to perform any setup required
     */
    init: Ext.emptyFn
  });
  
  this.init();
};

/**
 * Ext.ux.App.model.PresenceValidation
 * @extends Ext.ux.App.model.Validation
 * Validates the presence of a field
 */
Ext.ux.App.model.PresenceValidation = function(record, fieldName, config) {
  var config = config || {};
    
  Ext.applyIf(config, {
    message: 'must be present',
    
    isValid: function() {
      var value = this.getValue();
      if (typeof(value) == 'undefined') {
        return false;
      } else {
        return (value.length >= 0);
      }
    }
  });
  
  Ext.ux.App.model.PresenceValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.PresenceValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.LengthValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the length of a field is within acceptable boundaries
 */
Ext.ux.App.model.LengthValidation = function(record, fieldName, config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    message: 'is not an acceptable length',
    
    /**
     * Returns false if this field is not within the min and max values of the config object
     */
    isValid: function() {
      //assume an unset value is the same as an empty string
      var value = this.getValue() || '';
      
      if (config.min && value.length < config.min) {
        this.message = 'is too short (minimum length is 5)';
        return false;
      };
      
      if (config.max && value.length > config.max) {
        this.message = 'is too long (maximum length is 10)';
        return false;
      };
      
      return true;
    }
  });
  
  Ext.ux.App.model.LengthValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.LengthValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.NumericalityValidation
 * @extends Ext.ux.App.model.Validation
 * Validates the numericality of a field
 */
Ext.ux.App.model.NumericalityValidation = function(record, fieldName, config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    message: 'must be a number',

    /**
     * Returns true if field is a number
     */
    isValid: function() {
      return (typeof(this.getValue()) == 'number');
    }
  });
  
  Ext.ux.App.model.NumericalityValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.NumericalityValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.InclusionValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the field exactly matches at least one element of an array
 */
Ext.ux.App.model.InclusionValidation = function(record, fieldName, includeValues, config) {
  var config = config || {};
  
  if (!includeValues) {throw new Error("You must provide an array of values to an Inclusion Validation");}
  
  this.includeValues = includeValues;
    
  Ext.applyIf(config, {
    message: 'must be one of ',
    
    /**
     * Returns true if the current value exactly matches at least one element of the values array
     */
    isValid: function() {
      var value = this.getValue();
      
      return this.includeValues.any(function(e) {return e == value;});
    },
    
    /**
     * Sets this.message to a more meaningful message based on the acceptable values
     */
    setMessage: function() {
      if (this.includeValues.length < 5) {
        this.message += this.includeValues.toSentence('or');
      } else {
        this.message += 'the acceptable values';
      };
    },
    
    init: function() {
      this.setMessage();
    }
  });
  
  Ext.ux.App.model.InclusionValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.InclusionValidation, Ext.ux.App.model.Validation);


/**
 * Ext.ux.App.model.ExclusionValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the field does not match any of the supplied elements
 */
Ext.ux.App.model.ExclusionValidation = function(record, fieldName, excludeValues, config) {
  var config = config || {};
  
  if (!excludeValues) {throw new Error("You must provide an array of values to an Exclusion Validation");}
  
  this.excludeValues = excludeValues;
    
  Ext.applyIf(config, {
    message: 'must not be one of ',
    
    /**
     * Returns false if the current value exactly matches at least one element of the values array
     */
    isValid: function() {
      var value = this.getValue();
      
      return !this.excludeValues.any(function(e) {return e == value;});
    },
    
    /**
     * Sets this.message to a more meaningful message based on the unacceptable values
     */
    setMessage: function() {
      if (this.excludeValues.length < 5) {
        this.message += this.excludeValues.toSentence('or');
      } else {
        this.message += 'the unacceptable values';
      };
    },
    
    init: function() {
      this.setMessage();
    }
  });
  
  Ext.ux.App.model.ExclusionValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.ExclusionValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.model.FormatValidation
 * @extends Ext.ux.App.model.Validation
 * Validates that the value of a field matches the passed regular expression
 */
Ext.ux.App.model.FormatValidation = function(record, fieldName, regExp, config) {
  var config = config || {};
  
  if (!regExp) {throw new Error("You must pass a regular expression object or string to a Format Validation");}
  this.regExp = regExp;
  
  Ext.applyIf(config, {
    message: 'is not in the correct format',

    /**
     * Returns true if field is a number
     */
    isValid: function() {
      return this.regExp.test(this.getValue());
    },
    
    /**
     * Ensures that we have a RegExp object in this.regExp
     */
    init: function() {
      if (typeof(this.regExp) == 'string') {
        this.regExp = new RegExp(this.regExp);
      };
      
      if (!this.validRegExp(this.regExp)) {
        throw new Error("Invalid RegExp in Format Validation");
      };
      
      this.setMessage();
    },
    
    /**
     * Override this method to update this.message
     */
    setMessage: Ext.emptyFn,
    
    /**
     * Attempt to find out whether the supplied object is a RegExp
     * @param {object} regExp The object to test
     * @returns {Boolean} True if this object appears to be a RegExp
     */
    validRegExp: function(regExp) {
      return typeof(regExp.test) == 'function';
    }
  });
  
  Ext.ux.App.model.FormatValidation.superclass.constructor.call(this, record, fieldName, config);
};
Ext.extend(Ext.ux.App.model.FormatValidation, Ext.ux.App.model.Validation);

/**
 * Ext.ux.App.view.HABTMTree
 * @extends Ext.Panel
 * Links any model to one or more categories in a tree
 */
Ext.ux.App.view.HABTMTree = function(config) {
  var config = config || {};
  
  if (!config.model)      { throw new Error("You must provide a model to HABTMTree");}
  if (!config.habtmModel) { throw new Error("You must provide a category model to HABTMTree");}
  
  this.model         = config.model;
  this.habtmModel    = config.habtmModel;
  this.objectId      = config.objectId;
  
  this.hiddenField = new Ext.form.Hidden({
    name: this.model.model_name + '[' + this.habtmModel.foreign_key_name + 's]'
  });
  
  Ext.applyIf(config, {
    loaderUrl:  this.defaultLoaderUrl(),
    autoScroll: true,
    treeConfig: {}
  });
  
  this.tree = new Ext.tree.TreePanel(Ext.applyIf(config.treeConfig, {
    rootVisible:     false,
    autoScroll:      true,
    containerScroll: true,
    loader: new Ext.tree.TreeLoader({
      dataUrl:   config.loaderUrl,
      listeners: {
        'load': {
          fn:    this.populateIds,
          scope: this
        }
      }
    })
  }));
  
  this.treeRoot = new Ext.tree.AsyncTreeNode({
    text:      'root',
    draggable: false,
    id:        'source'
  });
  
  this.tree.setRootNode(this.treeRoot);
  
  Ext.applyIf(config, {
    title:     "This " + this.model.human_singular_name + "'s Categories",
    height:    315,
    layout:    'form',
    items:     [this.tree, this.hiddenField],
    bodyStyle: 'background-color: #fff; border: 1px solid #99BBE8; padding: 5px;'
  });
  
  Ext.ux.App.view.HABTMTree.superclass.constructor.call(this, config);
  
  this.treeRoot.expand(false, false, function() {
    // this.treeRoot.firstChild.expand(false);
  });
  
  this.tree.on('checkchange', this.onCheckChange, this);
};
Ext.extend(Ext.ux.App.view.HABTMTree, Ext.Panel, {
  
  /**
   * Copies all selected items from the tree into the hidden field
   */
  populateIds: function() {
    var nodes = this.tree.getChecked();
    var nodeIds = [];
    
    for (var i = nodes.length - 1; i >= 0; i--) {
      nodeIds.push(nodes[i].id);
    };
    
    this.hiddenField.setValue(nodeIds.join(","));
  },
  
  onCheckChange: function(node, checked) {
    if (checked) {
      node.bubble(function(m){
        this.tree.suspendEvents(); 
        if (node != m && m.ui.isChecked() == false) m.ui.toggleCheck();
        this.tree.resumeEvents();
      }, this);
    } else {
      node.cascade(function(m){
        this.tree.suspendEvents(); 
        if (node != m && m.ui.isChecked() == true) m.ui.toggleCheck();
        this.tree.resumeEvents();
      }, this);
    };
    
    this.populateIds();
  },
  
  defaultLoaderUrl: function() {
    throw new Error("You must implement defaultLoaderUrl()");
  }
  
});
Ext.reg('habtm_tree', Ext.ux.App.view.HABTMTree);

/**
 * Ext.ux.App.view.ImageAssociator
 * @extends Ext.Panel
 * Links Images to any model via a join table
 */
Ext.ux.App.view.ImageAssociator = function(config) {
  var config = config || {};
  config.dataViewConfig         = config.dataViewConfig         || {};
  config.imageAssociationConfig = config.imageAssociationConfig || {};
  
  if (!config.model)      { throw new Error("You must provide a model to Ext.ux.App.view.ImageAssociator");};
  if (!config.imageModel) { throw new Error("You must provide an Image model to Ext.ux.App.view.ImageAssociator");};
  if (!config.objectId)   { throw new Error("You must provide an object id to Ext.ux.App.view.ImageAssociator");};
  
  this.model      = config.model;
  this.imageModel = config.imageModel;
  this.objectId   = config.objectId;
  
  Ext.applyIf(config.imageAssociationConfig, {baseUrl: '/admin/image_associations'});
  
  Ext.applyIf(config.imageAssociationConfig, {
    url:      config.imageAssociationConfig.baseUrl + '?id=' + this.objectId + '&type=' + this.model.class_name,
    reader:   this.imageAssociationReader,
    autoLoad: true
  });
  
  this.store = new Ext.data.Store(config.imageAssociationConfig);
  
  this.addButton = new Ext.Button({
    text:    'Add an Image',
    iconCls: 'add',
    scope:   this,
    handler: this.addAction
  });
  
  this.removeButton = new Ext.Button({
    text:     'Remove Selected',
    iconCls:  'cancel',
    scope:    this,
    handler:  this.removeAction,
    disabled: true
  });
  
  this.template = new Ext.XTemplate(
    '<tpl for=".">',
      '<div class="thumb-wrap" id="image-{id}">',
      '<div class="thumb"><img src="{thumb_filename}" class="thumb-img"></div>',
      '<span>{title}</span></div>',
    '</tpl>'
  );
    
  Ext.applyIf(config.dataViewConfig, {
    itemSelector: 'div.thumb-wrap',
    style:        'overflow: auto; background-color: #fff;',
    overClass:    'x-view-over',
    emptyText:    '<p style="padding: 10px">No images to display - drag images here to attach images</p>',
    singleSelect: true,
    multiSelect:  false,
    store:        this.store,
    tpl:          this.template
    // loadingText:  'Loading...'
  });
      
  this.view = new Ext.DataView(config.dataViewConfig);
  
  this.tbar = new Ext.Toolbar({
    items: [this.addButton, '-', this.removeButton]
  });
  
  Ext.applyIf(config, {
    title:      "Images attached to this " + this.model.human_singular_name,
    height:     315,
    tbar:       this.tbar,
    items:      [this.view],
    layout:     'fit',
    autoScroll: true,
    bodyStyle:  'border: 1px solid #99BBE8;'
  });
  
  Ext.ux.App.view.ImageAssociator.superclass.constructor.call(this, config);
  
  this.addEvents({
    'beforeremove':    true,
    'remove':          true,
    'removefailed':    true,
    'beforeassociate': true,
    'associate':       true,
    'associatefailed': true
  });

  this.view.on('render', this.initializeDropZone, this);
  this.on('remove',    function() { this.store.reload(); }, this);  
  this.on('associate', function() { this.store.reload(); }, this);
  
  this.view.on('selectionchange', this.updateRemoveButtonStatus, this);
};

Ext.extend(Ext.ux.App.view.ImageAssociator, Ext.Panel, {
  
  imageAssociationReader: new Ext.data.JsonReader(
    {
      root:          'image_associations',
      totalProperty: 'results'
    },
    [
      {name: 'id',                      type: 'int'},
      {name: 'image_id',                type: 'int'},
      {name: 'image_linked_model_id',   type: 'int'},
      {name: 'image_linked_model_type', type: 'string'},
      {name: 'created_at',              type: 'string'},
      {name: 'updated_at',              type: 'string'},
      {name: 'thumb_filename',          type: 'string', mapping: 'image.thumb_filename'},
      {name: 'title',                   type: 'string', mapping: 'image.title'},
      {name: 'filename',                type: 'string', mapping: 'image.filename'},
      {name: 'image'}
    ]
  ),  
  
  /**
   * 
   */
  addAction: function() {
    Ext.Msg.alert('Use Image Browser', 'Please open up the image browser and drag any images you required into this view');
  },
  
  /**
   * Removes the Data View's currently selected image
   */
  removeAction: function() {
    var assoc = this.currentImageAssociation();    
    if (!assoc) {return;}
    
    var url = this.initialConfig.imageAssociationConfig.baseUrl + '/' + assoc.data.id + '.ext_json';
    
    if (this.fireEvent('beforeremove')) {
      Ext.Ajax.request({
        method: 'post',
        url:    url,
        scope:  this,
        params: '_method=delete',
        success: function(response, options) {
          this.fireEvent('remove', response, options);
        },
        failure: function(response, options) {
          this.fireEvent('removefailed', response, options);
        }
      });
    };
  },
  
  /**
   * Enables or disables the remove button based on whether an image is currently selected.
   * Intended to be attached to the DataView's selectionchange event
   */
  updateRemoveButtonStatus: function(dataview, selections) {
    dataview.getSelectionCount() > 0 ? this.removeButton.enable() : this.removeButton.disable();
  },
  
  /**
   * Returns the record for the currently selected Image, or null if nothing is selected
   */
  currentImageAssociation: function() {
    var image = this.view.getSelectedRecords()[0];
    if (image) {return image;}
  },
  
  /**
   * Sets up the DataView as a drop zone for any image dropped onto it
   */
  initializeDropZone: function() {
    this.dropZone = new Ext.dd.DropZone(this.view.getEl(), {
      
      dataView: this,
      
      /**
       * Updates the drag element's class when drop is allowed
       */
      notifyOver: function(ddSource, e, data) {        
        if (this.canDropOnLocation(ddSource, e, data)) {
          return Ext.dd.DropZone.prototype.dropAllowed;
        } else {
          return Ext.dd.DropZone.prototype.dropNotAllowed;
        };
      },
      
      /**
       * Tell the DataView to associate the image
       */
      notifyDrop: function(ddSource, e, data) {
        e.stopEvent();
        if (this.canDropOnLocation(ddSource, e, data)) {
          this.dataView.associateImage(data.imageData.id);
          
          return true;
        } else {
          return false;
        };
      },
      
      /**
       * Returns true if a drop is allowed here
       */
      canDropOnLocation: function(ddSource, e, data) {
        boo = e;
        
        if (e.getTarget('.x-desktop')) {
          // console.log("over desktop");
          return false;
        };
        
        return data.imageData && data.imageData.id;
        
        //check that we're not currently hovering above a window
        if (e.getTarget('.x-window')) {
          return false;
        };
        
        //check that we're not currently hovering above another icon
        if (e.getTarget('.x-shortcut')) {
          return false;
        };
        
        //if we're hovering over a free shortcut location, all is well
        if (e.getTarget('td.shortcut-position') && this.hasValidShortcutConfig(data)) {
          return true;
        } else {
          return false;
        };
      }
    });
  },
  
  /**
   * Associates the given image ID with this model and objectID
   */
  associateImage: function(id) {
    if (this.fireEvent('beforeassociate')) {
      
      var params =  '&image_association[image_id]=' + id;
      params += '&image_association[image_linked_model_type]=' + this.model.class_name;
      params += '&image_association[image_linked_model_id]=' + this.objectId;
      
      Ext.Ajax.request({
        scope:  this,
        method: 'post',
        url:    '/admin/image_associations',
        params: params,
        success: function() {
          this.fireEvent('associate');
        },
        failure: function() {
          this.fireEvent('associatefailed');
        }
      });
    
    };
  }
});

Ext.reg('image_associator', Ext.ux.App.view.ImageAssociator);

/**
 * Ext.ux.App.TinyMceMethods
 * @extends Ext.util.Observable
 * Mixin setting up Tiny MCE using hooks on DefaultNewWindow and DefaultEditWindow.  Should not be
 * instantiated directly
 */
Ext.ux.App.TinyMceMethods = {
  /**
   * Default config values.  Can be overridden to provide customised options:
   * in your DefaultNewWindow or DefaultEditWindow subclass, after the superclass constructor has been called,
   * override like this:
   * Ext.apply(Ext.ux.App.TinyMceMethods.mceConfig, {
   *   height: 200,
   *   content_css: '/stylesheets/mystylesheet.css',
   *   ... etc
   * })
   */
  mceConfig: {
    mode:             'specific_textareas',
    editor_selector : "mceEditor",
    theme:            "advanced",
    content_css:      "/stylesheets/pages.css",
    body_class:       'content',
    skin :            "o2k7",
    
    width:            "98%",
    height:           400,
    
    plugins : "safari,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,pagebreak",
    theme_advanced_buttons1: 'bold,italic,underline,separator,justifyleft,justifycenter,justifyright,justifyfull,separator,formatselect,fontselect,fontsizeselect,forecolor,styleprops',
    theme_advanced_buttons2: 'cut,copy,paste,pastetext,pasteword,separator,search,replace,separator,bullist,numlist,separator,outdent,indent,separator,undo,redo,separator,anchor,link,unlink,separator,image,code,fullscreen',
    theme_advanced_buttons3:         "",
    verify_html:                     false,
    theme_advanced_toolbar_location: "top",
    theme_advanced_toolbar_align:    "left",
    theme_advanced_disable:          'hr,sub,sup,charmap,removeformat,visualaid',
    //valid_elements :               "a[href|target=_blank],b/strong,br,p,i/em,ol,ul,li,h1,h2,h3,img[src|alt|width|height|style]",
    
    external_link_list_url:           "example_data/example_link_list.js",
    external_image_list_url:          "example_data/example_image_list.js",
    template_external_list_url:       "example_data/example_template_list.js",
    file_browser_callback:            "GoSpin.fileBrowser",
    theme_advanced_resize_horizontal: false,
    apply_source_formatting:          true,
    relative_urls:                    false
  },
   
  /**
   * Creates Tiny MCE instances for all textareas with class 'mceEditor'
   */
  initTinyMce: function() {
    tinyMCE.init(this.mceConfig);
  },
  
  /**
   * Finds all Tiny MCE text areas in this window's form
   */
  findTinyMceTextAreas: function() {
    var items = this.form.items.items;
    var mceEditors = [];
    
    for (var i = items.length - 1; i >= 0; i--){
      var cfg = items[i].initialConfig;
      
      if (cfg.xtype == 'textarea' && cfg.cls == 'mceEditor') {
        mceEditors.push(items[i]);
      };
    };
    
    return mceEditors;
  },
 
  /**
   * Removes all Tiny MCE editors defined in this form.  Intended to be called beforedestroy
   * If we don't do this then Tiny MCE still has a reference to the textarea even after Ext has
   * destroyed it, which can cause bugs and memory leaks.
   */
  removeTinyMceTextAreas: function() {
    var editors = this.findTinyMceTextAreas();
    
    //find each editor's ID and remove it
    for (var i = editors.length - 1; i >= 0; i--){
      var editor = tinyMCE.get(editors[i].id);
      if (editor) {
        tinyMCE.remove(editor);
      };
    };
  }
};

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
      if (this.fireEvent('beforesave')) {
        this.form.form.submit({
          url:     config.url, 
          waitMsg: 'Saving Data...',
          scope:   this,
          
          failure: function() {
            Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + singular + ', please see any fields with red icons');
          },
          
          success: function(formElement, action) {
            Ext.ux.MVC.NotificationManager.inform('The ' + singular + ' was updated successfully');
            if (this.fireEvent('save')) {this.close();}
          }
        });
      };
    },
    
    cancelButtonHandler: function() {
      if (this.fireEvent('beforecancel')) {
        this.close();
        this.fireEvent('cancel');
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

/**
 * Ext.ux.App.view.DefaultEditWindowWithTinyMce
 * @extends Ext.ux.App.view.DefaultEditWindow
 * Sets up hooks for Tiny Mce integration for all textareas with class 'mceEditor'
 */
Ext.ux.App.view.DefaultEditWindowWithTinyMce = function(config) {
  var config = config || {};
  
  Ext.ux.App.view.DefaultEditWindowWithTinyMce.superclass.constructor.call(this, config);
  
  //add the tiny MCE hooks
  this.on('formloaded',    this.initTinyMce);
  this.on('beforesave',    function() { tinyMCE.triggerSave(); });
  this.on('beforedestroy', this.removeTinyMceTextAreas);
};
Ext.extend(Ext.ux.App.view.DefaultEditWindowWithTinyMce, Ext.ux.App.view.DefaultEditWindow, Ext.ux.App.TinyMceMethods);

Ext.reg('default_edit_window_with_tiny_mce', Ext.ux.App.view.DefaultEditWindowWithTinyMce);

/**
 * Ext.ux.MVC.view.DefaultGridContextMenu
 * @extends Ext.menu.Menu
 * Provides a default context menu implementation suitable for most grids
 */
Ext.ux.MVC.view.DefaultGridContextMenu = function(config) {
  var config = config || {};
  
  if (!config.model) { throw new Error("You must provide a model to DefaultGridContextMenu"); }
  if (!config.grid)  { throw new Error("You must provide a grid to DefaultGridContextMenu"); }
  
  Ext.applyIf(config, {
    hasEditMenuItem:   true,
    hasAddMenuItem:    true,
    hasDeleteMenuItem: true,
    items:             []
  });
  
  this.singular = config.model.human_singular_name;
  this.plural   = config.model.human_plural_name;
  
  if (config.hasEditMenuItem) {
    this.editMenuItem = new Ext.menu.Item({
      iconCls: 'edit',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Edit selected " + this.singular
    });
    
    config.items.push(this.editMenuItem);
  };
  
  if (config.hasDeleteMenuItem) {
    this.deleteMenuItem = new Ext.menu.Item({
      iconCls: 'delete',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Delete selected " + this.singular
    });
    
    config.items.push(this.deleteMenuItem);
  };
  
  if (config.hasAddMenuItem) {
    this.addMenuItem = new Ext.menu.Item({
      iconCls: 'add',
      handler: config.editHandler,
      scope:   config.scope,
      text:    "Add a new " + this.singular
    });
    
    config.items.push(this.addMenuItem);
  };
    
  Ext.ux.MVC.view.DefaultGridContextMenu.superclass.constructor.call(this, config);
  
  //update text pluralisation based on number of rows selected
  this.on('beforeshow', this.updateItemText, this);
};

Ext.extend(Ext.ux.MVC.view.DefaultGridContextMenu, Ext.menu.Menu, {
  /**
   * Updates the text on every menu item which requires pluralisation
   */
  updateItemText: function() {
    this.updateEditItemText();
    this.updateDeleteItemText();
  },
  
  /**
   * Updates the text on the edit menu item to provide pluralisation based on the number
   * of selected rows on the grid
   */
  updateEditItemText: function() {
    if (this.editMenuItem) {
      this.editMenuItem.setText(this.singularOrPlural('Edit'));
    };
  },
  
  /**
   * Updates the text on the delete menu item to provide pluralisation based on the number
   * of selected rows on the grid
   */
  updateDeleteItemText: function() {
    if (this.deleteMenuItem) {
      this.deleteMenuItem.setText(this.singularOrPlural('Delete'));
    };
  },
  
  /**
   * Private helper method to return a pluralised menu item text string based on how many
   * grid rows are currently selected
   */
  singularOrPlural: function(action_word) {
    if (this.grid.getSelectionModel().getCount() == 1) {
      return action_word + " selected " + this.singular;
    } else {
      return action_word + " selected " + this.plural;
    };
  }
});

Ext.reg('default_grid_context_menu', Ext.ux.MVC.view.DefaultGridContextMenu);

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
    //Set up a listener to reload the store when the new window is closed
    var config = {      
      listeners: {
        'close': {
          fn: function() {
            this.grid.store.reload();
          },
          scope: this
        }
      }
    };
    
    this.controller.callAction('new', config);
  },
  
  /**
   * Calls the 'edit' action on this Window's controller, passing it an array of 
   * record ids as an argument
   */
  editHandler: function() {
    var ids = this.getSelectedRecordIds();
    
    //Set up a listener to reload the store when the edit window is closed
    var config = {      
      listeners: {
        'close': {
          fn: function() {
            this.grid.store.reload();
          },
          scope: this
        }
      }
    };
    
    this.controller.callAction('edit', ids, config);
  },
  
  /**
   * Calls the 'delete' action on this Window's controller, passing it an array of 
   * record ids as an argument
   */
  deleteHandler: function(config) {
    var ids    = this.getSelectedRecordIds();
    var config = config || {};
    
    var deleteSuccess = this.model.human_singular_name + " successfully deleted";
    
    Ext.applyIf(config, {
      success: function() {
        Ext.ux.MVC.NotificationManager.inform(deleteSuccess);
        this.grid.store.reload();
      },
      scope: this
    });
    
    Ext.Msg.confirm(
      'Delete ' + this.model.human_singular_name,
      'Really delete this ' + this.model.human_singular_name + '? This cannot be undone.',
      function(btn) {
        if (btn == 'yes') {
          this.controller.callAction('destroy', ids, config);
        };
      },
      this
    );
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




//broken attempt at a new version ffs :-/


/**
 * Ext.ux.App.view.DefaultGridWindow
 * @extends Ext.Window
 * Provides sensible default configuration for most paging grid windows
 */
// Ext.ux.App.view.DefaultGridWindow = function(config) {
//   var config = config || {};
//   
//   Ext.applyIf(config, {
//     title:      'Paging Grid',
//     iconCls:    'grid_list',
//     layout:     'fit',
//     height:     480,
//     width:      640,
//     minHeight:  240,
//     minWidth:   320,
//     shim:       false,
//     tools:      [],
//             
//     gridConfig: {}
//   });
//   
//   Ext.applyIf(config, {
//     id: "index_" + config.gridConfig.model.model_name + "_window"
//   });
//   
//   //Convenient way of adding a help tool to the top right of the window
//   if (config.hasHelpTool) {
//     config.tools.push({
//       id:   'help',
//       scope: this,
//       handler: function() {
//         this.controller.callAction('help');
//       }
//     });
//   };
//   
//   if (config.gridConfig.model == null) {
//     throw new Error("Error - no Model supplied to DefaultGridWindow");
//   };
//   
//   Ext.applyIf(config.gridConfig, {
//     controller: this.controller
//   });
//   
//   this.model = config.gridConfig.model;
//   this.grid  = new Ext.ux.App.view.DefaultCrudGrid(config.gridConfig);
//     
//   Ext.apply(config, {
//     items: this.grid,
//     keys: [
//       { key: 'a', scope: this.grid, handler: this.grid.addHandler },
//       { key: 'e', scope: this.grid, handler: this.grid.editHandler },
//       { key: 'd', scope: this.grid, handler: this.grid.deleteHandler },
//       { key: 'f', scope: this.grid, handler: this.grid.firstPage },
//       { key: 'p', scope: this.grid, handler: this.grid.previousPage },
//       { key: 'n', scope: this.grid, handler: this.grid.nextPage },
//       { key: 'l', scope: this.grid, handler: this.grid.lastPage },
//       { key: 'r', scope: this.grid, handler: this.grid.refresh }
//     ]
//   });
//   
//   Ext.ux.App.view.DefaultGridWindow.superclass.constructor.call(this, config);
// };

// Ext.extend(Ext.ux.App.view.DefaultGridWindow, Ext.Window);

// Ext.reg('default_grid_window', Ext.ux.App.view.DefaultGridWindow);

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
      if (this.fireEvent('beforesave')) {
        this.form.form.submit({
          url:     config.url, 
          waitMsg: 'Saving Data...',
          scope:   this,
          
          failure: function() {
            if (!this.fireEvent('savefailed')) {
              Ext.Msg.alert('Operation Failed', 'There were errors saving this ' + singular + ', please see any fields with red icons');
            };
          },
          
          success: function(formElement, action) {
            Ext.ux.MVC.NotificationManager.inform('The ' + singular + ' was created successfully');
            if (this.fireEvent('save')) {this.close();}
          }
        });
      };
    }
  });
    
  Ext.ux.App.view.DefaultNewWindow.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.view.DefaultNewWindow, Ext.ux.App.view.DefaultCrudFormWindow);
Ext.reg('default_new_window', Ext.ux.App.view.DefaultNewWindow);

/**
 * Ext.ux.App.view.DefaultNewWindowWithTinyMce
 * @extends Ext.ux.App.view.DefaultNewWindow
 * Sets up Tiny MCE hooks for all textareas with class 'mceEditor'
 */
Ext.ux.App.view.DefaultNewWindowWithTinyMce = function(config) {
  var config = config || {};
  
  Ext.ux.App.view.DefaultNewWindowWithTinyMce.superclass.constructor.call(this, config);
  
  //add the tiny MCE hooks
  this.on('show',          this.initTinyMce);
  this.on('beforesave',    function() { tinyMCE.triggerSave(); });
  this.on('beforedestroy', this.removeTinyMceTextAreas);
};
Ext.extend(Ext.ux.App.view.DefaultNewWindowWithTinyMce, Ext.ux.App.view.DefaultNewWindow, Ext.ux.App.TinyMceMethods);

Ext.reg('default_new_window_with_tiny_mce', Ext.ux.App.view.DefaultNewWindowWithTinyMce);

/**
 * Ext.ux.App.view.GenericHelpWindow
 * @extends Ext.Window
 * Generic window class with sensible defaults.  Subclass with custom behaviour
 * or instantiate directly with title and html config
 */
Ext.ux.App.view.GenericHelpWindow = function(config) {
  var config = config || {};
  
  this.keyboardShortcuts = 
  
  Ext.applyIf(config, {
    width:       500,
    height:      400,
    iconCls:     'help',
    cls:         'x-window-help',
    shim:        false,
    collapsible: true,
    bodyStyle:   'padding: 10px',
    autoScroll:  true
  });
  
  Ext.ux.App.view.GenericHelpWindow.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.App.view.GenericHelpWindow, Ext.Window);
Ext.reg('user_manager_help', Ext.ux.App.view.GenericHelpWindow);

/**
 * Returns an array of DomSpec tags which enumerate the normal CRUD keyboard shortcuts.
 * @param {Ext.ux.model.Base} model The model this help screen refers to
 * @returns {Array} The array of formatted HTML elements which can be appended to the html config in any panel
 */
Ext.ux.App.view.GenericHelpWindow.keyboardShortcuts = function(model) {
  var singular = model.human_singular_name;
  var plural   = model.human_plural_name;
  
  return [
    {tag: 'h1', html: 'Keyboard shortcuts'},
    {tag: 'p',  html: 'For your convenience, several keyboard shortcuts have been added to this application:'},
    {tag: 'dl', cls: 'shortcuts', 
      children: [
        {tag: 'dt', html: 'f:'}, {tag: 'dd', html: 'Navigate to the first page of ' + plural},
        {tag: 'dt', html: 'p:'}, {tag: 'dd', html: 'Navigate to the previous page of ' + plural},
        {tag: 'dt', html: 'n:'}, {tag: 'dd', html: 'Navigate to the next page of ' + plural},
        {tag: 'dt', html: 'l:'}, {tag: 'dd', html: 'Navigate to the last page of ' + plural},
        {tag: 'dt', html: 'r:'}, {tag: 'dd', html: 'Refresh the current view'},
        {tag: 'dt', html: 'a:'}, {tag: 'dd', html: 'Open the Add ' + singular + ' window'},
        {tag: 'dt', html: 'e:'}, {tag: 'dd', html: 'Edit all currently selected ' + plural},
        {tag: 'dt', html: 'd:'}, {tag: 'dd', html: 'Delete all currently selected ' + plural}
      ]
    },
    {tag: 'p', html: 'Most buttons in each application have keyboard shortcuts.  Try hovering over a button briefly with the mouse - if it has a shortcut button a tooltip will appear telling you what it is'}
  ];
};

