// popup.js - reusable popup logic
(function(window){
  function _qs(id){ return document.getElementById(id); }
  let currentFile = null;

  function openPopup(fileUrl, title, message){
    currentFile = fileUrl;
    const root = _qs('download-popup-root');
    if(!root) return console.warn('popup root not found');
    _qs('popup-title').textContent = title || 'Confirm download';
    _qs('popup-message').textContent = message || 'You are about to download a file. Do you want to continue?';
    root.classList.remove('hidden');
    _qs('popup-modal').setAttribute('aria-hidden','false');
  }

  function closePopup(){
    const root = _qs('download-popup-root');
    if(!root) return;
    root.classList.add('hidden');
    _qs('popup-modal').setAttribute('aria-hidden','true');
    currentFile = null;
  }

  function confirmDownload(){
    if(!currentFile){ closePopup(); return; }
    // create temporary anchor to force download
    const a = document.createElement('a');
    a.href = currentFile;
    // try to set download filename
    const parts = currentFile.split('/');
    a.download = parts[parts.length-1] || '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    closePopup();
  }

  function attachHandlers(){
    const confirm = _qs('popup-confirm');
    const cancel = _qs('popup-cancel');
    const backdrop = _qs('popup-backdrop');
    if(confirm) confirm.addEventListener('click', confirmDownload);
    if(cancel) cancel.addEventListener('click', closePopup);
    if(backdrop) backdrop.addEventListener('click', closePopup);
  }

  // public API
  window.downloadPopup = {
    init: function(){ attachHandlers(); },
    show: function(fileUrl, title, message){ openPopup(fileUrl, title, message); }
  };

  // auto-init when script loads and DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ downloadPopup.init(); });
  } else {
    downloadPopup.init();
  }

})(window);
