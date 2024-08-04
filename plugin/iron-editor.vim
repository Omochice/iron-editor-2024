if exists('g:loaded_iron_editor')
  finish
endif
let g:loaded_iron_editor = 1

let s:save_cpo = &cpo
set cpo&vim

augroup denops_iron_editor
  autocmd!
  autocmd User DenopsPluginPost:iron-editor
      \ command! -nargs=0 IronEditor1 call denops#notify('iron-editor', 'answer1', [])
  autocmd User DenopsPluginPost:iron-editor
      \ command! -nargs=0 IronEditor2 call denops#notify('iron-editor', 'answer2', [])
augroup END

command! -nargs=0 IronEditor1 echomsg "Not loaded yet"
command! -nargs=0 IronEditor2 echomsg "Not loaded yet"

let &cpo = s:save_cpo
unlet s:save_cpo

" vim:set et:
