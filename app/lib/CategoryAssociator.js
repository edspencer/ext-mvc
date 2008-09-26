/**
 * Ext.ux.App.view.CategoryAssociator
 * @extends Ext.Panel
 * Links any model to one or more categories in a tree
 */
Ext.ux.App.view.CategoryAssociator = function(config) {
  var config = config || {};
  
  if (!config.model)         { throw new Error("You must provide a model to CategoryAssociator");}
  if (!config.categoryModel) { throw new Error("You must provide a category model to CategoryAssociator");}
  this.model         = config.model;
  this.categoryModel = config.categoryModel;
  this.objectId      = config.objectId;
  
  this.hiddenField = new Ext.form.Hidden({
    name: this.model.model_name + '[category_ids]'
  });
  
  Ext.applyIf(config, {
    loaderUrl: this.defaultLoaderUrl()
  });
  
  this.tree = new Ext.tree.TreePanel({
    rootVisible:     false,
    autoScroll:      true,
    containerScroll: true,
    loader: new Ext.tree.TreeLoader({
      dataUrl:   config.loaderUrl,
      listeners: {
        'load': {
          fn:    this.populateCategoryIds,
          scope: this
        }
      }
    })
  });
  
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
    bodyStyle: 'background-color: #fff; border: 1px solid #99BBE8;'
  });
  
  Ext.ux.App.view.CategoryAssociator.superclass.constructor.call(this, config);
  
  this.treeRoot.expand(false, false, function() {
    // this.treeRoot.firstChild.expand(false);
  });
  
  this.tree.on('checkchange', this.onCheckChange, this);
};
Ext.extend(Ext.ux.App.view.CategoryAssociator, Ext.Panel, {
  
  /**
   * Copies all selected items from the tree into the hidden field
   */
  populateCategoryIds: function() {
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
    
    this.populateCategoryIds();
  },
  
  defaultLoaderUrl: function() {
    if (this.objectId) {
      return this.categoryModel.treeUrl() + '?checked=true&associated_model=' + this.model.model_name + '&associated_id=' + this.objectId;
    } else {
      return this.categoryModel.treeUrl() + '?checked=true';
    };
  }
  
});
Ext.reg('category_associator', Ext.ux.App.view.CategoryAssociator);