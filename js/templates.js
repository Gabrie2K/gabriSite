"use strict";
/* Minimal templates file (replacement) */

const TPL = {
  Computer: { color: 0x63b3ff, nodes: [ { id: 'root', label: 'Computer', main: true, attrs: [], note: '' } ] },
  Server:   { color: 0xa78bfa, nodes: [ { id: 'root', label: 'Server',   main: true, attrs: [], note: '' } ] },
  Example:  { color: 0x34d399, nodes: [
    { id: 'e1', label: 'Nodo A', main: true, attrs: [{name:'Ho', s:'have'}], note: '' },
    { id: 'e2', label: 'Nodo B', main: false, attrs: [{name:'Voglio', s:'want'}], note: '' }
  ] }
};
