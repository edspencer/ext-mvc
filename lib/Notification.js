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
    bodyStyle: 'padding: 10px; font-family: verdana; font-size: 14px;'
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