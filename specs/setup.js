Ext.ns("Ext.ux.MVC.Spec");

/**
 * Ext.ux.MVC.Spec.FakeUser
 * @extends Ext.ux.App.model
 * User model
 */
Ext.ux.MVC.Spec.FakeUser = function(fields) {
  
  Ext.applyIf(this, {
    modelName: 'user',
    fields: [
      {name: 'id',   type: 'int'},
      {name: 'name', type: 'string'}
    ],
    validatesPresenceOf: ['id', 'name'],
    validatesLengthOf:   ['name', {min: 2, max: 10}]
  });
  
 Ext.ux.MVC.Spec.FakeUser.superclass.constructor.call(this, fields);
};
Ext.extend(Ext.ux.MVC.Spec.FakeUser, Ext.ux.App.model);

/**
 * Ext.ux.MVC.Spec.CustomisedUser
 * @extends Ext.ux.App.model
 * User model with various attributes configured diffently to default
 */
Ext.ux.MVC.Spec.CustomisedUser = function(fields) {
  Ext.apply(this, {
    modelName:  'customised_user',
    className:  'SpecialUser',
    fields:     [
      {name: 'id', type: 'int'}
    ]
  });
  
  Ext.ux.MVC.Spec.CustomisedUser.superclass.constructor.call(this, fields);
};
Ext.extend(Ext.ux.MVC.Spec.CustomisedUser, Ext.ux.App.model);



/**
 * BELOW HERE IS PROBABLY DEFUNCT
 */


// Define a new model and test that the various methods work correctly
AgentPageTemplate = new Ext.ux.MVC.model.Base('agent_page_template', {
  fields: [{name: 'id', type: 'int'}]
});

// mock some views
AgentPageTemplateIndexPanel = {};
AgentPageTemplateEditPanel  = {};
AgentPageTemplateNewPanel   = {};

// stub out a layout manager
Ext.ux.MVC.LayoutManager.LeftMenuLayoutManager = function() {
  this.initialize = function() {
    return true;
  };
};

application = new Application();

// set up a corresponding controller for the model above
AgentPageTemplatesController = Ext.extend(Ext.ux.MVC.controller.CrudController, {
  constructor: function(config) {
    AgentPageTemplatesController.superclass.constructor.call(this, {
      model      : AgentPageTemplate, 
      indexPanel : AgentPageTemplateIndexPanel,
      editPanel  : AgentPageTemplateEditPanel,
      newPanel   : AgentPageTemplateNewPanel
    });
  }
});

var controller = new AgentPageTemplatesController();


/**
 * User
 * @extends Ext.ux.App.model
 * Example model class
 */
User = function(config) {
  var config = config || {};
  
  Ext.applyIf(config, {
    fields: ['email', 'first_name', 'last_name']
  });
  
  User.superclass.constructor.call(this, config);
};
Ext.extend(User, Ext.ux.App.model);