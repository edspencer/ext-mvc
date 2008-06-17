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

/**
 * LocalCombo
 * @extends Ext.form.ComboBox
 * @cfg {Object} model The model to attach the combo box to
 * @cfg {Int} id The id of the field to attach the combo box to
 * @cfg {Ext.data.Store} The store to take combobox values from
 *
 * Example Usage:
 * <pre><code>
new LocalCombo({
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
LocalCombo = function(config) {
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
  
  LocalCombo.superclass.constructor.call(this, config);
};
Ext.extend(LocalCombo, Ext.form.ComboBox);
Ext.reg('local_combo_box', LocalCombo);