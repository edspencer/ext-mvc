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
    emptyText:    'No images to display',
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
        if (data.imageData && data.imageData.id) {
          return Ext.dd.DropZone.prototype.dropAllowed;
        } else {
          return Ext.dd.DropZone.prototype.dropNotAllowed;
        };
      },
      
      /**
       * Tell the DataView to associate the image
       */
      notifyDrop: function(ddSource, e, data) {
        if (data.imageData && data.imageData.id) {
          this.dataView.associateImage(data.imageData.id);
          
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