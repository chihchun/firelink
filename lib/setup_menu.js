//
// @file 
// @brief
// @author ongaeshi
// @date   2011/04/08

const contextMenu = require("context-menu");
const selection = require("selection");
const SetupCopyItem = require('setup_copy_item');
const SetupLinkFormMenu = require('setup_linkform_menu');
const SetupSettingItem = require('setup_setting_item');
const MenuAction = require("menu_action");

var menuContextPage = null;
var menuContextSelection = null;
var menuContextSelector = null;

function setupIN(rootMenu, context, contentScript, linkformData) {
  // 既に存在していたら削除
  if (rootMenu != null)
    rootMenu.destroy();

  // 子メニューの生成
  var copyItem = SetupCopyItem.create();
  var linkformMenu = SetupLinkFormMenu.create(linkformData);
  var settingItem = SetupSettingItem.create();

  // ルートメニュー
  rootMenu = contextMenu.Menu({
    label: "Fire Link",
    context: context,
    contentScript: contentScript, 
    items: [copyItem, contextMenu.Separator(), linkformMenu, settingItem],
    onMessage: function(msg) {
      var data = msg.data;
      var linkdata = {text:msg.text, title:msg.title, url:msg.url};
      
      if (selection.text)
        linkdata.text = selection.text;
      
      var menuAction = MenuAction.find(data);
      
      if (menuAction)
        menuAction.callback(menuAction, linkdata);
      else
        notify.nl("Error", "Not Found menuAction!!");
    }
  });

  // 結果を返す
  return rootMenu;
}

exports.setupAll = function(linkformData) {
  // メニューコマンドのクリア
  MenuAction.clear();
  
  // メニューの再生成
  menuContextPage = setupIN(menuContextPage,
                            contextMenu.PageContext(),
                            'on("click", function (node, data) { ' +
                            '  postMessage({data:data, text:document.title, title:document.title, url:document.location.href}); ' +
                            '});',
                            linkformData
                           );

  menuContextSelection = setupIN(menuContextSelection,
                                 contextMenu.SelectionContext(),
                                 'on("click", function (node, data) { ' +
                                 '  postMessage({data:data, text:null, title:document.title, url:document.location.href}); ' +
                                 '});',
                                 linkformData
                                );

  menuContextSelector = setupIN(menuContextSelector,
                                contextMenu.SelectorContext('a[href]'),
                                'on("click", function (node, data) { ' +
                                '  postMessage({data:data, text:node.textContent, title:node.textContent, url:node.href}); ' +
                                '});',
                                linkformData
                               );
}


