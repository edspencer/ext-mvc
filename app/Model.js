/**
 * Ext.ux.App.model
 * @extends Ext.util.Observable
 * Base model class
 */
Ext.ux.App.model = function(fields) {
  if (!this.modelName) {throw new Error("You must provide an underscored model name (e.g. 'my_class')");}
  if (!this.fields)    {throw new Error("You must provide an array of field definitions.  These are passed on exactly to Ext.data.Record");}
  
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
    
    Ext.apply(this, config);
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
  
  save: function() {
    
  },
  
  destroy: function() {
    
  },
  
  /**
   * Loads this record with data from the given ID
   * @param {Number} id The unique ID of the record to load the record data with
   */
  load: function(id) {
    
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