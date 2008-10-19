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
