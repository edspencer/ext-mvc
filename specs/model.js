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
      {name: 'id', type: 'int'},
      {name: 'name', type: 'string'}
    ]
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


describe('An example model', {
  before_each : function() {
    model = new Ext.ux.MVC.Spec.FakeUser({
      id:   100,
      name: 'Ed'
    });
        
    customModel = new Ext.ux.MVC.Spec.CustomisedUser({
      id:    200,
      name: 'Bob'
    });
  },
  
  'should set the className correctly': function() {
    value_of(model.className).should_be('User');
  },
  
  'should allow the className to be set manually': function() {
    value_of(customModel.className).should_be('SpecialUser');
  },
  
  'should set the controller_name correctly': function() {
    value_of(model.controllerName).should_be('UsersController');
  },
  
  'should set the foreign_key_name correctly': function() {
    value_of(customModel.foreignKeyName).should_be('customised_user_id');
  },
  
  'should set the humanPluralName correctly': function() {
    value_of(customModel.humanPluralName).should_be('Customised Users');
  },
  
  'should set the humanSingularName correctly': function() {
    value_of(customModel.humanSingularName).should_be('Customised User');
  },
  
  'should set the underscoreName correctly': function() {
    value_of(customModel.underscoreName).should_be('customised_user');
  }
});

describe('An example model using the ActiveResource data adapter', {
  before_each: function() {
    customModel = new Ext.ux.MVC.Spec.CustomisedUser({
      id:    200,
      name: 'Bob'
    });
  },
  
  'should set the urlName correctly': function() {
    value_of(customModel.urlName).should_be('customised_users');
  },
  
  'should provide a default urlNamespace': function() {
    value_of(customModel.urlNamespace).should_be('/admin');
  },
  
  'should provide a default urlExtension': function() {
    value_of(customModel.urlExtension).should_be('.ext_json');
  },
  
  'should build a generic namespaced url': function() {
    value_of(customModel.namespacedUrl('generic')).should_be('/admin/generic.ext_json');
  },
  
  'should return the correct tree url': function() {
    value_of(customModel.treeUrl()).should_be('/admin/customised_users/tree.ext_json');
  },
  
  'should return the correct tree reorder url': function() {
    value_of(customModel.treeReorderUrl()).should_be('/admin/customised_users/reorder/200.ext_json');
  },
  
  'should return the correct data url for a given object': function() {
    value_of(customModel.singleDataUrl()).should_be('/admin/customised_users/200.ext_json');
  },
  
  'should return the correct data url for the collection': function() {
    value_of(customModel.collectionDataUrl()).should_be('/admin/customised_users.ext_json');
  },
  
  'should return the correct edit url for a given record': function() {
    value_of(AgentPageTemplate.editUrl(record)).should_be('agent_page_templates/Edit/1');
  },
  
  'should return the correct show url for a given record': function() {
    value_of(AgentPageTemplate.showUrl(record)).should_be('agent_page_templates/Edit/1');
  },
  
  'should return the correct new url': function() {
    value_of(AgentPageTemplate.newUrl()).should_be('agent_page_templates/New');
  },
  
  'should return the correct url for the collection': function() {
    value_of(AgentPageTemplate.collectionUrl()).should_be('agent_page_templates/Index');
  }
});


// describe('An example model', {
//   before_each : function() {
//     //fake a record - just an anonymous object with a data.id
//     record = {data: {id: 1}};
//   },
//   
//   'should set the class_name correctly': function() {
//     value_of(AgentPageTemplate.class_name).should_be('AgentPageTemplate');
//   },
//   
//   'should set the controller_name correctly': function() {
//     value_of(AgentPageTemplate.controller_name).should_be('AgentPageTemplatesController');
//   },
//   
//   'should set the foreign_key_name correctly': function() {
//     value_of(AgentPageTemplate.foreign_key_name).should_be('agent_page_template_id');
//   },
//   
//   'should set the parametized foreign_key_name correctly': function() {
//     value_of(AgentPageTemplate.parametized_foreign_key_name).should_be(':agent_page_template_id');
//   },
//   
//   'should set the human_plural_name correctly': function() {
//     value_of(AgentPageTemplate.human_plural_name).should_be('Agent Page Templates');
//   },
//   
//   'should set the human_singular_name correctly': function() {
//     value_of(AgentPageTemplate.human_singular_name).should_be('Agent Page Template');
//   },
//   
//   'should set the underscore_name correctly': function() {
//     value_of(AgentPageTemplate.underscore_name).should_be('agent_page_template');
//   },
//   
//   'should set the url_name correctly': function() {
//     value_of(AgentPageTemplate.url_name).should_be('agent_page_templates');
//   },
//   
//   'should return the correct tree url': function() {
//     value_of(AgentPageTemplate.treeUrl()).should_be('/admin/agent_page_templates/tree.ext_json');
//   },
//   
//   'should return the correct tree reorder url': function() {
//     value_of(AgentPageTemplate.treeReorderUrl(record)).should_be('/admin/agent_page_templates/reorder/1.ext_json');
//   },
//   
//   'should return the correct data url for a given object': function() {
//     value_of(AgentPageTemplate.singleDataUrl(record)).should_be('/admin/agent_page_templates/1.ext_json');
//   },
//   
//   'should return the correct data url for the collection': function() {
//     value_of(AgentPageTemplate.collectionDataUrl()).should_be('/admin/agent_page_templates.ext_json');
//   },
//   
//   'should return the correct edit url for a given record': function() {
//     value_of(AgentPageTemplate.editUrl(record)).should_be('agent_page_templates/Edit/1');
//   },
//   
//   'should return the correct show url for a given record': function() {
//     value_of(AgentPageTemplate.showUrl(record)).should_be('agent_page_templates/Edit/1');
//   },
//   
//   'should return the correct new url': function() {
//     value_of(AgentPageTemplate.newUrl()).should_be('agent_page_templates/New');
//   },
//   
//   'should return the correct url for the collection': function() {
//     value_of(AgentPageTemplate.collectionUrl()).should_be('agent_page_templates/Index');
//   }
// });